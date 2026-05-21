<?php

namespace App\Services;

use App\Models\AnnualResult;
use App\Models\PromotionDecision;
use App\Models\PromotionRule;
use App\Models\Result;
use App\Models\Student;
use App\Models\AcademicSession;
use App\Models\ClassSection;
use App\Models\Term;
use App\Models\Grade;
use Illuminate\Support\Facades\DB;

class PromotionService
{
    /**
     * Compute annual results for a student.
     */
    public function computeAnnualResults(Student $student, AcademicSession $session, ClassSection $section)
    {
        $terms = $session->terms()->orderBy('start_date')->get();
        if ($terms->count() === 0) return;

        $subjects = $section->subjects; // Assuming relationship exists or fetch from Results
        
        // Better yet, get all subjects the student has results for in this session
        $subjectIds = Result::where('student_id', $student->id)
            ->where('academic_session_id', $session->id)
            ->pluck('subject_id')
            ->unique();

        $rule = $this->getPromotionRule($session, $section->schoolClass);

        foreach ($subjectIds as $subjectId) {
            $termResults = Result::where('student_id', $student->id)
                ->where('academic_session_id', $session->id)
                ->where('subject_id', $subjectId)
                ->get();

            $scores = [
                'term1' => $termResults->firstWhere('term_id', $terms[0]->id ?? null)->total_score ?? 0,
                'term2' => $termResults->firstWhere('term_id', $terms[1]->id ?? null)->total_score ?? 0,
                'term3' => $termResults->firstWhere('term_id', $terms[2]->id ?? null)->total_score ?? 0,
            ];

            $annualScore = $this->calculateWeightedScore($scores, $rule);

            AnnualResult::updateOrCreate(
                [
                    'student_id' => $student->id,
                    'academic_session_id' => $session->id,
                    'subject_id' => $subjectId,
                ],
                [
                    'term1_score' => $scores['term1'],
                    'term2_score' => $scores['term2'],
                    'term3_score' => $scores['term3'],
                    'annual_score' => $annualScore,
                    'grade' => Result::computeDynamicGrade($annualScore)['name'],
                ]
            );
        }
    }

    /**
     * Evaluate promotion status based on rules.
     */
    public function evaluatePromotion(Student $student, AcademicSession $session, ClassSection $section)
    {
        $annualResults = AnnualResult::where('student_id', $student->id)
            ->where('academic_session_id', $session->id)
            ->get();

        if ($annualResults->isEmpty()) {
            return [
                'average' => 0,
                'failed_count' => 0,
                'status' => 'Pending',
                'reason' => 'No annual results found'
            ];
        }

        $rule = $this->getPromotionRule($session, $section->schoolClass);
        
        $average = $annualResults->avg('annual_score');
        
        // Use 40 as a more standard failing threshold for subject pass/fail count
        $passedResults = $annualResults->filter(fn($r) => $r->annual_score >= 40);
        $failedResults = $annualResults->filter(fn($r) => $r->annual_score < 40);
        
        $coreIds = $rule->core_subject_ids ?? [];
        $corePassed = $passedResults->whereIn('subject_id', $coreIds)->count() === count($coreIds);
        
        $otherPassedCount = $passedResults->whereNotIn('subject_id', $coreIds)->count();
        $otherFailedCount = $failedResults->whereNotIn('subject_id', $coreIds)->count();

        $isPassing = true;
        $reasons = [];

        // Rule 1: Min Average (Annual)
        if ($rule->is_rule1_annual) {
            if ($average < $rule->min_average) {
                // Check for Trial
                 if ($rule->trial_min_average && $average >= $rule->trial_min_average) {
                    $decision = 'Promoted on Trial';
                    $reasons[] = "Avg ($average%) below pass mark but meets trial threshold.";
                    // We don't set isPassing=false because they are "passing" on trial technically, 
                    // or we handle decision override.
                    // Let's refine:
                    $isPassing = true; // Technically they "pass" into next class but with condiiton
                 } else {
                    $isPassing = false;
                    $reasons[] = "Avg below " . number_format($rule->min_average, 1) . "%";
                 }
            }
        }

        // Rule 2: Pass Core + Pass X others (Annual)
        if ($rule->is_rule2_annual) {
            if (!$corePassed || $otherPassedCount < $rule->pass_other_subjects_count) {
                $isPassing = false;
                $reasons[] = "Core not passed or missing " . $rule->pass_other_subjects_count . " other passes";
            }
        }

        // Rule 3: Pass Core + Fail max Y others (Annual)
        if ($rule->is_rule3_annual) {
            if (!$corePassed || $otherFailedCount > $rule->max_failed_subjects) {
                $isPassing = false;
                $reasons[] = "Core not passed or more than " . $rule->max_failed_subjects . " other fails";
            }
        }

        // Rule 4: Min Average + Pass Core (Annual)
        if ($rule->is_rule4_annual) {
            if ($average < $rule->min_average || !$corePassed) {
                // Check for Trial
                if ($rule->trial_min_average && $average >= $rule->trial_min_average && $corePassed) {
                   $decision = 'Promoted on Trial';
                   $reasons[] = "Avg ($average%) below pass mark but meets trial threshold & core passed.";
                   $isPassing = true;
                } else {
                   $isPassing = false;
                   $reasons[] = "Avg below " . number_format($rule->min_average, 1) . "% or Core not passed";
                }
            }
        }

        $decision = $isPassing ? ($decision ?? 'Promoted') : 'Not Promoted';
        $summary = "Average: " . number_format($average, 1) . "%. " . implode(", ", $reasons);

        return [
            'average' => $average,
            'failed_count' => $failedResults->count(),
            'status' => $decision,
            'reason' => $isPassing ? "Met all requirements ($summary)" : $summary
        ];
    }

