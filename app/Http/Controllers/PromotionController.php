<?php

namespace App\Http\Controllers;

use App\Models\AcademicSession;
use App\Models\ClassSection;
use App\Models\Student;
use App\Models\PromotionRule;
use App\Models\AnnualResult;
use App\Models\PromotionDecision;
use App\Services\PromotionService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class PromotionController extends Controller
{
    protected $promotionService;

    public function __construct(PromotionService $promotionService)
    {
        $this->promotionService = $promotionService;
    }

    /**
     * Display the promotion manager.
     */
    public function index(Request $request)
    {
        $sessions = AcademicSession::orderBy('name', 'desc')->get();
        $classSections = ClassSection::with(['schoolClass:id,name,level', 'classArm:id,name'])
            ->join('school_classes', 'class_sections.school_class_id', '=', 'school_classes.id')
            ->orderBy('school_classes.level')
            ->orderBy('school_classes.name')
            ->select('class_sections.*')
            ->get();
        
        $currentSession = AcademicSession::where('is_current', true)->first() ?? $sessions->first();
        
        $students = [];
        $rule = null;

        if ($request->filled('class_section_id')) {
            $section = ClassSection::with('schoolClass')->findOrFail($request->class_section_id);
            $rule = $this->promotionService->getPromotionRule($currentSession, $section->schoolClass);

            $students = Student::where('class_section_id', $request->class_section_id)
                ->with(['annualResults' => function($q) use ($currentSession) {
                    $q->where('academic_session_id', $currentSession->id);
                }, 'promotionDecisions' => function($q) use ($currentSession) {
                    $q->where('academic_session_id', $currentSession->id);
                }])
                ->orderBy('surname')
                ->get();

            // Attach evaluation suggestions
            $students->each(function($student) use ($currentSession, $section) {
                $eval = $this->promotionService->evaluatePromotion($student, $currentSession, $section);
                $student->evaluation = $eval;
            });
        }

        return Inertia::render('Promotions/Index', [
            'sessions' => $sessions,
            'classSections' => $classSections,
            'students' => $students,
            'currentSession' => $currentSession,
            'rule' => $rule,
            'filters' => $request->only(['class_section_id'])
        ]);
    }

    /**
     * Compute annual results for a class section.
     */
    public function computeAnnual(Request $request)
    {
        $request->validate(['class_section_id' => 'required|exists:class_sections,id']);
        
        $section = ClassSection::findOrFail($request->class_section_id);
        $session = AcademicSession::where('is_current', true)->first();
        
        $students = Student::where('class_section_id', $section->id)->get();
        
        DB::transaction(function() use ($students, $session, $section) {
            foreach ($students as $student) {
                $this->promotionService->computeAnnualResults($student, $session, $section);
                
                // Auto-evaluate and save decision
                $evaluation = $this->promotionService->evaluatePromotion($student, $session, $section);
                if ($evaluation) {
                    // Check for existing manual override
                    $existing = PromotionDecision::where('student_id', $student->id)
                        ->where('academic_session_id', $session->id)
                        ->first();

                    if ($existing && in_array($existing->decision_method, ['manual_override', 'manual_bulk_override'])) {
                        // Update stats but keep status
                         $existing->update([
                            'annual_average' => $evaluation['average'],
                            'total_failed_subjects' => $evaluation['failed_count'],
                        ]);
                    } else {
                        // Save auto decision
                        PromotionDecision::updateOrCreate(
                            [
                                'student_id' => $student->id,
                                'academic_session_id' => $session->id
                            ],
                            [
                                'annual_average' => $evaluation['average'],
                                'total_failed_subjects' => $evaluation['failed_count'],
                                'status' => $evaluation['status'],
                                'decision_method' => 'auto',
                                'reason' => $evaluation['reason'],
                                'processed_by' => Auth::id(),
                                'is_locked' => false 
                            ]
                        );
                    }
                }
            }
        });

        return redirect()->back()->with('success', 'Annual results computed for the class.');
    }

    /**
     * Update promotion rules for a class.
     */
    public function updateRule(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|exists:promotion_rules,id',
            'min_average' => 'required|numeric|min:0|max:100',
            'trial_min_average' => 'nullable|numeric|min:0|max:100|lt:min_average',
            'max_failed_subjects' => 'required|integer|min:0',
            'pass_other_subjects_count' => 'required|integer|min:0',
            'core_subject_ids' => 'nullable|array',
            'is_rule1_termly' => 'boolean',
            'is_rule1_annual' => 'boolean',
            'is_rule2_termly' => 'boolean',
            'is_rule2_annual' => 'boolean',
            'is_rule3_termly' => 'boolean',
            'is_rule3_annual' => 'boolean',
            'is_rule4_termly' => 'boolean',
            'is_rule4_annual' => 'boolean',
        ]);

        $rule = PromotionRule::findOrFail($validated['id']);
        $rule->update($validated);

        return redirect()->back()->with('success', 'Promotion policy updated.');
    }

    /**
     * Finalize promotion decisions.
     */
    public function finalize(Request $request)
    {
        $validated = $request->validate([
            'decisions' => 'required|array',
            'decisions.*.student_id' => 'required|exists:students,id',
            'decisions.*.status' => 'required|string|in:Promoted,Not Promoted,Promoted on Trial',
            'decisions.*.average' => 'required|numeric',
            'decisions.*.failed_count' => 'required|integer',
            'decisions.*.is_override' => 'required|boolean',
            'decisions.*.reason' => 'nullable|string',
        ]);

        $session = AcademicSession::where('is_current', true)->first();

        DB::transaction(function() use ($validated, $session) {
            foreach ($validated['decisions'] as $d) {
                PromotionDecision::updateOrCreate(
                    [
                        'student_id' => $d['student_id'],
                        'academic_session_id' => $session->id
                    ],
                    [
                        'annual_average' => $d['average'],
                        'total_failed_subjects' => $d['failed_count'],
                        'status' => $d['status'],
                        'decision_method' => $d['is_override'] ? 'manual_override' : 'auto',
                        'reason' => $d['reason'],
                        'processed_by' => Auth::id(),
                        'is_locked' => true
                    ]
                );
            }
        });

        return redirect()->back()->with('success', 'Promotion decisions finalized and locked.');
    }

    /**
     * Promote students to next class (Old logic revamped).
     */
    public function promote(Request $request)
    {
        $validated = $request->validate([
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'exists:students,id',
            'target_class_section_id' => 'required|exists:class_sections,id',
            'target_academic_session_id' => 'required|exists:academic_sessions,id',
        ]);

        DB::transaction(function () use ($validated) {
            Student::whereIn('id', $validated['student_ids'])
                ->update([
                    'class_section_id' => $validated['target_class_section_id'],
                    'academic_session_id' => $validated['target_academic_session_id'],
                ]);
        });
        return redirect()->back()->with('success', count($validated['student_ids']) . ' students moved successfully.');
    }

    /**
     * Update a single student's promotion decision.
     */
    public function updateDecision(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'status' => 'required|string|in:Promoted,Not Promoted,Promoted on Trial',
            'reason' => 'nullable|string',
        ]);

        PromotionDecision::updateOrCreate(
            [
                'student_id' => $validated['student_id'],
                'academic_session_id' => $validated['academic_session_id']
            ],
            [
                'status' => $validated['status'],
                'reason' => $validated['reason'],
                'decision_method' => 'manual_override',
                'processed_by' => Auth::id(),
                'is_locked' => true
            ]
        );
        return redirect()->back()->with('success', 'Promotion decision updated.');
    }

    /**
     * Bulk update promotion decisions.
     */
    public function bulkUpdateDecisions(Request $request)
    {
        $validated = $request->validate([
            'decisions' => 'required|array',
            'decisions.*.student_id' => 'required|exists:students,id',
            'decisions.*.status' => 'required|string|in:Promoted,Not Promoted,Promoted on Trial',
            'academic_session_id' => 'required|exists:academic_sessions,id',
        ]);

        foreach ($validated['decisions'] as $decision) {
            PromotionDecision::updateOrCreate(
                [
                    'student_id' => $decision['student_id'],
                    'academic_session_id' => $validated['academic_session_id']
                ],
                [
                    'status' => $decision['status'],
                    'decision_method' => 'manual_bulk_override',
                    'processed_by' => Auth::id(),
                    'is_locked' => true
                ]
            );
        }

        return redirect()->back()->with('success', 'Bulk promotion decisions updated.');
    }
    /**
     * Reset/Unlock promotion decisions for a class level.
     */
    public function reset(Request $request)
    {
        $validated = $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'school_class_id' => 'required|exists:school_classes,id',
        ]);

        $session = AcademicSession::findOrFail($validated['academic_session_id']);
        
        // Find all students in this class level (across all arms)
        $classSectionIds = ClassSection::where('school_class_id', $validated['school_class_id'])->pluck('id');
        $studentIds = Student::whereIn('class_section_id', $classSectionIds)->pluck('id');

        DB::transaction(function() use ($studentIds, $session) {
            PromotionDecision::whereIn('student_id', $studentIds)
                ->where('academic_session_id', $session->id)
                ->update(['is_locked' => false]);
        });

        return redirect()->back()->with('success', 'Promotion decisions unlocked. Results can now be edited.');
    }

    /**
     * Lock promotion decisions for a class level.
     */
    public function lock(Request $request)
    {
        $validated = $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'school_class_id' => 'required|exists:school_classes,id',
        ]);

        $session = AcademicSession::findOrFail($validated['academic_session_id']);
        
        // Find all students in this class level (across all arms)
        $classSectionIds = ClassSection::where('school_class_id', $validated['school_class_id'])->pluck('id');
        $studentIds = Student::whereIn('class_section_id', $classSectionIds)->pluck('id');

        DB::transaction(function() use ($studentIds, $session) {
            PromotionDecision::whereIn('student_id', $studentIds)
                ->where('academic_session_id', $session->id)
                ->update(['is_locked' => true]);
        });

        return redirect()->back()->with('success', 'Promotion decisions locked. Results are finalized.');
    }
}
