<?php

namespace App\Http\Controllers;

use App\Models\Result;
use App\Models\Student;
use App\Models\Subject;
use App\Models\AcademicSession;
use App\Models\Term;
use App\Models\TerminalRemark;
use App\Models\ClassSection;
use App\Models\ResultSetting;
use App\Models\AnnualResult;
use App\Models\PromotionDecision;
use App\Models\Grade;
use App\Models\StudentPsychomotorRating;
use App\Models\PromotionRule;
use App\Models\GeneralSetting;
use App\Services\PromotionService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SchoolClass;
use Illuminate\Support\Facades\DB;

class ResultController extends Controller
{
    /**
     * Display a listing of compiled subject results.
     */
    public function index(Request $request)
    {
        $query = Result::with(['student', 'subject', 'academicSession', 'term', 'classSection.schoolClass', 'classSection.classArm']);

        if ($request->filled('class_section_id')) {
            $query->where('class_section_id', $request->class_section_id);
        }
        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }
        if ($request->filled('academic_session_id')) {
            $query->where('academic_session_id', $request->academic_session_id);
        }
        if ($request->filled('term_id')) {
            $query->where('term_id', $request->term_id);
        }

        // Strict checking: ALL filters must be present
        if ($request->filled('class_section_id') && 
            $request->filled('subject_id') && 
            $request->filled('academic_session_id') && 
            $request->filled('term_id')) {
            
            $results = $query->latest()->paginate(20)->withQueryString();
        } else {
            // Return empty result set if any filter is missing
            $results = Result::where('id', 0)->paginate(20);
        }