    protected function calculateWeightedScore($scores, $rule)
    {
        // Simply return average of all recorded terms
        $count = 0;
        $total = 0;
        if ($scores['term1'] > 0) { $total += $scores['term1']; $count++; }
        if ($scores['term2'] > 0) { $total += $scores['term2']; $count++; }
        if ($scores['term3'] > 0) { $total += $scores['term3']; $count++; }
        
        return $count > 0 ? ($total / $count) : 0;
    }

    /**
     * Evaluate pass status for a single term.
     */
    public function evaluateTermlyPass(Student $student, AcademicSession $session, ClassSection $section, Term $term)
    {
        $results = Result::where('student_id', $student->id)
            ->where('academic_session_id', $session->id)
            ->where('term_id', $term->id)
            ->get();

        if ($results->isEmpty()) {
            return [
                'average' => 0,
                'failed_count' => 0,
                'status' => 'Pending',
            ];
        }

        $rule = $this->getPromotionRule($session, $section->schoolClass);
        
        $average = $results->avg('total_score');
        $passedResults = $results->filter(fn($r) => $r->total_score >= 40);
        $failedResults = $results->filter(fn($r) => $r->total_score < 40);
        
        $coreIds = $rule->core_subject_ids ?? [];
        $corePassed = $passedResults->whereIn('subject_id', $coreIds)->count() === count($coreIds);
        
        $otherPassedCount = $passedResults->whereNotIn('subject_id', $coreIds)->count();
        $otherFailedCount = $failedResults->whereNotIn('subject_id', $coreIds)->count();

        $isPassing = true;
        if ($rule->is_rule1_termly && $average < $rule->min_average) $isPassing = false;
        if ($rule->is_rule2_termly && (!$corePassed || $otherPassedCount < $rule->pass_other_subjects_count)) $isPassing = false;
        if ($rule->is_rule3_termly && (!$corePassed || $otherFailedCount > $rule->max_failed_subjects)) $isPassing = false;
        if ($rule->is_rule4_termly && ($average < $rule->min_average || !$corePassed)) $isPassing = false;

        return [
            'average' => $average,
            'failed_count' => $failedResults->count(),
            'status' => $isPassing ? 'Passed' : 'Failed',
        ];
    }

