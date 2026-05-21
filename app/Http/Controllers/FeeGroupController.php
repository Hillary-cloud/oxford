<?php

namespace App\Http\Controllers;

use App\Models\FeeGroup;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeeGroupController extends Controller
{
    public function index()
    {
        $groups = FeeGroup::withCount('students')->with('students')->orderBy('name')->get();

        return Inertia::render('Fees/Groups/Index', [
            'groups'      => $groups,
            'allStudents' => \App\Models\Student::orderBy('surname')->get(['id', 'surname', 'othername', 'registration_number']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        FeeGroup::create($data);

        return back()->with('success', 'Group created.');
    }

    public function update(Request $request, FeeGroup $feeGroup)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $feeGroup->update($data);

        return back()->with('success', 'Group updated.');
    }

    public function destroy(FeeGroup $feeGroup)
    {
        $feeGroup->delete();
        return back()->with('success', 'Group deleted.');
    }

    public function addStudents(Request $request, FeeGroup $feeGroup)
    {
        // Accept either a single student_id or an array of student_ids
        if ($request->has('student_id')) {
            $request->validate(['student_id' => 'required|exists:students,id']);
            $ids = [$request->student_id];
        } else {
            $request->validate([
                'student_ids'   => 'required|array',
                'student_ids.*' => 'exists:students,id',
            ]);
            $ids = $request->student_ids;
        }

        $feeGroup->students()->syncWithoutDetaching($ids);

        return back()->with('success', 'Students added to group.');
    }

    public function removeStudent(FeeGroup $feeGroup, Student $student)
    {
        $feeGroup->students()->detach($student->id);

        return back()->with('success', 'Student removed from group.');
    }
}