        return Inertia::render('Results/Overview', [
            'results' => $results,
            'classSections' => ClassSection::with(['schoolClass', 'classArm'])
                ->join('school_classes', 'class_sections.school_class_id', '=', 'school_classes.id')
                ->orderBy('school_classes.level')
                ->orderBy('school_classes.name')
                ->select('class_sections.*')
                ->get(),
            'subjects' => Subject::orderBy('name')->get(),
            'sessions' => AcademicSession::with('terms')->orderBy('name', 'desc')->get(),
            'filters' => $request->only(['class_section_id', 'subject_id', 'academic_session_id', 'term_id'])
        ]);
    }

    /**
     * Result Compilation (Bulk Entry) interface.
     */
    public function compilation(Request $request)
    {
        $sessions = AcademicSession::with('terms')->orderBy('name', 'desc')->get();
        $currentSession = AcademicSession::where('is_current', true)->first() ?? $sessions->first();
        
        $sessionId = $request->academic_session_id ?? ($currentSession ? $currentSession->id : null);
        $selectedSession = $sessionId ? $sessions->find($sessionId) : null;
        
        $termId = $request->term_id ?? ($selectedSession && $selectedSession->is_current 
            ? ($selectedSession->terms()->where('is_current', true)->first()->id ?? $selectedSession->terms()->first()->id ?? null) 
            : ($selectedSession?->terms()->first()->id ?? null));
            
        $term = $selectedSession ? $selectedSession->terms()->firstWhere('id', $termId) : null;
        if (!$selectedSession || !$termId) {
            return redirect()->route('results.management')->with('error', 'Active session or term not found. Please configure academic sessions.');
        }

        $classSectionsQuery = ClassSection::with(['schoolClass', 'classArm'])
            ->join('school_classes', 'class_sections.school_class_id', '=', 'school_classes.id')
            ->orderBy('school_classes.level')
            ->orderBy('school_classes.name')
            ->select('class_sections.*');

        $user = $request->user();
        if ($user->hasRole('Teacher') && !$user->hasRole('Super Admin') && !$user->hasRole('Admin')) {
            // Teacher restriction: Allow if Form Teacher OR Subject Teacher
            $classSectionsQuery->where(function ($q) use ($user) {
                $q->where('form_teacher_id', $user->id)
                  ->orWhereExists(function ($subQ) use ($user) {
                      $subQ->select(DB::raw(1))
                           ->from('class_section_subjects')
                           ->whereColumn('class_section_subjects.class_section_id', 'class_sections.id')
                           ->where('class_section_subjects.teacher_id', $user->id);
                  });
            });
            
            // Eager load ALL assigned subjects for the class (with pivot info to filter later)
            $classSectionsQuery->with(['subjects' => function($q) {
                $q->withPivot('teacher_id');
            }]);
        }

        $classSections = $classSectionsQuery->get();
        
        if ($user->hasRole('Teacher') && !$user->hasRole('Super Admin') && !$user->hasRole('Admin')) {
            foreach ($classSections as $section) {
                // Filter subjects to only those they teach, even if they are Form Teacher
                $filteredSubjects = $section->subjects->filter(function($subject) use ($user) {
                    return $subject->pivot->teacher_id === $user->id;
                })->values();
                $section->setRelation('subjects', $filteredSubjects);
            }
        }

        $subjectsQuery = Subject::orderBy('name');

        if ($user->hasRole('Teacher') && !$user->hasRole('Super Admin') && !$user->hasRole('Admin')) {
            $subjectsQuery->whereExists(function ($q) use ($user) {
                $q->select(DB::raw(1))
                  ->from('class_section_subjects')
                  ->whereColumn('class_section_subjects.subject_id', 'subjects.id')
                  ->where('class_section_subjects.teacher_id', $user->id);
            });
        }
        
        $subjects = $subjectsQuery->get();

        $students = [];
        $caConfig = ResultSetting::getByKey('ca_config', []);

        if ($request->filled('class_section_id')) {
            $classSectionId = $request->class_section_id;

            $studentQuery = Student::query();

            // First, find students who belong to this class/session context
            $studentQuery->where(function($q) use ($sessionId, $termId, $classSectionId, $selectedSession) {
                // Anyone with existing results in this context
                $q->whereIn('id', function($sub) use ($sessionId, $termId, $classSectionId) {
                    $sub->select('student_id')
                        ->from('results')
                        ->where('academic_session_id', $sessionId)
                        ->where('term_id', $termId)
                        ->where('class_section_id', $classSectionId);
                });

                // OR active students currently assigned to this class and session
                if ($selectedSession && $selectedSession->is_current) {
                    $q->orWhere(function($sub) use ($classSectionId, $sessionId) {
                        $sub->where('class_section_id', $classSectionId)
                            ->where('academic_session_id', $sessionId)
                            ->whereIn('status', ['active', 'inactive']);
                    });
                }
            });

            // THEN, if a subject is selected, apply specific subject assignment filtering
            if ($request->filled('subject_id')) {
                $subjectId = $request->subject_id;
                $subject = Subject::find($subjectId);
                
                // If it's an elective, specifically filter by assigned students
                if ($subject && $subject->type === 'elective') {
                    $studentQuery->whereHas('electiveSubjectAssignments', function ($q) use ($subjectId, $sessionId, $classSectionId) {
                        $q->where('subject_id', $subjectId)
                          ->where('academic_session_id', $sessionId)
                          ->where('class_section_id', $classSectionId);
                    });
                }

                $studentQuery->with(['results' => function($query) use ($sessionId, $termId, $classSectionId, $subjectId) {
                    $query->where('academic_session_id', $sessionId)
                          ->where('term_id', $termId)
                          ->where('subject_id', $subjectId)
                          ->where('class_section_id', $classSectionId);
                }]);
            }
            
            $students = $studentQuery->orderBy('surname')->get();

            // Override class context for historic viewing
            $requestedClass = $classSections->firstWhere('id', $classSectionId);
            if ($requestedClass) {
                $students->each(function ($student) use ($requestedClass, $classSectionId) {
                    if ($student->class_section_id != $classSectionId) {
                        $student->class_section_id = $classSectionId;
                        $student->setRelation('classSection', $requestedClass);
                    }
                });
            }
        }

        return Inertia::render('Results/Compilation', [
            'classSections' => $classSections,
            'subjects' => $subjects,
            'students' => $students,
            'filters' => [
                'academic_session_id' => $sessionId,
                'term_id' => $termId,
                'class_section_id' => $request->class_section_id,
                'subject_id' => $request->subject_id,
            ],
            'caConfig' => $caConfig,
            'sessions' => $sessions,
            'currentSession' => $selectedSession,
            'currentTerm' => Term::find($termId),
        ]);
    }

    /**
     * Store multiple results at once.
     */
    public function storeBulk(Request $request)
    {
        $validated = $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'term_id' => 'required|exists:terms,id',
            'class_section_id' => 'required|exists:class_sections,id',
            'subject_id' => 'required|exists:subjects,id',
            'results' => 'required|array',
            'results.*.student_id' => 'required|exists:students,id',
            'results.*.assessments' => 'required|array',
            'results.*.exam_score' => 'required|numeric|min:0',
        ]);

        $skippedCount = 0;
        $updatedCount = 0;

        DB::transaction(function () use ($validated, &$skippedCount, &$updatedCount) {
            foreach ($validated['results'] as $resData) {
                // Check if results are locked
                $isLocked = \App\Models\PromotionDecision::where('student_id', $resData['student_id'])
                    ->where('academic_session_id', $validated['academic_session_id'])
                    ->where('is_locked', true)
                    ->exists();

                if ($isLocked) {
                    $skippedCount++;
                    continue; // Skip locked students
                }

                $totalScore = collect($resData['assessments'])->sum('score') + $resData['exam_score'];
                $gradeData = Result::computeDynamicGrade($totalScore);

                Result::updateOrCreate(
                    [
                        'student_id' => $resData['student_id'],
                        'academic_session_id' => $validated['academic_session_id'],
                        'term_id' => $validated['term_id'],
                        'subject_id' => $validated['subject_id'],
                        'class_section_id' => $validated['class_section_id'],
                    ],
                    [
                        'assessments' => $resData['assessments'],
                        'exam_score' => $resData['exam_score'],
                        'total_score' => $totalScore,
                        'grade' => $gradeData['name'],
                        'remarks' => $gradeData['remarks'],
                    ]
                );
                
                $updatedCount++;
            }

            // Recalculate Positions ONLY if updates happened
            if ($updatedCount > 0) {
                $this->calculatePositions(
                    $validated['academic_session_id'],
                    $validated['term_id'],
                    $validated['class_section_id'],
                    $validated['subject_id']
                );
            }
        });

        if ($skippedCount > 0 && $updatedCount === 0) {
            return redirect()->route('results.management', ['tab' => 'overview'])
                ->with('error', "Update failed: All {$skippedCount} students have finalized/locked results for this session.");
        } elseif ($skippedCount > 0) {
            return redirect()->route('results.management', ['tab' => 'overview'])
                ->with('warning', "Updated {$updatedCount} records. Skipped {$skippedCount} locked records.");
        }

        return redirect()->route('results.management', ['tab' => 'overview'])->with('success', 'Results updated and positions recalculated.');
    }

    /**
     * Update a single result.
     */
    public function update(Request $request, Result $result)
    {
        // Check if locked
        $isLocked = \App\Models\PromotionDecision::where('student_id', $result->student_id)
            ->where('academic_session_id', $result->academic_session_id)
            ->where('is_locked', true)
            ->exists();

        if ($isLocked) {
             return back()->with('error', 'Cannot update result. Academic record is locked/finalized.');
        }

        $validated = $request->validate([
            'assessments' => 'nullable|array',
            'assessments.*.name' => 'required|string',
            'assessments.*.score' => 'required|numeric|min:0',
            'assessments.*.max_score' => 'required|numeric|min:0',
            'exam_score' => 'required|numeric|min:0',
        ]);

        $assessments = $validated['assessments'] ?? [];
        $caTotal = collect($assessments)->sum('score');
        $totalScore = $caTotal + $validated['exam_score'];
        
        $gradeData = Result::computeDynamicGrade($totalScore);

        $result->update([
            'assessments' => $assessments,
            'exam_score' => $validated['exam_score'],
            'total_score' => $totalScore,
            'grade' => $gradeData['name'],
            'remarks' => $gradeData['remarks'],
        ]);

        $this->calculatePositions(
            $result->academic_session_id,
            $result->term_id,
            $result->class_section_id,
            $result->subject_id
        );

        return back()->with('success', 'Result updated successfully.');
    }

    /**
     * Delete a result.
     */
    public function destroy(Result $result)
    {
        // Check if locked
        $isLocked = \App\Models\PromotionDecision::where('student_id', $result->student_id)
            ->where('academic_session_id', $result->academic_session_id)
            ->where('is_locked', true)
            ->exists();

        if ($isLocked) {
             return back()->with('error', 'Cannot delete result. Academic record is locked/finalized.');
        }

        $session = $result->academic_session_id;
        $term = $result->term_id;
        $class = $result->class_section_id;
        $subject = $result->subject_id;

        $result->delete();

        $this->calculatePositions($session, $term, $class, $subject);

        return back()->with('success', 'Result deleted successfully.');
    }


    public function storePsychomotor(Request $request)
    {
        // Handled by ResultManagementController usually, but included for completeness if used
        $validated = $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'term_id' => 'required|exists:terms,id',
            'ratings' => 'required|array',
            'ratings.*.student_id' => 'required|exists:students,id',
            'ratings.*.skill_id' => 'required|exists:psychomotor_skills,id',
            'ratings.*.rating' => 'required|integer|min:1|max:5',
        ]);

        foreach ($validated['ratings'] as $rating) {
            StudentPsychomotorRating::updateOrCreate(
                [
                    'student_id' => $rating['student_id'],
                    'academic_session_id' => $validated['academic_session_id'],
                    'term_id' => $validated['term_id'],
                    'skill_id' => $rating['skill_id'],
                ],
                ['rating' => $rating['rating']]
            );
        }

        return back()->with('success', 'Psychomotor ratings updated.');
    }


    /**
     * Generate Report Card data for a student.
     */
    public function reportCard(Student $student, Request $request)
    {
        $sessionId = $request->academic_session_id ?? AcademicSession::latest()->first()?->id;
        $termId = $request->term_id ?? Term::latest()->first()?->id;

        if (!$sessionId || !$termId) {
            return redirect()->back()->with('error', 'Academic session or term not found.');
        }

        $session = AcademicSession::find($sessionId);
        $term = Term::find($termId);

        $results = Result::where('student_id', $student->id)
            ->where('academic_session_id', $sessionId)
            ->where('term_id', $termId)
            ->with('subject')
            ->get();

        // Determine class section ID from the results (historic class)
        // Fallback to student's current class if no results found (though unlikely for a report card)
        $sectionId = $results->first()?->class_section_id ?? $student->class_section_id;

        $subjectStats = [];
        foreach ($results as $result) {
            $stats = Result::where('class_section_id', $sectionId)
                ->where('academic_session_id', $sessionId)
                ->where('term_id', $termId)
                ->where('subject_id', $result->subject_id)
                ->selectRaw('MAX(total_score) as highest, MIN(total_score) as lowest, AVG(total_score) as average')
                ->first();
            
            $subjectStats[$result->subject_id] = [
                'highest' => round($stats->highest, 1),
                'lowest' => round($stats->lowest, 1),
                'average' => round($stats->average, 1),
            ];
        }

        $allClassAverages = Result::where('academic_session_id', $sessionId)
            ->where('term_id', $termId)
            ->where('class_section_id', $sectionId)
            ->select('student_id', DB::raw('AVG(total_score) as student_avg'))
            ->groupBy('student_id')
            ->orderBy('student_avg', 'desc')
            ->get();

        $studentAvgStats = $allClassAverages->firstWhere('student_id', $student->id);
        $studentAvg = $studentAvgStats?->student_avg ?? 0;
        
        $overallPosition = $allClassAverages->filter(function($item) use ($studentAvg) {
            return round($item->student_avg, 2) > round($studentAvg, 2);
        })->count() + 1;

        $caConfig = ResultSetting::getByKey('ca_config', []);
        $reportSettings = ResultSetting::getByKey('report_card_settings', []);
        
        // Eager load relationships for the historic class section if possible, else current
        $student->load(['classSection.schoolClass', 'classSection.classArm', 'classSection.formTeacher']);
        
        // Override class info in student object for display purposes if different
        $historicClass = null;
        if ($sectionId !== $student->class_section_id) {
            $historicClass = ClassSection::with(['schoolClass', 'classArm', 'formTeacher'])->find($sectionId);
            if ($historicClass) {
                // We try to set relation, but also pass it explicitly just in case serialization reverts it
                $student->setRelation('classSection', $historicClass);
                $student->class_section_id = $sectionId;
            }
        } else {
             $historicClass = $student->classSection;
        }

        $terminalRemark = TerminalRemark::where('student_id', $student->id)
            ->where('academic_session_id', $sessionId)
            ->where('term_id', $termId)
            ->first();

        $psychomotorRatings = StudentPsychomotorRating::where('student_id', $student->id)
            ->where('academic_session_id', $sessionId)
            ->where('term_id', $termId)
            ->with(['skill.category'])
            ->get();

        // Inject Dynamic Form Teacher Name
        $formTeacher = $historicClass ? $historicClass->formTeacher : ($student->classSection ? $student->classSection->formTeacher : null);
        if ($formTeacher) {
            $reportSettings['form_teacher_name'] = $formTeacher->name ?? ($formTeacher->surname . ' ' . $formTeacher->othername);
        }


        return Inertia::render('Results/ReportCard', [
            'student' => $student,
            'historicClass' => $historicClass,
            'results' => $results,
            'subjectStats' => $subjectStats,
            'psychomotor' => $psychomotorRatings,
            'overall' => [
                'average' => round($studentAvgStats?->student_avg ?? 0, 1),
                'position' => $overallPosition,
                'total_students' => $allClassAverages->count(),
                'status' => ($session && $historicClass && $term) 
                    ? (app(PromotionService::class)->evaluateTermlyPass($student, $session, $historicClass, $term)['status'] ?? 'Pending') 
                    : 'Passed'
            ],
            'caConfig' => $caConfig,
            'reportSettings' => $reportSettings,
            'session' => AcademicSession::find($sessionId),
            'term' => Term::find($termId),
            'terminalRemark' => $terminalRemark,
            'grades' => Grade::orderBy('min_score', 'desc')->get(),
            'psychomotorSettings' => ResultSetting::getByKey('psychomotor_settings', [
                ['scale' => 5, 'desc' => 'Excellent'],
                ['scale' => 4, 'desc' => 'Good'],
                ['scale' => 3, 'desc' => 'Fair'],
                ['scale' => 2, 'desc' => 'Poor'],
                ['scale' => 1, 'desc' => 'Very Poor'],
            ]),
            'settings' => [
                'school_identity' => GeneralSetting::get('school_identity'),
                'theme_colors' => GeneralSetting::get('theme_colors'),
            ],
        ]);
    }

    /**
     * Generate Report Card data for multiple students in a class section.
     */
    public function bulkReportCard(Request $request)
    {
        $sessionId = $request->academic_session_id ?? AcademicSession::latest()->first()?->id;
        $termId = $request->term_id ?? Term::latest()->first()?->id;
        $sectionId = $request->class_section_id;

        if (!$sessionId || !$termId || !$sectionId) {
            return redirect()->back()->with('error', 'Academic session, term, or class section not specified.');
        }

        $session = AcademicSession::find($sessionId);
        $term = Term::find($termId);

        $classSection = ClassSection::with(['schoolClass', 'classArm', 'formTeacher'])->findOrFail($sectionId);
        
        // Fetch all students who have results in this section for this term
        $studentIds = Result::where('class_section_id', $sectionId)
            ->where('academic_session_id', $sessionId)
            ->where('term_id', $termId)
            ->distinct()
            ->pluck('student_id');

        if ($studentIds->isEmpty()) {
            return redirect()->back()->with('error', 'No results found for the selected class and term.');
        }

        $students = Student::whereIn('id', $studentIds)->orderBy('surname')->get();
        
        $allResults = Result::whereIn('student_id', $studentIds)
            ->where('academic_session_id', $sessionId)
            ->where('term_id', $termId)
            ->with('subject')
            ->get()
            ->groupBy('student_id');

        // Fetch subject stats for the entire class once
        $statsData = Result::where('class_section_id', $sectionId)
            ->where('academic_session_id', $sessionId)
            ->where('term_id', $termId)
            ->select('subject_id', DB::raw('MAX(total_score) as highest, MIN(total_score) as lowest, AVG(total_score) as average'))
            ->groupBy('subject_id')
            ->get()
            ->keyBy('subject_id');

        $subjectStats = $statsData->map(function($stats) {
            return [
                'highest' => round($stats->highest, 1),
                'lowest' => round($stats->lowest, 1),
                'average' => round($stats->average, 1),
            ];
        });

        // Compute overall positions for all students
        $allClassAverages = Result::where('academic_session_id', $sessionId)
            ->where('term_id', $termId)
            ->where('class_section_id', $sectionId)
            ->select('student_id', DB::raw('AVG(total_score) as student_avg'))
            ->groupBy('student_id')
            ->orderBy('student_avg', 'desc')
            ->get();

        $totalInClass = $allClassAverages->count();

        // Fetch terminal remarks and psychomotor ratings in bulk
        $terminalRemarks = TerminalRemark::whereIn('student_id', $studentIds)
            ->where('academic_session_id', $sessionId)
            ->where('term_id', $termId)
            ->get()
            ->keyBy('student_id');

        $psychomotorRatings = StudentPsychomotorRating::whereIn('student_id', $studentIds)
            ->where('academic_session_id', $sessionId)
            ->where('term_id', $termId)
            ->with(['skill.category'])
            ->get()
            ->groupBy('student_id');

        $caConfig = ResultSetting::getByKey('ca_config', []);
        $reportSettings = ResultSetting::getByKey('report_card_settings', []);
        
        // Inject Dynamic Form Teacher Name
        $formTeacher = $classSection->formTeacher;
        if ($formTeacher) {
            $reportSettings['form_teacher_name'] = $formTeacher->name ?? ($formTeacher->surname . ' ' . $formTeacher->othername);
        }

        $grades = Grade::orderBy('min_score', 'desc')->get();
        $psychomotorSettings = ResultSetting::getByKey('psychomotor_settings', [
            ['scale' => 5, 'desc' => 'Excellent'],
            ['scale' => 4, 'desc' => 'Good'],
            ['scale' => 3, 'desc' => 'Fair'],
            ['scale' => 2, 'desc' => 'Poor'],
            ['scale' => 1, 'desc' => 'Very Poor'],
        ]);
        $generalSettings = [
            'school_identity' => GeneralSetting::get('school_identity'),
            'theme_colors' => GeneralSetting::get('theme_colors'),
        ];

        // Prepare data for each student
        $studentsData = $students->map(function($student) use (
            $allResults, $subjectStats, $allClassAverages, $totalInClass, 
            $terminalRemarks, $psychomotorRatings, $classSection, $session, $term
        ) {
            $results = $allResults->get($student->id, collect());
            $studentAvgStats = $allClassAverages->firstWhere('student_id', $student->id);
            $studentAvg = $studentAvgStats?->student_avg ?? 0;
            
            $overallPosition = $allClassAverages->filter(function($item) use ($studentAvg) {
                return round($item->student_avg, 2) > round($studentAvg, 2);
            })->count() + 1;
            
            // Clone student and set historic class
            $studentCopy = clone $student;
            $studentCopy->setRelation('classSection', $classSection);

            return [
                'student' => $studentCopy,
                'results' => $results,
                'psychomotor' => $psychomotorRatings->get($student->id, collect()),
                'overall' => [
                    'average' => round($studentAvgStats?->student_avg ?? 0, 1),
                    'position' => $overallPosition,
                    'total_students' => $totalInClass,
                    'status' => ($session && $classSection && $term) 
                        ? (app(PromotionService::class)->evaluateTermlyPass($student, $session, $classSection, $term)['status'] ?? 'Pending') 
                        : 'Passed'
                ],
                'terminalRemark' => $terminalRemarks->get($student->id),
            ];
        })->sortBy('overall.position')->values();

        return Inertia::render('Results/BulkReportCard', [
            'studentsData' => $studentsData,
            'subjectStats' => $subjectStats,
            'caConfig' => $caConfig,
            'reportSettings' => $reportSettings,
            'session' => AcademicSession::find($sessionId),
            'term' => Term::find($termId),
            'grades' => $grades,
            'psychomotorSettings' => $psychomotorSettings,
            'settings' => $generalSettings,
            'historicClass' => $classSection, // Base class for all
        ]);
    }

    /**
     * Generate annual report card data for a student.
     */
    public function annualReportCard(Student $student, Request $request, PromotionService $promotionService)
    {
        $sessionId = $request->academic_session_id ?? AcademicSession::latest()->first()?->id;
        $rankingBasis = $request->query('ranking_basis', 'arm'); 

        if (!$sessionId) {
            return redirect()->back()->with('error', 'Academic session not found.');
        }

        $annualResults = AnnualResult::where('student_id', $student->id)
            ->where('academic_session_id', $sessionId)
            ->with('subject')
            ->get();

        $studentAvg = $annualResults->avg('annual_score') ?: 0;
        
        // Determine historic class from a Result record in that session
        // Pick the latest result (highest term_id) to reflect their final class in that session
        $historicResult = Result::where('student_id', $student->id)
            ->where('academic_session_id', $sessionId)
            ->orderBy('term_id', 'desc')
            ->select('class_section_id')
            ->first();
            
        $sectionId = $historicResult ? $historicResult->class_section_id : $student->class_section_id;
        
        // Load historic class info for display
        $historicClass = ClassSection::with(['schoolClass', 'classArm', 'formTeacher'])->find($sectionId);
        if ($historicClass && $historicClass->id !== $student->class_section_id) {
             $student->setRelation('classSection', $historicClass);
        } else {
             $student->load(['classSection.schoolClass', 'classSection.classArm', 'classSection.formTeacher']);
        }
        
        // Inject Dynamic Form Teacher Name
        $reportSettings = ResultSetting::getByKey('report_card_settings', []);
        $formTeacher = $historicClass ? $historicClass->formTeacher : ($student->classSection ? $student->classSection->formTeacher : null);
        if ($formTeacher) {
            $reportSettings['form_teacher_name'] = $formTeacher->name ?? ($formTeacher->surname . ' ' . $formTeacher->othername);
        }

        
        // Determine Peer Group based on historic class
        // Robust strategy: Find students who ended the session in the target class/section.
        // We use a database query to find distinct student IDs where their latest result (max term) 
        // in this session belongs to the target class/section.

        if ($rankingBasis === 'class') {
            $classId = $historicClass ? $historicClass->school_class_id : $student->classSection->school_class_id;

            // Find students where their LATEST result in this session matches the school_class_id
            $studentIds = DB::table('results as r1')
                ->join('class_sections', 'r1.class_section_id', '=', 'class_sections.id')
                ->where('r1.academic_session_id', $sessionId)
                ->where('class_sections.school_class_id', $classId)
                ->where('r1.term_id', function ($query) use ($sessionId) {
                    $query->selectRaw('MAX(r2.term_id)')
                        ->from('results as r2')
                        ->whereColumn('r2.student_id', 'r1.student_id')
                        ->where('r2.academic_session_id', $sessionId);
                })
                ->distinct()
                ->pluck('r1.student_id');

        } else {
            // Peers in specific section (historic)
            // Find students where their LATEST result in this session matches the class_section_id
            $studentIds = DB::table('results as r1')
                ->where('r1.academic_session_id', $sessionId)
                ->where('r1.class_section_id', $sectionId)
                ->where('r1.term_id', function ($query) use ($sessionId) {
                    $query->selectRaw('MAX(r2.term_id)')
                        ->from('results as r2')
                        ->whereColumn('r2.student_id', 'r1.student_id')
                        ->where('r2.academic_session_id', $sessionId);
                })
                ->distinct()
                ->pluck('r1.student_id');
        }

        $allAverages = AnnualResult::whereIn('student_id', $studentIds)
            ->where('academic_session_id', $sessionId)
            ->select('student_id', DB::raw('AVG(annual_score) as avg_score'))
            ->groupBy('student_id')
            ->orderBy('avg_score', 'desc')
            ->orderBy('avg_score', 'desc')
            ->get();

        $studentAvg = 0;
        $studentAvgStats = $allAverages->firstWhere('student_id', $student->id);
        if ($studentAvgStats) {
            $studentAvg = $studentAvgStats->avg_score;
        }

        $position = $allAverages->filter(function($item) use ($studentAvg) {
            return round($item->avg_score, 2) > round($studentAvg, 2);
        })->count() + 1;
        $totalStudents = $allAverages->count();

        foreach ($annualResults as $res) {
            $subjectStats = AnnualResult::whereIn('student_id', $studentIds)
                ->where('academic_session_id', $sessionId)
                ->where('subject_id', $res->subject_id);
            
            $res->subject_total_students = $subjectStats->count();

            $subjectRank = $subjectStats->clone() 
                ->where('annual_score', '>', $res->annual_score)
                ->count() + 1;
            
            $res->position = $subjectRank;
            
            // Get the correct grade based on annual_score
            $gradeObj = Grade::orderBy('min_score', 'desc')->get()
                ->first(fn($g) => $res->annual_score >= $g->min_score);
            
            if ($gradeObj) {
                // Force update the grade attribute to override database value
                $res->setAttribute('grade', $gradeObj->name);
                $res->grade_remark = $gradeObj->remarks;
            } else {
                $res->setAttribute('grade', 'N/A');
                $res->grade_remark = 'N/A';
            }
        }

        $annualResults = $annualResults->sortBy('position')->values();

        $promotionDecision = PromotionDecision::where('student_id', $student->id)
            ->where('academic_session_id', $sessionId)
            ->first();

        $psychomotorRatings = StudentPsychomotorRating::where('student_id', $student->id)
            ->where('academic_session_id', $sessionId)
            ->with(['skill', 'skill.category'])
            ->get();

        $annualSubjectStats = [];
        if ($annualResults->isNotEmpty()) {
            // Use the same studentIds for consistency (the peers we are ranking against)
            $statsIds = $studentIds;
            
            $stats = AnnualResult::whereIn('student_id', $statsIds)
                ->where('academic_session_id', $sessionId)
                ->whereIn('subject_id', $annualResults->pluck('subject_id'))
                ->select('subject_id', DB::raw('AVG(annual_score) as average'))
                ->groupBy('subject_id')
                ->get();

            foreach ($stats as $stat) {
                $annualSubjectStats[$stat->subject_id] = round($stat->average, 1);
            }
        }



        $termAverages = [
            'term1' => 0,
            'term2' => 0,
            'term3' => 0,
        ];
        
        $terms = Term::orderBy('start_date')->take(3)->get();
        foreach ($terms as $index => $term) {
             $termAvg = Result::where('student_id', $student->id)
                ->where('academic_session_id', $sessionId)
                ->where('term_id', $term->id)
                ->avg('total_score');
             
             $key = 'term' . ($index + 1);
             if (array_key_exists($key, $termAverages)) {
                 $termAverages[$key] = $termAvg ? round($termAvg, 1) : '-';
             }
        }

        // Auto-generate remarks if needed (simplified)
        // Auto-generate remarks if needed
        if (!$promotionDecision) {
             $promotionDecision = new \stdClass();
             $promotionDecision->status = 'PENDING';
             $promotionDecision->form_teacher_remark = null;
             $promotionDecision->principal_remark = null;
        }

        // Generate dynamic remarks if not manually set
        if (empty($promotionDecision->form_teacher_remark)) {
            $promotionDecision->form_teacher_remark = $promotionService->getRemark((float) $studentAvg, 'teacher');
        }
        if (empty($promotionDecision->principal_remark)) {
            $promotionDecision->principal_remark = $promotionService->getRemark((float) $studentAvg, 'principal');
        }

        return Inertia::render('Results/AnnualReportCard', [
            'student' => $student,
            'historicClass' => $historicClass,
            'annualResults' => $annualResults,
            'annualSubjectStats' => $annualSubjectStats,
            'termAverages' => $termAverages,
            'overall' => [
                'average' => round($studentAvg, 1),
                'position' => $position,
                'total_students' => $totalStudents,
                'ranking_scope' => $rankingBasis === 'class' ? 'Class Level' : 'Class Arm',
            ],
            'promotionDecision' => $promotionDecision,
            'session' => AcademicSession::find($sessionId),
            'reportSettings' => $reportSettings,
            'grades' => Grade::orderBy('min_score', 'desc')->get(),
            'psychomotor' => $psychomotorRatings,
            'ranking_basis' => $rankingBasis,
            'psychomotorSettings' => ResultSetting::getByKey('psychomotor_settings', [
                ['scale' => 5, 'desc' => 'Excellent'],
                ['scale' => 4, 'desc' => 'Good'],
                ['scale' => 3, 'desc' => 'Fair'],
                ['scale' => 2, 'desc' => 'Poor'],
                ['scale' => 1, 'desc' => 'Very Poor'],
            ]),
            'settings' => [
                'school_identity' => GeneralSetting::get('school_identity'),
                'theme_colors' => GeneralSetting::get('theme_colors'),
            ],
        ]);
    }



    public function storeTerminalRemarks(Request $request)
    {
        $validated = $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'term_id' => 'required|exists:terms,id',
            'remarks' => 'required|array',
            'remarks.*.student_id' => 'required|exists:students,id',
            'remarks.*.form_teacher_remark' => 'nullable|string',
            'remarks.*.principal_remark' => 'nullable|string',
        ]);

        foreach ($validated['remarks'] as $remark) {
            TerminalRemark::updateOrCreate(
                [
                    'student_id' => $remark['student_id'],
                    'academic_session_id' => $validated['academic_session_id'],
                    'term_id' => $validated['term_id'],
                ],
                [
                    'form_teacher_remark' => $remark['form_teacher_remark'] ?? null,
                    'principal_remark' => $remark['principal_remark'] ?? null,
                ]
            );
        }

        return back()->with('success', 'Terminal remarks updated.');
    }

    public function storeAnnualRemarks(Request $request)
    {
        // Placeholder for annual remarks logic if needed, usually handled by PromotionController
        return back()->with('success', 'Annual remarks updated.');
    }

    /**
     * Generate annual report card data for multiple students in a class level.
     */
    public function bulkAnnualReportCard(Request $request, PromotionService $promotionService)
    {
        $sessionId = $request->academic_session_id ?? AcademicSession::latest()->first()?->id;
        $classId = $request->school_class_id;
        $rankingBasis = $request->query('ranking_basis', 'arm');

        if (!$sessionId || !$classId) {
            return redirect()->back()->with('error', 'Academic session or school class not specified.');
        }

        // Fetch all students who have annual results in this session and belong to this school class
        // We find students where their LATEST result in this session matches the school_class_id
        $studentIds = DB::table('results as r1')
            ->join('class_sections', 'r1.class_section_id', '=', 'class_sections.id')
            ->where('r1.academic_session_id', $sessionId)
            ->where('class_sections.school_class_id', $classId)
            ->where('r1.term_id', function ($query) use ($sessionId) {
                $query->selectRaw('MAX(r2.term_id)')
                    ->from('results as r2')
                    ->whereColumn('r2.student_id', 'r1.student_id')
                    ->where('r2.academic_session_id', $sessionId);
            })
            ->distinct()
            ->pluck('r1.student_id');

        if ($studentIds->isEmpty()) {
            return redirect()->back()->with('error', 'No annual results found for the selected class level.');
        }

        $students = Student::whereIn('id', $studentIds)->orderBy('surname')->get();
        
        $allAnnualResults = AnnualResult::whereIn('student_id', $studentIds)
            ->where('academic_session_id', $sessionId)
            ->with('subject')
            ->get()
            ->groupBy('student_id');

        $promotionDecisions = PromotionDecision::whereIn('student_id', $studentIds)
            ->where('academic_session_id', $sessionId)
            ->get()
            ->keyBy('student_id');

        $psychomotorRatings = StudentPsychomotorRating::whereIn('student_id', $studentIds)
            ->where('academic_session_id', $sessionId)
            ->with(['skill', 'skill.category'])
            ->get()
            ->groupBy('student_id');

        $reportSettings = ResultSetting::getByKey('report_card_settings', []);
        $grades = Grade::orderBy('min_score', 'desc')->get();
        $generalSettings = [
            'school_identity' => GeneralSetting::get('school_identity'),
            'theme_colors' => GeneralSetting::get('theme_colors'),
        ];

        // Prepare data for each student
        $studentsData = $students->map(function($student) use (
            $allAnnualResults, $promotionDecisions, $psychomotorRatings, 
            $sessionId, $rankingBasis, $grades, $classId
        ) {
            $annualResults = $allAnnualResults->get($student->id, collect());
            
            // Determine historic class for this student
            $historicResult = Result::where('student_id', $student->id)
                ->where('academic_session_id', $sessionId)
                ->orderBy('term_id', 'desc')
                ->select('class_section_id')
                ->first();
                
            $sectionId = $historicResult ? $historicResult->class_section_id : $student->class_section_id;
            $historicClass = ClassSection::with(['schoolClass', 'classArm', 'formTeacher'])->find($sectionId);

            // Determine peer group for ranking
            if ($rankingBasis === 'class') {
                $peerIds = DB::table('results as r1')
                    ->join('class_sections', 'r1.class_section_id', '=', 'class_sections.id')
                    ->where('r1.academic_session_id', $sessionId)
                    ->where('class_sections.school_class_id', $classId)
                    ->where('r1.term_id', function ($query) use ($sessionId) {
                        $query->selectRaw('MAX(r2.term_id)')
                            ->from('results as r2')
                            ->whereColumn('r2.student_id', 'r1.student_id')
                            ->where('r2.academic_session_id', $sessionId);
                    })
                    ->distinct()
                    ->pluck('r1.student_id');
            } else {
                $peerIds = DB::table('results as r1')
                    ->where('r1.academic_session_id', $sessionId)
                    ->where('r1.class_section_id', $sectionId)
                    ->where('r1.term_id', function ($query) use ($sessionId) {
                        $query->selectRaw('MAX(r2.term_id)')
                            ->from('results as r2')
                            ->whereColumn('r2.student_id', 'r1.student_id')
                            ->where('r2.academic_session_id', $sessionId);
                    })
                    ->distinct()
                    ->pluck('r1.student_id');
            }

            $allPeerAverages = AnnualResult::whereIn('student_id', $peerIds)
                ->where('academic_session_id', $sessionId)
                ->select('student_id', DB::raw('AVG(annual_score) as avg_score'))
                ->groupBy('student_id')
                ->orderBy('avg_score', 'desc')
                ->get();

            $studentAvgStats = $allPeerAverages->firstWhere('student_id', $student->id);
            $studentAvg = $studentAvgStats ? $studentAvgStats->avg_score : 0;
            $position = $allPeerAverages->filter(function($item) use ($studentAvg) {
                return round($item->avg_score, 2) > round($studentAvg, 2);
            })->count() + 1;
            $totalInPeerGroup = $allPeerAverages->count();

            // Process results for ranking and grades
            foreach ($annualResults as $res) {
                $subjectStats = AnnualResult::whereIn('student_id', $peerIds)
                    ->where('academic_session_id', $sessionId)
                    ->where('subject_id', $res->subject_id);
                
                $res->subject_total_students = $subjectStats->count();
                $res->position = $subjectStats->clone() 
                    ->where('annual_score', '>', $res->annual_score)
                    ->count() + 1;
                
                $gradeObj = $grades->first(fn($g) => $res->annual_score >= $g->min_score);
                if ($gradeObj) {
                    $res->setAttribute('grade', $gradeObj->name);
                    $res->grade_remark = $gradeObj->remarks;
                }
            }

            // Subject stats for the card
            $annualSubjectStats = [];
            if ($annualResults->isNotEmpty()) {
                $stats = AnnualResult::whereIn('student_id', $peerIds)
                    ->where('academic_session_id', $sessionId)
                    ->whereIn('subject_id', $annualResults->pluck('subject_id'))
                    ->select('subject_id', DB::raw('AVG(annual_score) as average'))
                    ->groupBy('subject_id')
                    ->get();

                foreach ($stats as $s) {
                    $annualSubjectStats[$s->subject_id] = round($s->average, 1);
                }
            }

            // Clone student and set historic relations
            $studentCopy = clone $student;
            $studentCopy->setRelation('classSection', $historicClass);

            return [
                'student' => $studentCopy,
                'annualResults' => $annualResults->sortBy('position')->values(),
                'overall' => [
                    'average' => round($studentAvg, 1),
                    'position' => $position,
                    'total_students' => $totalInPeerGroup,
                ],
                'promotionDecision' => $promotionDecisions->get($student->id),
                'psychomotor' => $psychomotorRatings->get($student->id, collect()),
                'historicClass' => $historicClass,
                'annualSubjectStats' => $annualSubjectStats,
            ];
        })->sortBy('overall.position')->values();

        return Inertia::render('Results/BulkAnnualReportCard', [
            'studentsData' => $studentsData,
            'session' => AcademicSession::find($sessionId),
            'grades' => $grades,
            'reportSettings' => $reportSettings,
            'settings' => $generalSettings,
            'rankingBasis' => $rankingBasis,
            'schoolClass' => SchoolClass::find($classId),
        ]);
    }

    public function broadsheet(Request $request, PromotionService $promotionService)
    {
        $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'term_id' => 'nullable|exists:terms,id',
            'class_section_id' => 'required|exists:class_sections,id',
        ]);

        $sessionId = $request->academic_session_id;
        $termId = $request->term_id;
        $sectionId = $request->class_section_id;

        $session = AcademicSession::with('terms')->findOrFail($sessionId);
        $term = $termId ? Term::findOrFail($termId) : null;
        $classSection = ClassSection::with(['schoolClass', 'classArm', 'formTeacher'])->findOrFail($sectionId);

        // Fetch students who have results in this session/term/class
        $studentIdsWithResults = Result::where('academic_session_id', $sessionId)
            ->where('class_section_id', $sectionId)
            ->when($termId, fn($q) => $q->where('term_id', $termId))
            ->pluck('student_id')
            ->unique();

        $students = Student::whereIn('id', $studentIdsWithResults)
            ->orderBy('surname')
            ->get();

        // Fetch all subjects taught in this class section
        // We get subjects that actually have results to avoid empty columns
        $subjectIds = Result::where('academic_session_id', $sessionId)
            ->where('class_section_id', $sectionId)
            ->when($termId, fn($q) => $q->where('term_id', $termId))
            ->pluck('subject_id')
            ->unique();

        $subjects = Subject::whereIn('id', $subjectIds)->orderBy('name')->get();

        $rule = $promotionService->getPromotionRule($session, $classSection->schoolClass);
        $passMark = $rule->min_average;

        // Load all results for these students/session/term/class
        $allResults = Result::where('academic_session_id', $sessionId)
            ->where('class_section_id', $sectionId)
            ->when($termId, fn($q) => $q->where('term_id', $termId))
            ->get();

        // Compute rankings
        // We calculate the average for each student to determine their rank
        $studentAverages = $allResults->groupBy('student_id')->map(function ($results) use ($passMark) {
            return [
                'total' => $results->sum('total_score'),
                'avg' => $results->avg('total_score'),
                'passed_count' => $results->filter(fn($r) => $r->total_score >= $passMark)->count(), // Default $passMark for now
            ];
        })->sortByDesc('avg')->values();

        $broadsheet = $students->map(function ($student) use ($allResults, $subjects, $studentAverages, $passMark) {
            $studentResults = $allResults->where('student_id', $student->id);
            $scores = [];
            foreach ($subjects as $subject) {
                $res = $studentResults->firstWhere('subject_id', $subject->id);
                $scores[$subject->id] = $res ? $res->total_score : null;
            }

            $total = $studentResults->sum('total_score');
            $avg = $studentResults->avg('total_score') ?: 0;
            
            $rankIndex = $studentAverages->search(fn($s) => bccomp($s['avg'], $avg, 2) === 0 && bccomp($s['total'], $total, 2) === 0);
            $position = ($rankIndex !== false) ? $rankIndex + 1 : '-';

            return [
                'student' => $student,
                'scores' => $scores,
                'total_score' => $total,
                'average' => round($avg, 1),
                'grade' => $this->getGradeForScore($avg),
                'position' => $position,
                'passed_count' => $studentResults->filter(fn($r) => $r->total_score >= $passMark)->count(),
                'status' => $avg >= $passMark ? 'PASSED' : 'FAILED',
            ];
        })->sortBy('position')->values();

        // Calculate subject stats
        $subjectStats = [];
        foreach ($subjects as $subject) {
            $subjectResults = $allResults->where('subject_id', $subject->id);
            $subjectStats[$subject->id] = [
                'average' => round($subjectResults->avg('total_score') ?: 0, 1),
                'passed' => $subjectResults->filter(fn($r) => $r->total_score >= $passMark)->count(),
                'failed' => $subjectResults->filter(fn($r) => $r->total_score < $passMark)->count(),
            ];
        }

        $schoolSettings = ResultSetting::getByKey('report_card_settings', []);
        // Inject identity and theme from GeneralSetting
        $schoolSettings['identity'] = GeneralSetting::get('school_identity');
        $schoolSettings['theme'] = GeneralSetting::get('theme_colors');

        $criteria = $promotionService->getCriteriaList($rule, true); // true for termly

        return Inertia::render('Results/Broadsheet', [
            'session' => $session,
            'term' => $term,
            'classSection' => $classSection->load(['schoolClass', 'classArm']),
            'subjects' => $subjects,
            'broadsheet' => $broadsheet,
            'subjectStats' => $subjectStats,
            'schoolSettings' => $schoolSettings,
            'policy' => [
                'criteria' => $criteria,
                'pass_mark' => $rule->min_average,
                'min_avg_score' => $rule->min_average,
            ],
            'formTeacherName' => $classSection->formTeacher ? $classSection->formTeacher->name : 'N/A',
        ]);
    }

    private function getGradeForScore($score)
    {
        $grade = Grade::where('min_score', '<=', $score)
            ->orderBy('min_score', 'desc')
            ->first();

        return $grade ? $grade->name : '-';
    }

    private function calculatePositions($sessionId, $termId, $classSectionId, $subjectId)
    {
        $results = Result::where('academic_session_id', $sessionId)
            ->where('term_id', $termId)
            ->where('class_section_id', $classSectionId)
            ->where('subject_id', $subjectId)
            ->orderBy('total_score', 'desc')
            ->get();

        $rank = 1;
        $prevScore = null;
        $prevRank = 1;

        foreach ($results as $index => $result) {
            if ($prevScore !== null && $result->total_score == $prevScore) {
                $currentRank = $prevRank;
            } else {
                $currentRank = $index + 1;
            }
            
            $result->update(['position' => $currentRank]);

            $prevScore = $result->total_score;
            $prevRank = $currentRank;
        }
    }
}