    /**
     * Find or create default rule.
     */
    public function getPromotionRule(AcademicSession $session, $schoolClass = null)
    {
        $rule = null;
        // 1. Try specific class rule first
        if ($schoolClass) {
            $rule = PromotionRule::where('academic_session_id', $session->id)
                ->where('school_class_id', $schoolClass->id)
                ->first();
        }

        // 2. Fallback to global session rule
        if (!$rule) {
            $rule = PromotionRule::where('academic_session_id', $session->id)
                ->whereNull('school_class_id')
                ->first();
        }

        if (!$rule) {
            // Create global rule as default
            $rule = PromotionRule::firstOrCreate(
                ['academic_session_id' => $session->id, 'school_class_id' => null],
                [
                    'method' => 'annual_average',
                    'min_average' => 45.00,
                    'max_failed_subjects' => 3,
                    'pass_other_subjects_count' => 5,
                    'is_avg_enabled' => true,
                    'is_core_pass_enabled' => false,
                    'is_core_fail_limit_enabled' => false,
                    'is_rule1_termly' => true,
                    'is_rule1_annual' => true,
                    'is_rule2_termly' => false,
                    'is_rule2_annual' => false,
                    'is_rule3_termly' => false,
                    'is_rule3_annual' => false,
                    'is_rule4_termly' => false,
                    'is_rule4_annual' => false,
                    'weights' => ['1st_term' => 33.33, '2nd_term' => 33.33, '3rd_term' => 33.33],
                ]
            );
        }
        
        return $rule;
    }

    /**
     * Get a human-readable list of criteria for a promotion rule.
     */
    public function getCriteriaList(PromotionRule $rule, bool $isTermly = false): array
    {
        $criteria = [];
        $scope = $isTermly ? 'termly' : 'annual';

        if ($rule->{"is_rule1_{$scope}"}) {
            $criteria[] = "Maintain a minimum average score of " . number_format($rule->min_average, 1) . "%.";
        }

        if ($rule->{"is_rule2_{$scope}"}) {
            $criteria[] = "Pass all core subjects and at least " . $rule->pass_other_subjects_count . " other subject(s).";
        }

        if ($rule->{"is_rule3_{$scope}"}) {
            $criteria[] = "Pass all core subjects with no more than " . $rule->max_failed_subjects . " failed subject(s).";
        }

        if ($rule->{"is_rule4_{$scope}"}) {
            $criteria[] = "Maintain a minimum average of " . number_format($rule->min_average, 1) . "% and pass all core subjects.";
        }

        if (empty($criteria)) {
            $criteria[] = "Standard academic performance requirements apply.";
        }

        return $criteria;
    }

    /**
     * Get a dynamic remark based on the average score.
     */
    public function getRemark(float $average, string $type = 'teacher'): string
    {
        if ($average >= 75) {
            $remarks = $type === 'teacher' 
                ? ['An outstanding performance.', 'Excellent work ethic shown.', 'Keep up the brilliant work.', 'A truly exemplary result.']
                : ['An exceptional result.', 'Pride of the school.', 'Outstanding academic achievement.', 'Reference point for excellence.'];
        } elseif ($average >= 65) {
            $remarks = $type === 'teacher'
                ? ['Very good performance.', 'A consistent student.', 'Well done.', 'Great improvement shown.']
                : ['Detailed and impressive result.', 'Very good standard.', 'Commendable effort.', 'Highly satisfactory result.'];
        } elseif ($average >= 50) {
            $remarks = $type === 'teacher'
                ? ['Good performance.', 'Can do better with more focus.', 'Average performance.', 'Satisfactory work.']
                : ['Satisfactory result.', 'Needs more push next session.', 'Good attempt.', 'Average result.'];
        } elseif ($average >= 40) {
             $remarks = $type === 'teacher'
                ? ['Fair attempt.', 'Needs significantly more effort.', 'Barely average.', 'Sit up and focus more.']
                : ['Fair result.', 'Requires monitoring.', 'More effort required.', 'Weak pass.'];
        } else {
             $remarks = $type === 'teacher'
                ? ['Poor performance.', 'Please sit up.', 'Disappointing result.', 'Serious attention needed.']
                : ['Poor result.', 'Probation required.', 'Critical improvement needed.', 'Failed.'];
        }
        
        return $remarks[array_rand($remarks)];
    }
}
