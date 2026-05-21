<?php

namespace App\Http\Controllers;

use App\Models\AcademicSession;
use App\Models\Student;
use App\Models\Graduation;
use App\Models\ClassSection;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class GraduationController extends Controller
{
    /**
     * Display a listing of graduated students (Alumni).
     */
    public function index(Request $request)
    {
        $query = Graduation::with(['student', 'academicSession'])
            ->join('students', 'graduations.student_id', '=', 'students.id')
            ->select('graduations.*')
            ->orderBy('students.surname');

        if ($request->filled('academic_session_id')) {
            $query->where('graduations.academic_session_id', $request->academic_session_id);
        }

        if ($request->filled('search')) {
            $term = $request->search;
            $query->whereHas('student', function($q) use ($term) {
                $q->where('surname', 'like', "%{$term}%")
                  ->orWhere('othername', 'like', "%{$term}%")
                  ->orWhere('registration_number', 'like', "%{$term}%");
            });
        }

        $graduations = $query->paginate(20)->withQueryString();
        $sessions = AcademicSession::orderBy('name', 'desc')->get();

        return Inertia::render('Graduations/Index', [
            'graduations' => $graduations,
            'sessions' => $sessions,
            'filters' => $request->only(['academic_session_id', 'search'])
        ]);
    }

    /**
     * Graduate a list of students.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'exists:students,id',
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'graduated_at' => 'required|date',
            'certificate_prefix' => 'nullable|string',
            'final_remark' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['student_ids'] as $studentId) {
                // strict check to ensure we don't double graduate
                $exists = Graduation::where('student_id', $studentId)->exists();
                if ($exists) continue;

                Graduation::create([
                    'student_id' => $studentId,
                    'academic_session_id' => $validated['academic_session_id'],
                    'graduated_at' => $validated['graduated_at'],
                    'final_remark' => $validated['final_remark'] ?? null,
                    // Certificate Number generation logic could go here
                ]);

                Student::where('id', $studentId)->update(['status' => 'graduated']);
            }
        });

        return redirect()->back()->with('success', 'Selected students have been graduated successfully.');
    }
}
