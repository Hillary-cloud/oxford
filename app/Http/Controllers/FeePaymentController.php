<?php

namespace App\Http\Controllers;

use App\Models\AcademicSession;
use App\Models\ClassSection;
use App\Models\FeePayment;
use App\Models\FeeType;
use App\Models\PaymentItem;
use App\Models\SchoolAccount;
use App\Models\Student;
use App\Models\GeneralSetting;
use App\Models\Term;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class FeePaymentController extends Controller
{
    /**
     * Fees overview dashboard.
     */
    public function dashboard()
    {
        $totalCollected  = FeePayment::sum('amount_paid');
        $totalOutstanding = FeePayment::where('status', '!=', 'paid')->sum('balance');
        $totalPayments   = FeePayment::count();
        $paidCount       = FeePayment::where('status', 'paid')->count();
        $partialCount    = FeePayment::where('status', 'partial')->count();
        $pendingCount    = FeePayment::where('status', 'pending')->count();

        // Recent payments
        $recentPayments = FeePayment::with(['student', 'feeType'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn($p) => [
                'id'             => $p->id,
                'receipt_number' => $p->receipt_number,
                'student_name'   => $p->student->surname . ' ' . $p->student->othername,
                'fee_name'       => $p->feeType->name,
                'amount_paid'    => $p->amount_paid,
                'balance'        => $p->balance,
                'status'         => $p->status,
                'payment_date'   => $p->payment_date->format('Y-m-d'),
            ]);

        // Collection by fee type
        $byFeeType = FeePayment::select('fee_type_id', DB::raw('SUM(amount_paid) as total'))
            ->with('feeType:id,name')
            ->groupBy('fee_type_id')
            ->get()
            ->map(fn($r) => [
                'fee_name' => $r->feeType?->name ?? 'Unknown',
                'total'    => (float) $r->total,
            ]);

        // Monthly collection (current year)
        $monthly = FeePayment::selectRaw('MONTH(payment_date) as month, SUM(amount_paid) as total')
            ->whereYear('payment_date', now()->year)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn($r) => [
                'month' => date('M', mktime(0, 0, 0, $r->month, 1)),
                'total' => (float) $r->total,
            ]);

        return Inertia::render('Fees/Index', [
            'stats' => [
                'total_collected'   => (float) $totalCollected,
                'total_outstanding' => (float) $totalOutstanding,
                'total_payments'    => $totalPayments,
                'paid_count'        => $paidCount,
                'partial_count'     => $partialCount,
                'pending_count'     => $pendingCount,
            ],
            'recentPayments' => $recentPayments,
            'byFeeType'      => $byFeeType,
            'monthly'        => $monthly,
        ]);
    }

    /**
     * Payments list / ledger.
     */
    public function index(Request $request)
    {
        $query = FeePayment::with(['student', 'feeType', 'paymentItems.schoolAccount'])
            ->orderBy('payment_date', 'desc');

        if ($request->student_id) {
            $query->where('student_id', $request->student_id);
        }
        if ($request->fee_type_id) {
            $query->where('fee_type_id', $request->fee_type_id);
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->session_id) {
            $query->where('academic_session_id', $request->session_id);
        }
        if ($request->term_id) {
            $query->where('term_id', $request->term_id);
        }
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('receipt_number', 'like', "%{$search}%")
                  ->orWhereHas('student', fn($sq) => $sq->where('surname', 'like', "%{$search}%")
                      ->orWhere('othername', 'like', "%{$search}%")
                      ->orWhere('registration_number', 'like', "%{$search}%"));
            });
        }

        $payments = $query->paginate(30)->through(fn($p) => [
            'id'             => $p->id,
            'receipt_number' => $p->receipt_number,
            'student'        => [
                'id'   => $p->student->id,
                'name' => $p->student->surname . ' ' . $p->student->othername,
                'reg'  => $p->student->registration_number,
            ],
            'fee_name'       => $p->feeType->name,
            'fee_type_id'    => $p->fee_type_id,
            'total_amount'   => $p->total_amount,
            'amount_paid'    => $p->amount_paid,
            'balance'        => $p->balance,
            'status'         => $p->status,
            'payment_date'   => $p->payment_date->format('Y-m-d'),
            'methods'        => $p->paymentItems->map(fn($i) => $i->payment_method)->unique()->values(),
        ]);

        return Inertia::render('Fees/Payments/Index', [
            'payments'         => $payments,
            'feeTypes'         => FeeType::active()->orderBy('name')->get(['id', 'name']),
            'sessions'         => AcademicSession::orderBy('name')->get(['id', 'name']),
            'terms'            => Term::orderBy('name')->get(['id', 'name', 'academic_session_id']),
            'filters'          => $request->only(['student_id', 'fee_type_id', 'status', 'session_id', 'term_id', 'search']),
        ]);
    }

    /**
     * Show the payment recording form.
     */
    public function create(Request $request)
    {
        $student = null;
        $existingBalance = null;

        if ($request->student_id) {
            $student = Student::with('classSection.schoolClass')->find($request->student_id);
            // If recording a follow-up payment on a partial fee, get that payment's balance
            if ($request->fee_payment_id) {
                $existingPayment = FeePayment::find($request->fee_payment_id);
                $existingBalance = $existingPayment ? [
                    'id'           => $existingPayment->id,
                    'fee_name'     => $existingPayment->feeType->name,
                    'total_amount' => $existingPayment->total_amount,
                    'amount_paid'  => $existingPayment->amount_paid,
                    'balance'      => $existingPayment->balance,
                ] : null;
            }
        }

        return Inertia::render('Fees/Payments/Record', [
            'feeTypes'         => FeeType::active()->with('assignments')->orderBy('name')->get(['id', 'name', 'amount', 'is_recurring', 'recurring_interval']),
            'sessions'         => AcademicSession::orderBy('name')->get(['id', 'name']),
            'terms'            => Term::orderBy('name')->get(['id', 'name', 'academic_session_id']),
            'accounts'         => SchoolAccount::active()->orderBy('name')->get(['id', 'name', 'account_type', 'bank_name', 'account_number']),
            'classSections'    => ClassSection::with('schoolClass')->get()->map(fn($cs) => [
                'id'   => $cs->id,
                'name' => ($cs->schoolClass?->name ?? '') . ' ' . $cs->name,
            ]),
            'preselectedStudent'  => $student ? [
                'id'   => $student->id,
                'name' => $student->surname . ' ' . $student->othername,
                'reg'  => $student->registration_number,
            ] : null,
            'existingBalance'  => $existingBalance,
        ]);
    }

    /**
     * Record a payment (new or follow-up).
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'student_id'          => 'required|exists:students,id',
            'fee_type_id'         => 'required|exists:fee_types,id',
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'term_id'             => 'nullable|exists:terms,id',
            'payment_date'        => 'required|date',
            'notes'               => 'nullable|string',
            'fee_payment_id'      => 'nullable|exists:fee_payments,id', // for follow-up payments
            // Payment items
            'payment_items'              => 'required|array|min:1',
            'payment_items.*.method'     => 'required|in:cash,transfer,pos,bank_teller',
            'payment_items.*.amount'     => 'required|numeric|min:0.01',
            'payment_items.*.account_id' => 'nullable|exists:school_accounts,id',
            'payment_items.*.reference'  => 'nullable|string|max:100',
            'payment_items.*.notes'      => 'nullable|string|max:255',
        ]);

        // Validate that non-cash items have an active account
        foreach ($data['payment_items'] as $item) {
            if ($item['method'] !== 'cash') {
                if (empty($item['account_id'])) {
                    return back()->withErrors(['payment_items' => "Account is required for {$item['method']} payment."]);
                }
                
                $account = SchoolAccount::find($item['account_id']);
                if (!$account || !$account->is_active) {
                    return back()->withErrors(['payment_items' => "The selected account \"{$account?->name}\" is inactive and cannot accept new payments."]);
                }
            }
        }

        $feeType = FeeType::findOrFail($data['fee_type_id']);
        $totalItemAmount = collect($data['payment_items'])->sum('amount');

        DB::transaction(function () use ($data, $feeType, $totalItemAmount) {
            if (!empty($data['fee_payment_id'])) {
                // Follow-up/top-up on an existing partial payment
                $payment = FeePayment::findOrFail($data['fee_payment_id']);

                if ($payment->status === 'paid') {
                    abort(422, 'This fee is already fully paid.');
                }

                $newAmountPaid = (float) $payment->amount_paid + $totalItemAmount;
                $newBalance    = max(0, (float) $payment->total_amount - $newAmountPaid);
                $newStatus     = $newBalance <= 0 ? 'paid' : 'partial';

                $payment->update([
                    'amount_paid' => $newAmountPaid,
                    'balance'     => $newBalance,
                    'status'      => $newStatus,
                    'payment_date' => $data['payment_date'],
                    'notes'       => $data['notes'],
                ]);

                $this->createPaymentItems($payment->id, $data['payment_items']);
            } else {
                // Brand new payment
                $totalFee  = (float) $feeType->amount;
                $balance   = max(0, $totalFee - $totalItemAmount);
                $status    = $balance <= 0 ? 'paid' : ($totalItemAmount > 0 ? 'partial' : 'pending');

                $payment = FeePayment::create([
                    'receipt_number'      => FeePayment::generateReceiptNumber(),
                    'student_id'          => $data['student_id'],
                    'fee_type_id'         => $data['fee_type_id'],
                    'academic_session_id' => $data['academic_session_id'],
                    'term_id'             => $data['term_id'] ?? null,
                    'total_amount'        => $totalFee,
                    'amount_paid'         => $totalItemAmount,
                    'balance'             => $balance,
                    'status'              => $status,
                    'payment_date'        => $data['payment_date'],
                    'notes'               => $data['notes'] ?? null,
                    'created_by'          => auth()->id(),
                ]);

                $this->createPaymentItems($payment->id, $data['payment_items']);
            }
        });

        return redirect()->route('fees.payments.index')->with('success', 'Payment recorded successfully.');
    }

    private function createPaymentItems(string $paymentId, array $items): void
    {
        foreach ($items as $item) {
            PaymentItem::create([
                'fee_payment_id'  => $paymentId,
                'payment_method'  => $item['method'],
                'amount'          => $item['amount'],
                'school_account_id' => $item['account_id'] ?? null,
                'reference_number'  => $item['reference'] ?? null,
                'notes'           => $item['notes'] ?? null,
            ]);
        }
    }

    /**
     * Payment detail view.
     */
    public function show(FeePayment $payment)
    {
        $payment->load(['student.classSection.schoolClass', 'feeType', 'paymentItems.schoolAccount', 'academicSession', 'term', 'creator']);

        return Inertia::render('Fees/Payments/Show', [
            'payment' => [
                'id'             => $payment->id,
                'receipt_number' => $payment->receipt_number,
                'student'        => [
                    'id'           => $payment->student->id,
                    'name'         => $payment->student->surname . ' ' . $payment->student->othername,
                    'reg'          => $payment->student->registration_number,
                    'class'        => ($payment->student->classSection?->schoolClass?->name ?? '') . ' ' . ($payment->student->classSection?->name ?? ''),
                    'gender'       => $payment->student->gender,
                ],
                'fee_name'            => $payment->feeType->name,
                'fee_description'     => $payment->feeType->description,
                'academic_session'    => $payment->academicSession->name,
                'term'                => $payment->term?->name,
                'total_amount'        => $payment->total_amount,
                'amount_paid'         => $payment->amount_paid,
                'balance'             => $payment->balance,
                'status'              => $payment->status,
                'payment_date'        => $payment->payment_date->format('Y-m-d'),
                'notes'               => $payment->notes,
                'created_by'          => $payment->creator?->name,
                'created_at'          => $payment->created_at->format('Y-m-d H:i'),
                'payment_items'       => $payment->paymentItems->map(fn($i) => [
                    'id'               => $i->id,
                    'payment_method'   => $i->payment_method,
                    'amount'           => $i->amount,
                    'account_name'     => $i->schoolAccount?->name,
                    'bank_name'        => $i->schoolAccount?->bank_name,
                    'account_number'   => $i->schoolAccount?->account_number,
                    'reference_number' => $i->reference_number,
                    'notes'            => $i->notes,
                ]),
            ],
        ]);
    }

    /**
     * Printable receipt.
     */
    public function receipt(FeePayment $payment)
    {
        $payment->load(['student.classSection.schoolClass', 'feeType', 'paymentItems.schoolAccount', 'academicSession', 'term']);

        $identity = GeneralSetting::get('school_identity');

        return Inertia::render('Fees/Payments/Receipt', [
            'payment' => [
                'id'             => $payment->id,
                'receipt_number' => $payment->receipt_number,
                'student'        => [
                    'name'  => $payment->student->surname . ' ' . $payment->student->othername,
                    'reg'   => $payment->student->registration_number,
                    'class' => ($payment->student->classSection?->schoolClass?->name ?? '') . ' ' . ($payment->student->classSection?->name ?? ''),
                    'gender' => $payment->student->gender,
                ],
                'fee_name'         => $payment->feeType->name,
                'academic_session' => $payment->academicSession->name,
                'term'             => $payment->term?->name,
                'total_amount'     => $payment->total_amount,
                'amount_paid'      => $payment->amount_paid,
                'balance'          => $payment->balance,
                'status'           => $payment->status,
                'payment_date'     => $payment->payment_date->format('d M, Y'),
                'payment_items'    => $payment->paymentItems->map(fn($i) => [
                    'payment_method'   => $i->payment_method,
                    'amount'           => $i->amount,
                    'account_name'     => $i->schoolAccount?->name,
                    'bank_name'        => $i->schoolAccount?->bank_name,
                    'reference_number' => $i->reference_number,
                ]),
            ],
            'schoolName'    => $identity['school_name'] ?? 'School Name',
            'schoolAddress' => $identity['school_address'] ?? '',
            'schoolPhone'   => $identity['school_phone'] ?? '',
            'schoolEmail'   => $identity['school_email'] ?? '',
            'logoUrl'       => !empty($identity['logo']) ? asset('storage/' . $identity['logo']) : null,
        ]);
    }

    /**
     * All payments for a specific student (ledger).
     */
    public function studentLedger(Student $student)
    {
        $payments = FeePayment::with(['feeType', 'paymentItems', 'term', 'academicSession'])
            ->where('student_id', $student->id)
            ->orderBy('payment_date', 'desc')
            ->get()
            ->map(fn($p) => [
                'id'             => $p->id,
                'receipt_number' => $p->receipt_number,
                'fee_name'       => $p->feeType->name,
                'session'        => $p->academicSession->name,
                'term'           => $p->term?->name,
                'total_amount'   => $p->total_amount,
                'amount_paid'    => $p->amount_paid,
                'balance'        => $p->balance,
                'status'         => $p->status,
                'payment_date'   => $p->payment_date->format('Y-m-d'),
            ]);

        return Inertia::render('Fees/Payments/StudentLedger', [
            'student' => [
                'id'   => $student->id,
                'name' => $student->surname . ' ' . $student->othername,
                'reg'  => $student->registration_number,
            ],
            'payments'       => $payments,
            'total_paid'     => $payments->sum('amount_paid'),
            'total_balance'  => $payments->sum('balance'),
        ]);
    }
}
