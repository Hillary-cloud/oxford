<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\ClassSection;
use App\Models\Student;
use App\Models\AcademicSession;
use App\Models\Term;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    /**
     * Display attendance dashboard overview.
     */
    public function index()
    {
        $user = auth()->user();
        $today = Carbon::today();

        // Get class sections for the current user
        $sections = $this->getAuthorizedSections($user);

        // Stats for cards
        $stats = [
            'total_students' => Student::whereIn('class_section_id', $sections->pluck('id'))->count(),
            'present_today' => Attendance::where('date', $today)
                ->where('status', 'present')
                ->whereIn('class_section_id', $sections->pluck('id'))
                ->count(),
            'absent_today' => Attendance::where('date', $today)
                ->where('status', 'absent')
                ->whereIn('class_section_id', $sections->pluck('id'))
                ->count(),
        ];

        return Inertia::render('Attendance/Index', [
            'stats' => $stats,
            'sections' => $sections->load(['schoolClass', 'classArm']),
        ]);
    }

    /**
     * Show the form for taking attendance.
     */
    public function take(Request $request)
    {
        $user = auth()->user();
        $sections = $this->getAuthorizedSections($user)->load(['schoolClass', 'classArm']);
        
        $sessions = AcademicSession::orderBy('name', 'desc')->get();
        $terms = Term::all();

        return Inertia::render('Attendance/TakeAttendance', [
            'sections' => $sections,
            'sessions' => $sessions,
            'terms' => $terms,
            'filters' => $request->only(['class_section_id', 'date', 'academic_session_id', 'term_id']),
        ]);
    }

    /**
     * Get students for a specific class section.
     */
    public function getStudents(ClassSection $classSection)
    {
        // Check authorization
        $user = auth()->user();
        if (!$user->hasRole('Super Admin') && !$user->hasRole('Admin') && $classSection->form_teacher_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $students = $classSection->students()
            ->where('status', 'active')
            ->orderBy('surname')
            ->orderBy('othername')
            ->get();

        return response()->json($students);
    }

    /**
     * Store attendance records in bulk.
     */
    public function store(Request $request)
    {
        $request->validate([
            'class_section_id' => 'required|exists:class_sections,id',
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'term_id' => 'required|exists:terms,id',
            'date' => 'required|date',
            'attendance' => 'required|array',
            'attendance.*.student_id' => 'required|exists:students,id',
            'attendance.*.status' => 'required|in:present,absent,late',
            'attendance.*.remarks' => 'nullable|string',
        ]);

        $takenBy = auth()->id();
        $date = $request->date;

        DB::transaction(function () use ($request, $takenBy, $date) {
            foreach ($request->attendance as $record) {
                Attendance::updateOrCreate(
                    [
                        'student_id' => $record['student_id'],
                        'date' => $date,
                    ],
                    [
                        'class_section_id' => $request->class_section_id,
                        'academic_session_id' => $request->academic_session_id,
                        'term_id' => $request->term_id,
                        'status' => $record['status'],
                        'remarks' => $record['remarks'] ?? null,
                        'taken_by' => $takenBy,
                    ]
                );
            }
        });

        return redirect()->back()->with('success', 'Attendance recorded successfully.');
    }

    /**
     * Display attendance history.
     */
    public function history(Request $request)
    {
        $user = auth()->user();
        $sections = $this->getAuthorizedSections($user)->load(['schoolClass', 'classArm']);
        
        $query = Attendance::with(['student', 'classSection.schoolClass', 'classSection.classArm', 'academicSession', 'term', 'takenBy']);

        // Apply filters
        if ($request->class_section_id) {
            $query->where('class_section_id', $request->class_section_id);
        } else {
            $query->whereIn('class_section_id', $sections->pluck('id'));
        }

        if ($request->date) {
            $query->whereDate('date', $request->date);
        }

        if ($request->student_id) {
            $query->where('student_id', $request->student_id);
        }

        $history = $query->orderBy('date', 'desc')
            ->orderBy('class_section_id')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Attendance/History', [
            'history' => $history,
            'sections' => $sections,
            'filters' => $request->only(['class_section_id', 'date', 'student_id']),
        ]);
    }

    /**
     * Helper to get authorized class sections for the user.
     */
    protected function getAuthorizedSections($user)
    {
        if ($user->hasRole('Super Admin') || $user->hasRole('Admin')) {
            return ClassSection::where('is_active', true)->get();
        }

        return ClassSection::where('is_active', true)
            ->where('form_teacher_id', $user->id)
            ->get();
    }
}
