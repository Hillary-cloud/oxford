<?php

namespace App\Http\Controllers;

use App\Models\AcademicSession;
use App\Models\FeeAssignment;
use App\Models\FeeGroup;
use App\Models\FeeType;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Term;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeeTypeController extends Controller
{
    public function index()
    {
        $feeTypes = FeeType::with([
            'academicSession',
            'term',
            'assignments.schoolClass',
            'assignments.student',
            'assignments.feeGroup',
        ])
        ->withCount('payments')
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($fee) {
            return [
                'id'                 => $fee->id,
                'name'               => $fee->name,
                'description'        => $fee->description,
                'amount'             => $fee->amount,
                'is_recurring'       => $fee->is_recurring,
                'recurring_interval' => $fee->recurring_interval,
                'due_date'           => $fee->due_date?->format('Y-m-d'),
                'is_active'          => $fee->is_active,
                'academic_session'   => $fee->academicSession?->only('id', 'name'),
                'term'               => $fee->term?->only('id', 'name'),
                'payments_count'     => $fee->payments_count,
                'total_collected'    => $fee->totalCollected(),
                'assignments'        => $fee->assignments->map(fn($a) => [
                    'id'          => $a->id,
                    'target_type' => $a->target_type,
                    'label'       => $a->target_label,
                    'gender'      => $a->gender,
                    'school_class_id' => $a->school_class_id,
                    'student_id'      => $a->student_id,
                    'fee_group_id'    => $a->fee_group_id,
                ]),
            ];
        });

        return Inertia::render('Fees/FeeTypes/Index', [
            'feeTypes'         => $feeTypes,
            'academicSessions' => AcademicSession::orderBy('name')->get(['id', 'name']),
            'terms'            => Term::orderBy('name')->get(['id', 'name', 'academic_session_id']),
            'classes'          => SchoolClass::orderBy('name')->get(['id', 'name']),
            'feeGroups'        => FeeGroup::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'                => 'required|string|max:255',
            'description'         => 'nullable|string',
            'amount'              => 'required|numeric|min:0',
            'is_recurring'        => 'boolean',
            'recurring_interval'  => 'nullable|in:termly,monthly,annually',
            'academic_session_id' => 'nullable|exists:academic_sessions,id',
            'term_id'             => 'nullable|exists:terms,id',
            'due_date'            => 'nullable|date',
            'is_active'           => 'boolean',
        ]);

        $data['created_by'] = auth()->id();

        $feeType = FeeType::create($data);

        return back()->with('success', 'Fee type created.')->with('new_fee_id', $feeType->id);
    }

    public function update(Request $request, FeeType $feeType)
    {
        $data = $request->validate([
            'name'                => 'required|string|max:255',
            'description'         => 'nullable|string',
            'amount'              => 'required|numeric|min:0',
            'is_recurring'        => 'boolean',
            'recurring_interval'  => 'nullable|in:termly,monthly,annually',
            'academic_session_id' => 'nullable|exists:academic_sessions,id',
            'term_id'             => 'nullable|exists:terms,id',
            'due_date'            => 'nullable|date',
            'is_active'           => 'boolean',
        ]);

        $feeType->update($data);

        return back()->with('success', 'Fee type updated.');
    }

    public function destroy(FeeType $feeType)
    {
        if ($feeType->payments()->exists()) {
            return back()->withErrors(['error' => 'Cannot delete a fee type that has payment records.']);
        }

        $feeType->delete();

        return back()->with('success', 'Fee type deleted.');
    }

    // -------------------------------------------------------
    // Assignment management
    // -------------------------------------------------------

    public function storeAssignment(Request $request, FeeType $feeType)
    {
        $data = $request->validate([
            'target_type'     => 'required|in:all,class,student,group,gender',
            'school_class_id' => 'nullable|exists:school_classes,id',
            'student_id'      => 'nullable|exists:students,id',
            'fee_group_id'    => 'nullable|exists:fee_groups,id',
            'gender'          => 'nullable|in:male,female',
        ]);

        // Prevent duplicate "all" assignments
        if ($data['target_type'] === 'all') {
            if ($feeType->assignments()->where('target_type', 'all')->exists()) {
                return back()->withErrors(['error' => 'This fee already targets all students.']);
            }
        }

        $feeType->assignments()->create($data);

        return back()->with('success', 'Assignment added.');
    }

    public function destroyAssignment(FeeAssignment $assignment)
    {
        $assignment->delete();
        return back()->with('success', 'Assignment removed.');
    }
}
