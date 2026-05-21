<?php

namespace App\Http\Controllers;

use App\Models\Result;
use App\Models\Student;
use App\Models\Subject;
use App\Models\AcademicSession;
use App\Models\Term;
use App\Models\ClassSection;
use App\Models\ResultSetting;
use App\Models\Grade;
use App\Models\PsychomotorSkillCategory;
use App\Models\TerminalRemark;
use App\Models\PromotionRule;
use App\Models\SchoolClass;
use App\Models\AnnualResult;
use App\Models\PromotionDecision;
use App\Models\StudentPsychomotorRating;
use App\Models\ResultPin;
use App\Services\PromotionService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ResultManagementController extends Controller
{
    protected $promotionService;

    public function __construct(PromotionService $promotionService)
    {
        $this->promotionService = $promotionService;
    }

    public function index(Request $request)
    {
        $tab = $request->query('tab', 'overview');
        $sessions = AcademicSession::with('terms')->orderBy('name', 'desc')->get();
        $currentSession = AcademicSession::where('is_current', true)->first() ?? $sessions->first();
        $sessionId = $request->academic_session_id ?? ($currentSession->id ?? null);
        $session = $sessions->firstWhere('id', $sessionId) ?? $currentSession;

        // Resolve term accurately
        $termId = $request->term_id ?? ($session && $session->is_current 
            ? ($session->terms()->where('is_current', true)->first()->id ?? $session->terms()->first()->id ?? null) 
            : ($session?->terms()->first()->id ?? null));
        $term = $session ? $session->terms()->firstWhere('id', $termId) : null;

        $classSectionsQuery = ClassSection::with(['schoolClass', 'classArm', 'formTeacher'])
            ->join('school_classes', 'class_sections.school_class_id', '=', 'school_classes.id')
            ->orderBy('school_classes.level')
            ->orderBy('school_classes.name')
            ->select('class_sections.*');

        $user = $request->user();
        // ... (teacher check)
        if ($user->hasRole('Teacher') && !$user->hasRole('Super Admin') && !$user->hasRole('Admin')) {
            // Allow if Form Teacher OR Subject Teacher
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
            // We need 'teacher_id' from pivot to filter for subject teachers
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
             // For the global subject dropdown, we might still want to restrict...
             // BUT if they are a Form Teacher, they might want to filter by "Maths" across their classes?
             // If we restrict global list, they can't.
             // Let's leave global list restricted to "Assigned Subjects" for now to avoid clutter,
             // knowing that selecting the Class first will give them the full list via dynamic logic.
            $subjectsQuery->whereExists(function ($q) use ($user) {
                $q->select(DB::raw(1))
                  ->from('class_section_subjects')
                  ->whereColumn('class_section_subjects.subject_id', 'subjects.id')
                  ->where('class_section_subjects.teacher_id', $user->id);
            });
        }
        
        $subjects = $subjectsQuery->get();
        $currentTerm = $currentSession ? $currentSession->terms()->where('is_current', true)->first() ?? $currentSession->terms()->first() : null;

        $data = [
            'sessions' => $sessions,
            'classSections' => $classSections,
            'subjects' => $subjects,
            'active_tab' => $tab,
            'filters' => $request->only(['academic_session_id', 'term_id', 'class_section_id', 'subject_id', 'school_class_id', 'ranking_basis']),
            'caConfig' => ResultSetting::getByKey('ca_config', [
                ['name' => '1st CA', 'max_score' => 20],
                ['name' => '2nd CA', 'max_score' => 20],
            ]),
            'globalRule' => $session ? $this->promotionService->getPromotionRule($session) : null,
            'reportCardSettings' => array_merge([
                'show_next_term_fee' => true,
                'show_next_term_begin' => true,
                'show_next_term_end' => true,
                'show_class_highest' => true,
                'show_class_lowest' => true,
                'show_class_average' => true,
                'require_principal_signature' => true,
                'require_form_teacher_signature' => true,
                'annual_ranking_basis' => 'class',
            ], ResultSetting::getByKey('report_card_settings', [])),
            'grades' => Grade::orderBy('min_score', 'desc')->get(),
            'psychomotorCategories' => PsychomotorSkillCategory::with('skills')->get(),
            'promotionRules' => $currentSession ? PromotionRule::where('academic_session_id', $currentSession->id)->get() : [],
            'currentTerm' => $currentTerm,
            'levels' => SchoolClass::orderBy('level')->get(),
        ];

        if ($tab === 'overview') {
            if ($request->filled(['class_section_id', 'subject_id'])) {
                $query = Result::with([
                    'student.promotionDecisions' => function ($q) use ($sessionId) {
                        $q->where('academic_session_id', $sessionId);
                    },
                    'student', 'subject', 'academicSession', 'term', 'classSection.schoolClass', 'classSection.classArm'
                ]);

                $query->where('class_section_id', $request->class_section_id)
                      ->where('subject_id', $request->subject_id)
                      ->where('academic_session_id', $sessionId);
                
                if ($termId) {
                    $query->where('term_id', $termId);
                }

                $results = $query->latest()->paginate(50)->withQueryString();
                $data['results'] = $results;
            } else {
                $data['results'] = Result::where('id', 0)->paginate(50);
            }
        }

        if ($tab === 'report-cards') {
            if ($request->filled(['class_section_id'])) {
                $classSectionId = $request->class_section_id;
                
                // Fetch students who were in this class (via results)
                $historicStudentIds = Result::where('academic_session_id', $sessionId)
                    ->where('term_id', $termId)
                    ->where('class_section_id', $classSectionId)
                    ->pluck('student_id')
                    ->unique();

                $studentQuery = Student::query();

                $studentQuery->where(function($q) use ($historicStudentIds, $session, $classSectionId) {
                    $q->whereIn('id', $historicStudentIds);

                    if ($session->is_current) {
                        $q->orWhere('class_section_id', $classSectionId);
                    }
                });

                $students = $studentQuery->withAvg(['results' => function ($query) use ($sessionId, $termId) {
                        $query->where('academic_session_id', $sessionId)
                              ->where('term_id', $termId);
                    }], 'total_score')
                    ->orderByDesc('results_avg_total_score')
                    ->orderBy('surname')
                    ->paginate(50)
                    ->withQueryString();

                // Manually load the requested class to display it correctly (overriding current class)
                $requestedClass = $classSections->firstWhere('id', $classSectionId);
                if ($requestedClass) {
                    $students->getCollection()->each(function ($student) use ($requestedClass, $classSectionId) {
                        $student->class_section_id = $classSectionId;
                        $student->setRelation('classSection', $requestedClass);
                    });
                }

                $data['reportCardStudents'] = $students;
            } else {
                $data['reportCardStudents'] = Student::where('id', 0)->paginate(50);
            }
        }

        if ($tab === 'psychomotor') {
            $categories = PsychomotorSkillCategory::with('skills')->get();
            $data['categories'] = $categories;
            
            if ($request->filled(['class_section_id'])) {
                $classSectionId = $request->class_section_id;
                $historicStudentIds = Result::where('academic_session_id', $sessionId)
                    ->where('term_id', $termId)
                    ->where('class_section_id', $classSectionId)
                    ->pluck('student_id')
                    ->unique();

                $studentQuery = Student::query();

                $studentQuery->where(function($q) use ($historicStudentIds, $session, $classSectionId) {
                    if ($historicStudentIds->isNotEmpty()) {
                        $q->whereIn('id', $historicStudentIds);
                    }

                    if ($session->is_current) {
                        $q->orWhere('class_section_id', $classSectionId);
                    } elseif ($historicStudentIds->isEmpty()) {
                        $q->whereRaw('1=0');
                    }
                });

                $students = $studentQuery->with(['psychomotorRatings' => function($query) use ($sessionId, $termId) {
                        $query->where('academic_session_id', $sessionId)
                              ->where('term_id', $termId);
                    }])
                    ->orderBy('surname')
                    ->get();

                // Override class context
                $requestedClass = $classSections->firstWhere('id', $classSectionId);
                if ($requestedClass) {
                    $students->each(function ($student) use ($requestedClass, $classSectionId) {
                        $student->class_section_id = $classSectionId;
                        $student->setRelation('classSection', $requestedClass);
                    });
                }

                $data['psychomotorStudents'] = $students;
            } else {
                $data['psychomotorStudents'] = [];
            }
        }

        // Added logic for 'remarks' tab
        if ($tab === 'remarks') {
            if ($request->filled(['class_section_id'])) {
                $classSectionId = $request->class_section_id;
                
                $historicStudentIds = Result::where('academic_session_id', $sessionId)
                    ->where('term_id', $termId)
                    ->where('class_section_id', $classSectionId)
                    ->pluck('student_id')
                    ->unique();

                $studentQuery = Student::query();

                $studentQuery->where(function($q) use ($historicStudentIds, $session, $classSectionId) {
                    if ($historicStudentIds->isNotEmpty()) {
                        $q->whereIn('id', $historicStudentIds);
                    }

                    if ($session->is_current) {
                        $q->orWhere('class_section_id', $classSectionId);
                    } elseif ($historicStudentIds->isEmpty()) {
                        $q->whereRaw('1=0');
                    }
                });

                $students = $studentQuery->with(['terminalRemarks' => function($query) use ($sessionId, $termId) {
                        $query->where('academic_session_id', $sessionId)
                              ->where('term_id', $termId);
                    }])
                    ->orderBy('surname')
                    ->get();

                // Compute overall class rankings for context
                $rankings = Result::where('academic_session_id', $sessionId)
                    ->where('term_id', $termId)
                    ->where('class_section_id', $classSectionId)
                    ->select('student_id', DB::raw('AVG(total_score) as avg_score'))
                    ->groupBy('student_id')
                    ->orderBy('avg_score', 'desc')
                    ->get();

                // Inject performance stats for AI remarks
                $requestedClass = $classSections->firstWhere('id', $classSectionId);

                // Pre-calculate positions with tie handling
                $rankedMap = [];
                $prevScore = null;
                $prevRank = null;
                foreach ($rankings as $index => $r) {
                    $score = round($r->avg_score, 2);
                    if ($prevScore !== null && $score == $prevScore) {
                        $currentRank = $prevRank;
                    } else {
                        $currentRank = $index + 1;
                    }
                    $rankedMap[$r->student_id] = [
                        'rank' => $currentRank,
                        'avg' => $score
                    ];
                    $prevScore = $score;
                    $prevRank = $currentRank;
                }

                $students->each(function($student) use ($rankedMap, $sessionId, $termId, $session, $requestedClass, $classSectionId, $rankings) {
                    $student->class_section_id = $classSectionId;
                    $student->setRelation('classSection', $requestedClass);
                    
                    $rankData = $rankedMap[$student->id] ?? null;
                    $student->average_score = $rankData ? $rankData['avg'] : 0;
                    
                    if ($rankData) {
                        $student->position = $rankData['rank'];
                    } else {
                        $student->position = 'N/A';
                    }
                    $student->total_in_class = $rankings->count();

                    // Evaluate Pass/Fail Status
                    $termModel = $termId ? Term::find($termId) : null;
                    $sectionModel = $classSectionId ? ClassSection::find($classSectionId) : null;
                    $eval = ($session && $sectionModel && $termModel) 
                        ? $this->promotionService->evaluateTermlyPass($student, $session, $sectionModel, $termModel)
                        : null;
                    $student->evaluated_status = $eval ? $eval['status'] : 'Pending';
                });

                $data['remarksStudents'] = $students;
            } else {
                $data['remarksStudents'] = [];
            }
        }

        if ($tab === 'broadsheet') {
            if ($request->filled(['academic_session_id', 'class_section_id'])) {
                $classSectionId = $request->class_section_id;

                // Find students who have results in this session/class (to handle past session viewing)
                $studentIdsFromResults = Result::where('academic_session_id', $sessionId)
                    ->where('class_section_id', $classSectionId)
                    ->pluck('student_id')
                    ->unique();

                $studentQuery = Student::query();

                $studentQuery->where(function($q) use ($studentIdsFromResults, $session, $classSectionId) {
                    if ($studentIdsFromResults->isNotEmpty()) {
                        $q->whereIn('id', $studentIdsFromResults);
                    }

                    if ($session->is_current) {
                        $q->orWhere('class_section_id', $classSectionId);
                    } elseif ($studentIdsFromResults->isEmpty()) {
                        $q->whereRaw('1=0');
                    }
                });

                $students = $studentQuery->with(['annualResults' => function($query) use ($sessionId) {
                        $query->where('academic_session_id', $sessionId)
                              ->with('subject');
                    }])
                    ->withAvg(['annualResults' => function($query) use ($sessionId) {
                        $query->where('academic_session_id', $sessionId);
                    }], 'annual_score')
                    ->orderByDesc('annual_results_avg_annual_score')
                    ->orderBy('surname')
                    ->get();

                // Override class context
                $requestedClass = $classSections->firstWhere('id', $classSectionId);
                if ($requestedClass) {
                    $students->each(function ($student) use ($requestedClass, $classSectionId) {
                        $student->class_section_id = $classSectionId;
                        $student->setRelation('classSection', $requestedClass);
                    });
                }
                
                // Only include subjects that have results in this class/session to avoid overly wide tables
                $subjectIdsWithResults = Result::where('academic_session_id', $sessionId)
                    ->where('class_section_id', $classSectionId)
                    ->pluck('subject_id')
                    ->unique();

                $data['broadsheetStudents'] = $students;
                $data['broadsheetSubjects'] = Subject::whereIn('id', $subjectIdsWithResults)->orderBy('name')->get();
            } else {
                $data['broadsheetStudents'] = [];
                $data['broadsheetSubjects'] = [];
            }
        }

        if ($tab === 'annual-reports') {
            if ($request->filled(['school_class_id'])) {
                $rankingBasis = $request->query('ranking_basis', 'arm'); // 'arm' or 'class'
                
                // Fetch all students who have results in this Class Level + Session
                $studentIdsFromResults = Result::where('academic_session_id', $sessionId)
                    ->whereHas('classSection', function($q) use ($request) {
                        $q->where('school_class_id', $request->school_class_id);
                    })
                    ->pluck('student_id')
                    ->unique();

                $studentQuery = Student::query();

                $studentQuery->where(function($q) use ($studentIdsFromResults, $session, $request) {
                    if ($studentIdsFromResults->isNotEmpty()) {
                        $q->whereIn('id', $studentIdsFromResults);
                    }

                    if ($session->is_current) {
                        $q->orWhereIn('class_section_id', function($sub) use ($request) {
                            $sub->select('id')->from('class_sections')->where('school_class_id', $request->school_class_id);
                        });
                    } elseif ($studentIdsFromResults->isEmpty()) {
                        $q->whereRaw('1=0');
                    }
                });

                $students = $studentQuery->with(['annualResults' => function($query) use ($sessionId) {
                        $query->where('academic_session_id', $sessionId);
                    }, 'promotionDecisions' => function($query) use ($sessionId) {
                        $query->where('academic_session_id', $sessionId);
                    }, 'classSection.schoolClass', 'classSection.classArm'])
                    // We need to eager load the HISTORIC class section if possible. 
                    ->get();
                
                // Post-processing to attach correct class info
                foreach ($students as $student) {
                    // Find the LATEST result for this student in this session to determine their final class
                    $result = Result::where('student_id', $student->id)
                        ->where('academic_session_id', $sessionId)
                        ->orderBy('term_id', 'desc') // Critical: Get the final class they were in
                        ->first();
                        
                    if ($result && $result->class_section_id !== $student->class_section_id) {
                        $historicClass = ClassSection::with(['schoolClass', 'classArm'])->find($result->class_section_id);
                        if ($historicClass) {
                            $student->setRelation('classSection', $historicClass);
                            // CRITICAL: Update the attribute so groupBy() works correctly below
                            $student->class_section_id = $result->class_section_id;
                        }
                    }
                }
                    
                // Update: The logic regarding "active students" in the current session was causing issues when viewing past sessions 
                // because of complex OR conditions. For simplicity and correctness, the Annual Report should reflect 
                // ACADEMIC RECORDS. If a student is in the class but has done 0 assignments/exams, do they need a report? 
                // Usually not, or they should have at least empty result records initialized.
                // If the user insists on seeing students without results, we would need a separate strict query.
                // But given the "leak" issue, strict result-based fetching is safer.
                    
                // FURTHER FILTERING: ensure we don't accidentally pull students via the "orWhere" clause who shouldn't be here if session is past.
                // Actually the orWhere closure handles the logic.
                // But let's double check if any student crept in.
                // If a student has results but for a DIFFERENT class level in this session (e.g. repeated), 
                // the first clause filtered by result->classSection->school_class_id. 
                // So if they have results in JSS1, they come in. If they have results in JSS2, they don't.
                // This looks correct.

                // Compute Ranks
                // 1. Group by needed scope
                if ($rankingBasis === 'class') {
                    // Rank against everyone in the level
                    $groupKey = 'school_class_id';
                } else {
                    // Rank against everyone in the arm
                    $groupKey = 'class_section_id';
                }

                // Calculate averages for ranking
                $students->each(function($student) {
                    $student->annual_avg = $student->annualResults->avg('annual_score') ?: 0;
                });

                // Perform ranking with tie handling
                if ($rankingBasis === 'class') {
                    $sorted = $students->sortByDesc('annual_avg')->values();
                    $prevScore = null;
                    $prevRank = null;
                    
                    $sorted->each(function($student, $index) use (&$prevScore, &$prevRank, $sorted) {
                        $score = round($student->annual_avg, 2);
                        if ($prevScore !== null && $score == $prevScore) {
                            $student->rank = $prevRank;
                        } else {
                            $student->rank = $index + 1;
                        }
                        $prevScore = $score;
                        $prevRank = $student->rank;
                        $student->rank_total = $sorted->count();
                        $student->rank_scope = 'Class Level';
                    });
                } else {
                    // Group by section
                    $sections = $students->groupBy('class_section_id');
                    $sections->each(function($sectionStudents) {
                        $sorted = $sectionStudents->sortByDesc('annual_avg')->values();
                        $prevScore = null;
                        $prevRank = null;
                        
                        $sorted->each(function($student, $index) use (&$prevScore, &$prevRank, $sorted) {
                            $score = round($student->annual_avg, 2);
                            if ($prevScore !== null && $score == $prevScore) {
                                $student->rank = $prevRank;
                            } else {
                                $student->rank = $index + 1;
                            }
                            $prevScore = $score;
                            $prevRank = $student->rank;
                            $student->rank_total = $sorted->count();
                            $student->rank_scope = 'Class Arm';
                        });
                    });
                }

                $data['annualReportStudents'] = $students->sortBy('rank')->values();
            } else {
                $data['annualReportStudents'] = [];
            }
        }

        if ($tab === 'analysis') {
            if ($request->filled(['academic_session_id', 'class_section_id'])) {
                $classSectionId = $request->class_section_id;
                
                // Get all results for this class and session
                $resultsQuery = Result::where('academic_session_id', $sessionId)
                    ->where('class_section_id', $classSectionId);
                
                if ($termId) {
                    $resultsQuery->where('term_id', $termId);
                }

                $results = $resultsQuery->with('student')->get();
                
                // 1. Grade Distribution (Student-Based Overall Grade)
                $allGrades = Grade::orderBy('min_score', 'desc')->get();
                $studentGrades = $results->groupBy('student_id')->map(function($studentResults) use ($allGrades) {
                    $avg = $studentResults->avg('total_score');
                    // Find matching grade from pre-fetched collection
                    $grade = $allGrades->first(fn($g) => $avg >= $g->min_score);
                    return $grade ? $grade->name : 'F';
                });

                $gradeDistribution = $allGrades->sortBy('min_score')->map(function($grade) use ($studentGrades) {
                    return [
                        'name' => $grade->name,
                        'value' => $studentGrades->filter(fn($g) => $g === $grade->name)->count()
                    ];
                })->values();
                
                // 2. Pass/Fail Ratio (Student-Based)
                $promotionService = app(PromotionService::class);
                $session = AcademicSession::find($sessionId);
                $term = $termId ? Term::find($termId) : null;
                $classSection = ClassSection::find($classSectionId);

                $studentStatuses = $results->unique('student_id')->map(function($result) use ($promotionService, $session, $term, $classSection) {
                    if (!$session || !$classSection || !$term) return 'Passed';
                    
                    $evaluation = $promotionService->evaluateTermlyPass(
                        $result->student, 
                        $session, 
                        $classSection, 
                        $term
                    );
                    
                    return $evaluation ? ($evaluation['status'] ?? 'Passed') : 'Passed';
                });

                $passCount = $studentStatuses->filter(fn($s) => $s === 'Passed')->count();
                $failCount = $studentStatuses->filter(fn($s) => $s === 'Failed')->count();
                
                $passFailRatio = [
                    ['name' => 'Passed Students', 'value' => $passCount, 'color' => '#10b981'],
                    ['name' => 'Failed Students', 'value' => $failCount, 'color' => '#f43f5e']
                ];
                
                // 3. Subject Performance (Class Averages & Pass Rates)
                $subjectAverages = $results->groupBy('subject_id')
                    ->map(function($group) {
                        $subject = Subject::find($group->first()->subject_id);
                        $total = $group->count();
                        $passed = $group->filter(fn($r) => $r->total_score >= 40)->count();
                        
                        return [
                            'name' => $subject ? $subject->name : 'Unknown',
                            'average' => round($group->avg('total_score'), 1),
                            'pass_rate' => $total > 0 ? round(($passed / $total) * 100, 1) : 0,
                            'total_students' => $total,
                            'passed_students' => $passed,
                            'failed_students' => $total - $passed
                        ];
                    })->values()->sortByDesc('average')->values();
                
                // 4. Performance Summary
                $stats = [
                    'highest_score' => $results->max('total_score') ?: 0,
                    'lowest_score' => $results->min('total_score') ?: 0,
                    'overall_average' => round($results->avg('total_score') ?: 0, 1),
                    'total_entries' => $results->count(),
                    'total_students' => $results->unique('student_id')->count()
                ];
                
                $data['analysisData'] = [
                    'gradeDistribution' => $gradeDistribution,
                    'passFailRatio' => $passFailRatio,
                    'subjectAverages' => $subjectAverages,
                    'stats' => $stats
                ];
            } else {
                $data['analysisData'] = null;
            }
        }

        if ($tab === 'pins') {
             $data['pinHistory'] = ResultPin::selectRaw('academic_session_id, term_id, DATE(created_at) as created_date, count(*) as count, generated_by')
                ->groupBy('academic_session_id', 'term_id', 'created_date', 'generated_by')
                ->with(['academicSession', 'term', 'creator'])
                ->orderBy('created_date', 'desc')
                ->get();
        }

        if ($tab === 'settings') {
            // Settings already included in global $data
        }

        return Inertia::render('ResultManagement/Index', $data);
    }

    public function storePsychomotor(Request $request)
    {
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
                [
                    'rating' => $rating['rating']
                ]
            );
        }

        return back()->with('success', 'Psychomotor ratings synchronized successfully.');
    }

    public function publishResults(Request $request)
    {
        $validated = $request->validate([
            'term_id' => 'required|exists:terms,id',
            'publish' => 'required|boolean'
        ]);

        $term = Term::findOrFail($validated['term_id']);
        
        $term->update([
            'result_published_at' => $validated['publish'] ? now() : null
        ]);

        $status = $validated['publish'] ? 'published' : 'unpublished';
        return back()->with('success', "Results for {$term->name} have been {$status}.");
    }
}
