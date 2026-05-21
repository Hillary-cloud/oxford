<?php

namespace App\Http\Controllers;

use App\Models\AcademicSession;
use App\Models\ClassSection;
use App\Models\Student;
use App\Models\StudentSubjectAssignment;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentSubjectAssignmentController extends Controller
{
    /**
     * Get students + their current elective assignments for a given class section & session.
     * Called via form queries on the Academic Setup page.
     */
    public function getStudents(Request $request)
    {
        $request->validate([
            'class_section_id'    => 'required|exists:class_sections,id',
            'academic_session_id' => 'required|exists:academic_sessions,id',
        ]);

        $sectionId = $request->class_section_id;
        $sessionId = $request->academic_session_id;

        // Get elective subjects allocated to this class section
        $electiveSubjects = Subject::whereHas('sections', function ($q) use ($sectionId) {
            $q->where('class_sections.id', $sectionId);
        })->where('type', 'elective')->orderBy('name')->get();

        // Get students in this section for the specific session
        $students = Student::where('class_section_id', $sectionId)
            ->where('academic_session_id', $sessionId)
            ->whereIn('status', ['active', 'inactive'])
            ->orderBy('surname')
            ->get();

        // Get existing assignments for this section + session
        $assignments = StudentSubjectAssignment::where('class_section_id', $sectionId)
            ->where('academic_session_id', $sessionId)
            ->get()
            ->groupBy('student_id')
            ->map(fn($items) => $items->pluck('subject_id')->toArray());

        // Attach assigned subject IDs to each student
        $studentsData = $students->map(function ($student) use ($assignments) {
            return [
                'id'                  => $student->id,
                'name'                => $student->surname . ' ' . $student->othername,
                'registration_number' => $student->registration_number,
                'assigned_subject_ids' => $assignments->get($student->id, []),
            ];
        });

        return response()->json([
            'students'         => $studentsData,
            'electiveSubjects' => $electiveSubjects,
        ]);
    }

    /**
     * Bulk-sync elective subject assignments for students in a class section.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'class_section_id'              => 'required|exists:class_sections,id',
            'academic_session_id'           => 'required|exists:academic_sessions,id',
            'assignments'                   => 'required|array',
            'assignments.*.student_id'      => 'required|exists:students,id',
            'assignments.*.subject_ids'     => 'nullable|array',
            'assignments.*.subject_ids.*'   => 'exists:subjects,id',
        ]);

        $sectionId = $validated['class_section_id'];
        $sessionId = $validated['academic_session_id'];

        DB::transaction(function () use ($validated, $sectionId, $sessionId) {
            foreach ($validated['assignments'] as $assignment) {
                $studentId  = $assignment['student_id'];
                $subjectIds = $assignment['subject_ids'] ?? [];

                // Delete existing assignments for this student in this section/session
                StudentSubjectAssignment::where('student_id', $studentId)
                    ->where('class_section_id', $sectionId)
                    ->where('academic_session_id', $sessionId)
                    ->delete();

                // Re-insert selected subjects
                foreach ($subjectIds as $subjectId) {
                    StudentSubjectAssignment::create([
                        'student_id'          => $studentId,
                        'subject_id'          => $subjectId,
                        'class_section_id'    => $sectionId,
                        'academic_session_id' => $sessionId,
                    ]);
                }
            }
        });

        return back()->with('success', 'Elective subject assignments saved successfully.');
    }
}
