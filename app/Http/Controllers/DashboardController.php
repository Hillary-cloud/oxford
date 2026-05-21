<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Student;
use App\Models\User;
use App\Models\AcademicSession;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function index()
    {
        // 1. Student Stats
        $studentStats = [
            'total' => Student::count(),
            'active' => Student::where('status', 'active')->count(),
            'inactive' => Student::where('status', 'inactive')->count(),
            'graduated' => Student::where('status', 'graduated')->count(),
        ];

        // 2. Staff Stats (All users except Super Admin)
        $staffCount = User::whereDoesntHave('roles', function($q) {
            $q->where('name', 'Super Admin');
        })->count();

        // Activity Log (Union Query with Pagination)
        $studentsQuery = Student::select('id', 'created_at')
            ->selectRaw("CONCAT('New student enrolled: ', surname, ' ', othername) as description")
            ->selectRaw("'Registration' as category")
            ->selectRaw("'student_registration' as type");

        $usersQuery = User::select('id', 'created_at')
            ->selectRaw("CONCAT('New user added: ', name) as description")
            ->selectRaw("'System' as category")
            ->selectRaw("'user_creation' as type");

        $activityLog = $studentsQuery->union($usersQuery)
            ->orderBy('created_at', 'desc')
            ->paginate(5); // 5 items per page as requested

        // Format the time property for the frontend
        $activityLog->through(function ($item) {
            $item->time = $item->created_at->diffForHumans();
            return $item;
        });

        // 4. Enrollment Chart Data (Students per Session)
        $enrollmentData = Student::select('academic_session_id', DB::raw('count(*) as count'))
            ->groupBy('academic_session_id')
            ->with('academicSession')
            ->get()
            ->map(function($item) {
                return [
                    'session' => $item->academicSession->name ?? 'Unknown',
                    'students' => $item->count
                ];
            });

        // 5. Class Population Breakdown
        $classPopulation = \App\Models\SchoolClass::withCount([
            'students as active_count' => function ($query) {
                $query->where('status', 'active');
            },
            'students as inactive_count' => function ($query) {
                $query->where('status', 'inactive');
            }
        ])
        ->orderBy('level')
        ->get()
        ->map(function ($class) {
            return [
                'name' => $class->name,
                'active' => $class->active_count,
                'inactive' => $class->inactive_count,
            ];
        });

        // 6. Teacher Specific Data (if authenticated user is a teacher)
        $teacherInfo = null;
        $user = auth()->user();
        if ($user->hasRole('Teacher')) {
            // Form Teacher Classes
            $formClasses = \App\Models\ClassSection::where('form_teacher_id', $user->id)
                ->with(['schoolClass', 'classArm'])
                ->get()
                ->map(fn($cs) => $cs->schoolClass->name . ' - ' . $cs->classArm->name)
                ->values();

            // Subject Teacher Classes & Subjects
            $subjectAssignments = DB::table('class_section_subjects')
                ->where('teacher_id', $user->id)
                ->join('class_sections', 'class_section_subjects.class_section_id', '=', 'class_sections.id')
                ->join('school_classes', 'class_sections.school_class_id', '=', 'school_classes.id')
                ->join('class_arms', 'class_sections.class_arm_id', '=', 'class_arms.id')
                ->join('subjects', 'class_section_subjects.subject_id', '=', 'subjects.id')
                ->select(
                    'school_classes.name as class_name',
                    'class_arms.name as arm_name',
                    'subjects.name as subject_name'
                )
                ->orderBy('school_classes.level')
                ->orderBy('class_arms.name')
                ->get()
                ->groupBy(function($item) {
                     return $item->class_name . ' - ' . $item->arm_name;
                })
                ->map(function($group) {
                    return $group->pluck('subject_name')->unique()->values();
                });

            $teacherInfo = [
                'form_classes' => $formClasses,
                'subject_assignments' => $subjectAssignments
            ];
        }

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_students' => $studentStats['total'],
                'active_students' => $studentStats['active'],
                'inactive_students' => $studentStats['inactive'],
                'graduated_students' => $studentStats['graduated'],
                'staff_count' => $staffCount,
            ],
            'activity_log' => $activityLog,
            'enrollment_chart' => $enrollmentData,
            'class_population' => $classPopulation,
            'teacher_info' => $teacherInfo
        ]);
    }
}
