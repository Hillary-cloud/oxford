<?php

namespace App\Http\Controllers;

use App\Models\ClassSection;
use App\Models\FeePayment;
use App\Models\FeeType;
use App\Models\AcademicSession;
use App\Models\Term;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FeeReportController extends Controller
{
    public function index(Request $request)
    {
        $sessionId = $request->session_id;
        $termId    = $request->term_id;

        $query = FeePayment::query();
        if ($sessionId) $query->where('academic_session_id', $sessionId);
        if ($termId)    $query->where('term_id', $termId);

        // Summary stats
        $totalCollected   = (float) $query->clone()->sum('amount_paid');
        $totalOutstanding = (float) $query->clone()->where('status', '!=', 'paid')->sum('balance');
        $totalExpected    = (float) $query->clone()->sum('total_amount');

        // By fee type
        $byFeeType = $query->clone()
            ->select('fee_type_id', DB::raw('SUM(amount_paid) as collected'), DB::raw('SUM(balance) as outstanding'), DB::raw('COUNT(*) as count'))
            ->with('feeType:id,name,amount')
            ->groupBy('fee_type_id')
            ->get()
            ->map(fn($r) => [
                'fee_name'    => $r->feeType?->name ?? 'Unknown',
                'collected'   => (float) $r->collected,
                'outstanding' => (float) $r->outstanding,
                'count'       => $r->count,
            ]);

        // By class stats (status breakdown)
        $byClass = FeePayment::select(
                'school_classes.name as class_name',
                'class_arms.name as arm_name',
                DB::raw('SUM(fee_payments.amount_paid) as collected'),
                DB::raw('SUM(fee_payments.balance) as outstanding'),
                DB::raw('COUNT(fee_payments.id) as count'),
                DB::raw("SUM(CASE WHEN fee_payments.status = 'paid' THEN 1 ELSE 0 END) as paid_count"),
                DB::raw("SUM(CASE WHEN fee_payments.status = 'partial' THEN 1 ELSE 0 END) as partial_count"),
                DB::raw("SUM(CASE WHEN fee_payments.status = 'pending' THEN 1 ELSE 0 END) as pending_count")
            )
            ->join('students', 'students.id', '=', 'fee_payments.student_id')
            ->join('class_sections', 'class_sections.id', '=', 'students.class_section_id')
            ->join('school_classes', 'school_classes.id', '=', 'class_sections.school_class_id')
            ->join('class_arms', 'class_arms.id', '=', 'class_sections.class_arm_id')
            ->when($sessionId, fn($q) => $q->where('fee_payments.academic_session_id', $sessionId))
            ->when($termId,    fn($q) => $q->where('fee_payments.term_id', $termId))
            ->groupBy('school_classes.name', 'class_arms.name')
            ->orderByDesc('collected')
            ->get()
            ->map(fn($r) => [
                'class_name'    => $r->class_name . ' ' . $r->arm_name,
                'collected'     => (float) $r->collected,
                'outstanding'   => (float) $r->outstanding,
                'paid_count'    => (int) $r->paid_count,
                'partial_count' => (int) $r->partial_count,
                'pending_count' => (int) $r->pending_count,
            ]);

        // Collection by Bank Method (School Account)
        $byBankMethod = DB::table('payment_items')
            ->leftJoin('school_accounts', 'school_accounts.id', '=', 'payment_items.school_account_id')
            ->join('fee_payments', 'fee_payments.id', '=', 'payment_items.fee_payment_id')
            ->select(
                'school_accounts.name as account_name',
                'school_accounts.bank_name',
                'payment_items.payment_method',
                DB::raw('SUM(payment_items.amount) as total')
            )
            ->when($sessionId, fn($q) => $q->where('fee_payments.academic_session_id', $sessionId))
            ->when($termId,    fn($q) => $q->where('fee_payments.term_id', $termId))
            ->groupBy('school_accounts.name', 'school_accounts.bank_name', 'payment_items.payment_method')
            ->get();

        // Monthly trend (current year)
        $monthly = FeePayment::selectRaw('MONTH(payment_date) as month_num, SUM(amount_paid) as total')
            ->whereYear('payment_date', now()->year)
            ->when($sessionId, fn($q) => $q->where('academic_session_id', $sessionId))
            ->groupBy('month_num')
            ->orderBy('month_num')
            ->get()
            ->map(fn($r) => [
                'month' => date('M', mktime(0, 0, 0, $r->month_num, 1)),
                'total' => (float) $r->total,
            ]);

        // Outstanding students (partial/pending)
        $outstanding = FeePayment::with(['student.classSection.schoolClass', 'feeType'])
            ->where('status', '!=', 'paid')
            ->when($sessionId, fn($q) => $q->where('academic_session_id', $sessionId))
            ->when($termId,    fn($q) => $q->where('term_id', $termId))
            ->orderByDesc('balance')
            ->limit(50)
            ->get()
            ->map(fn($p) => [
                'id'           => $p->id,
                'student_id'   => $p->student_id,
                'student_name' => $p->student->surname . ' ' . $p->student->othername,
                'reg_number'   => $p->student->registration_number,
                'class_name'   => ($p->student->classSection?->schoolClass?->name ?? '') . ' ' . ($p->student->classSection?->name ?? ''),
                'fee_name'     => $p->feeType->name,
                'total_amount' => $p->total_amount,
                'amount_paid'  => $p->amount_paid,
                'balance'      => $p->balance,
                'status'       => $p->status,
            ]);

        return Inertia::render('Fees/Reports/Index', [
            'summary' => [
                'total_collected'   => $totalCollected,
                'total_outstanding' => $totalOutstanding,
                'total_expected'    => $totalExpected,
                'collection_rate'   => $totalExpected > 0 ? round(($totalCollected / $totalExpected) * 100, 1) : 0,
            ],
            'byFeeType'    => $byFeeType,
            'byClass'      => $byClass,
            'byBankMethod' => $byBankMethod,
            'outstanding'  => $outstanding,
            'sessions'     => AcademicSession::orderBy('name')->get(['id', 'name']),
            'terms'        => Term::orderBy('name')->get(['id', 'name', 'academic_session_id']),
            'filters'      => $request->only(['session_id', 'term_id']),
        ]);
    }

    /**
     * Export payments as CSV.
     */
    public function export(Request $request)
    {
        $sessionId = $request->session_id;
        $termId    = $request->term_id;

        $payments = FeePayment::with(['student.classSection.schoolClass', 'feeType', 'academicSession', 'term'])
            ->when($sessionId, fn($q) => $q->where('academic_session_id', $sessionId))
            ->when($termId,    fn($q) => $q->where('term_id', $termId))
            ->orderBy('payment_date', 'desc')
            ->get();

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="fees-report-' . now()->format('Y-m-d') . '.csv"',
        ];

        $callback = function () use ($payments) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Receipt #', 'Student Name', 'Reg. Number', 'Class', 'Fee', 'Session', 'Term', 'Total', 'Amount Paid', 'Balance', 'Status', 'Date']);
            foreach ($payments as $p) {
                fputcsv($handle, [
                    $p->receipt_number,
                    $p->student->surname . ' ' . $p->student->othername,
                    $p->student->registration_number,
                    ($p->student->classSection?->schoolClass?->name ?? '') . ' ' . ($p->student->classSection?->name ?? ''),
                    $p->feeType->name,
                    $p->academicSession->name,
                    $p->term?->name ?? '',
                    $p->total_amount,
                    $p->amount_paid,
                    $p->balance,
                    $p->status,
                    $p->payment_date->format('Y-m-d'),
                ]);
            }
            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }
}
