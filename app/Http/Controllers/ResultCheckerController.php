<?php

namespace App\Http\Controllers;

use App\Models\ResultPin;
use App\Models\Student;
use App\Models\Result;
use App\Models\ResultSetting;
use App\Models\TerminalRemark;
use App\Models\AcademicSession;
use App\Models\Term;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;

class ResultCheckerController extends Controller
{
    public function index()
    {
        return Inertia::render('ResultChecker/Index', [
            'sessions' => AcademicSession::withCount('terms')->latest()->get(),
            'terms' => Term::orderBy('created_at')->get(),
            'school_identity' => ResultSetting::getByKey('school_identity'),
        ]);
    }

    public function check(Request $request)
    {
        $request->validate([
            'registration_number' => 'required|string',
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'term_id' => 'required', // Can be 'annual' or integer ID
            'pin_code' => 'required|string',
        ]);

        $isAnnual = $request->term_id === 'annual';
        $sessionId = $request->academic_session_id;

        // 1. Find Student
        $regNo = trim($request->registration_number);
        $student = Student::where('registration_number', 'LIKE', $regNo)->first(); // Case-insensitive
        
        if (!$student) {
            throw ValidationException::withMessages([
                'registration_number' => 'Student not found with this registration number.',
            ]);
        }

        // 2. Validate PIN
        $pinCode = trim($request->pin_code);
        
        if ($isAnnual) {
            // Find the 3rd term for this session
            $term3 = Term::where('academic_session_id', $sessionId)
                ->where(function ($q) {
                    $q->where('name', 'LIKE', '%Third Term%')
                      ->orWhere('name', 'LIKE', '%3rd Term%')
                      ->orWhere('name', 'LIKE', 'Third')
                      ->orWhere('name', 'LIKE', '3rd');
                })
                ->first();

            if (!$term3) {
                 throw ValidationException::withMessages([
                    'term_id' => 'Annual results are not available yet (Third Term not found).',
                ]);
            }

            // Validate against 3rd Term PIN
            $pin = ResultPin::where('student_id', $student->id)
                ->where('academic_session_id', $sessionId)
                ->where('term_id', $term3->id)
                ->latest()
                ->first();
        } else {
             $pin = ResultPin::where('student_id', $student->id)
                ->where('academic_session_id', $request->academic_session_id)
                ->where('term_id', $request->term_id)
                ->latest() 
                ->first();
        }

        // If no specific PIN found, check if there's a "Wildcard" pin? No, stick to specific.
        if (!$pin) {
             throw ValidationException::withMessages([
                'pin_code' => 'No PIN record found for this student in the selected session/term. Please ensure you selected the correct Session and Term.',
            ]);
        }

        // Check if user entered the Serial Number instead of the PIN
        if (strtoupper($pinCode) === strtoupper($pin->serial_number)) {
            throw ValidationException::withMessages([
                'pin_code' => 'You entered the Serial Number (e.g. ABC-1234). Please enter the 12-digit PIN code.',
            ]);
        }

        try {
            $decryptedPin = \Illuminate\Support\Facades\Crypt::decryptString($pin->pin_code);
        } catch (\Illuminate\Contracts\Encryption\DecryptException $e) {
            // Fallback for old hashed pins if any exist (though we are replacing them)
            if (!Hash::check($pinCode, $pin->pin_code)) {
                 throw ValidationException::withMessages([
                    'pin_code' => 'Invalid PIN code.',
                ]);
            }
            $decryptedPin = $pinCode;
        }

        if ($decryptedPin !== $pinCode) {
             throw ValidationException::withMessages([
                'pin_code' => 'Invalid PIN code. Please ensure you entered the 12-digit numbers correctly.',
            ]);
        }
        
        // 3. Check Usage
        if ($pin->usage_count >= $pin->max_usage) {
             throw ValidationException::withMessages([
                'pin_code' => 'Maximum usage limit ('.$pin->max_usage.') reached for this PIN.',
            ]);
        }



        // 5. Fetch Result Data
        $sessionId = $request->academic_session_id;

        if ($isAnnual) {
             return $this->processAnnualResult($student, $sessionId, $pin);
        }

        $termId = $request->term_id;

        $session = AcademicSession::find($sessionId);
        $term = Term::find($termId);

        // Check if results are published for this term
        if (!$term->result_published_at) {
            return back()->withErrors(['pin_code' => 'Results for this session and term have not been published yet.']);
        }

        // Fetch Results
        $results = Result::where('student_id', $student->id)
            ->where('academic_session_id', $session->id)
            ->where('term_id', $term->id)
            ->with('subject')
            ->get();

        // Determine class section ID from the results (historic class)
        // Fallback to student's current class if no results found
        $sectionId = $results->first()?->class_section_id ?? $student->class_section_id;

        // Historic Class Handling
        $historicClass = null;
        if ($sectionId !== $student->class_section_id) {
             $historicClass = \App\Models\ClassSection::with(['schoolClass', 'classArm'])->find($sectionId);
             if ($historicClass) {
                 $student->setRelation('classSection', $historicClass);
                 $student->class_section_id = $sectionId;
             }
        } else {
             $student->load(['classSection.schoolClass', 'classSection.classArm']);
             $historicClass = $student->classSection;
        }

        // Get Class Statistics
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

        // Get Psychomotor Ratings (Flat Array)
        $psychomotor = \App\Models\StudentPsychomotorRating::where('student_id', $student->id)
            ->where('academic_session_id', $sessionId)
            ->where('term_id', $termId)
            ->with(['skill.category'])
            ->get();

        // Calculate Overall Average & Position
        $allClassAverages = Result::where('academic_session_id', $sessionId)
            ->where('term_id', $termId)
            ->where('class_section_id', $sectionId)
            ->select('student_id', DB::raw('AVG(total_score) as student_avg'))
            ->groupBy('student_id')
            ->orderBy('student_avg', 'desc')
            ->get();

        $studentAvgStats = $allClassAverages->firstWhere('student_id', $student->id);
        $studentAvg = $studentAvgStats ? $studentAvgStats->student_avg : 0;
        
        $overallPosition = $allClassAverages->filter(function($item) use ($studentAvg) {
            return round($item->student_avg, 2) > round($studentAvg, 2);
        })->count() + 1;

        // Get Settings & Info
        $caConfig = ResultSetting::getByKey('ca_config', []);
        $reportSettings = ResultSetting::getByKey('report_card_settings', []);
        $student->load(['classSection.schoolClass', 'classSection.classArm']);
        $settings = [
            'school_identity' => \App\Models\GeneralSetting::get('school_identity'),
            'theme_colors' => \App\Models\GeneralSetting::get('theme_colors'),
        ];


        // Get Terminal Remarks
        $terminalRemark = TerminalRemark::where('student_id', $student->id)
            ->where('academic_session_id', $sessionId)
            ->where('term_id', $termId)
            ->first();

        $grades = \App\Models\Grade::orderBy('min_score', 'desc')->get();

        // 4. Increment Usage (Only if successful)
        $pin->increment('usage_count');
        
        return Inertia::render('ResultChecker/PublicReportCard', [
            'student' => $student,
            'results' => $results,
            'subjectStats' => $subjectStats,
            'psychomotor' => $psychomotor,
            'overall' => [
                'average' => round($studentAvgStats?->student_avg ?? 0, 1),
                'position' => $overallPosition,
                'total_students' => $allClassAverages->count(),
                'status' => ($session && $historicClass && $term) 
                    ? (app(\App\Services\PromotionService::class)->evaluateTermlyPass($student, $session, $historicClass, $term)['status'] ?? 'Pending') 
                    : 'Passed'
            ],
            'caConfig' => $caConfig,
            'reportSettings' => $reportSettings,
            'session' => AcademicSession::find($sessionId),
            'term' => Term::find($termId),
            'terminalRemark' => $terminalRemark,
            'settings' => $settings,
            'grades' => $grades,
        ]);
    }

    private function processAnnualResult($student, $sessionId, $pin)
    {
        // Increment Usage
        $pin->increment('usage_count');

        $session = AcademicSession::find($sessionId);
        
        // Fetch Annual Results from AnnualResult model (same as Admin)
        $annualResults = \App\Models\AnnualResult::where('student_id', $student->id)
            ->where('academic_session_id', $sessionId)
            ->with('subject')
            ->get();

        if ($annualResults->isEmpty()) {
            return back()->withErrors(['pin_code' => 'No annual results found for this student in the selected session.']);
        }

        // Load student relationships
        $student->load(['classSection.schoolClass', 'classSection.classArm']);

        // Get Report Settings
        $reportSettings = ResultSetting::getByKey('report_card_settings', []);
        $rankingBasis = $reportSettings['annual_ranking_basis'] ?? 'class'; // 'class' or 'arm'

        // Get historic class section from the first annual result
        $sectionId = $student->class_section_id;
        $historicClass = null;
        
        // Try to get the class from the student's first result in this session
        $firstResult = \App\Models\Result::where('student_id', $student->id)
            ->where('academic_session_id', $sessionId)
            ->with(['classSection.schoolClass', 'classSection.classArm'])
            ->first();
        
        if ($firstResult && $firstResult->classSection) {
            $historicClass = $firstResult->classSection;
            $sectionId = $firstResult->class_section_id;
        }


        // Determine Peer Group based on ranking basis
        // For annual results, we need to find students who were in the same class DURING that session
        // We use the results table to find the historical class membership
        if ($rankingBasis === 'class') {
            // Get the school_class_id from the historical class
            $classId = $historicClass ? $historicClass->school_class_id : $student->classSection->school_class_id;

            // Find all students who had results in the same class during this session
            // Query the results table to get historical class membership
            $studentIds = DB::table('results')
                ->join('class_sections', 'results.class_section_id', '=', 'class_sections.id')
                ->where('results.academic_session_id', $sessionId)
                ->where('class_sections.school_class_id', $classId)
                ->distinct()
                ->pluck('results.student_id');

        } else {
            // Peers in specific section (class arm) - use the historical section
            $studentIds = DB::table('results')
                ->where('academic_session_id', $sessionId)
                ->where('class_section_id', $sectionId)
                ->distinct()
                ->pluck('student_id');
        }

        // Calculate overall position
        $allAverages = \App\Models\AnnualResult::whereIn('student_id', $studentIds)
            ->where('academic_session_id', $sessionId)
            ->select('student_id', DB::raw('AVG(annual_score) as avg_score'))
            ->groupBy('student_id')
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

        // Calculate subject-level positions and grade remarks
        foreach ($annualResults as $res) {
            $subjectStats = \App\Models\AnnualResult::whereIn('student_id', $studentIds)
                ->where('academic_session_id', $sessionId)
                ->where('subject_id', $res->subject_id);
            
            $res->subject_total_students = $subjectStats->count();

            $subjectRank = $subjectStats->clone() 
                ->where('annual_score', '>', $res->annual_score)
                ->count() + 1;
            
            $res->position = $subjectRank;
            
            // Get the correct grade based on annual_score
            $gradeObj = \App\Models\Grade::orderBy('min_score', 'desc')->get()
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

        // Calculate subject stats (class averages)
        $annualSubjectStats = [];
        if ($annualResults->isNotEmpty()) {
            $stats = \App\Models\AnnualResult::whereIn('student_id', $studentIds)
                ->where('academic_session_id', $sessionId)
                ->whereIn('subject_id', $annualResults->pluck('subject_id'))
                ->select('subject_id', DB::raw('AVG(annual_score) as average'))
                ->groupBy('subject_id')
                ->get();

            foreach ($stats as $stat) {
                $annualSubjectStats[$stat->subject_id] = round($stat->average, 1);
            }
        }

        // Get Promotion Decision
        $promotion = \App\Models\PromotionDecision::where('student_id', $student->id)
            ->where('academic_session_id', $sessionId)
            ->first();

        // Get Psychomotor Ratings (from 3rd term or all terms)
        $psychomotorRatings = \App\Models\StudentPsychomotorRating::where('student_id', $student->id)
            ->where('academic_session_id', $sessionId)
            ->with(['skill', 'skill.category'])
            ->get();

        // Get Psychomotor Settings
        $psychomotorSettings = ResultSetting::getByKey('psychomotor_scale', []);
        if (empty($psychomotorSettings)) {
            $psychomotorSettings = [
                ['scale' => '5', 'desc' => 'Excellent'],
                ['scale' => '4', 'desc' => 'Very Good'],
                ['scale' => '3', 'desc' => 'Good'],
                ['scale' => '2', 'desc' => 'Fair'],
                ['scale' => '1', 'desc' => 'Poor'],
            ]; 
        }

        // Get Remarks (Dynamic)
        $promotionService = new \App\Services\PromotionService();
        $teacherRemark = $promotionService->getRemark($studentAvg, 'teacher');
        $principalRemark = $promotionService->getRemark($studentAvg, 'principal');

        $grades = \App\Models\Grade::orderBy('min_score', 'desc')->get();

        return Inertia::render('ResultChecker/PublicAnnualReportCard', [
            'student' => $student,
            'historicClass' => $historicClass,
            'results' => $annualResults->values(),
            'annualResults' => $annualResults->values(),
            'annualSubjectStats' => $annualSubjectStats,
            'overall' => [
                'average' => round($studentAvg, 1),
                'position' => $position,
                'total_students' => $totalStudents,
                'rank_scope' => $rankingBasis === 'class' ? 'Class Level' : 'Class Arm',
            ],
            'promotion' => $promotion,
            'promotionDecision' => $promotion,
            'remarks' => [
                'teacher' => $teacherRemark,
                'principal' => $principalRemark
            ],
            'settings' => [
                'school_identity' => \App\Models\GeneralSetting::get('school_identity'),
                'theme_colors' => \App\Models\GeneralSetting::get('theme_colors'),
                'report' => $reportSettings,
                'grades' => $grades,
            ],
            'reportSettings' => $reportSettings,
            'session' => $session,
            'grades' => $grades,
            'psychomotor' => $psychomotorRatings,
            'psychomotorSettings' => $psychomotorSettings,
        ]);
    }

    private function calculateGrade($score) {
        // Simple fetch from cache or DB
        $grades = \App\Models\Grade::orderBy('min_score', 'desc')->get();
        foreach ($grades as $grade) {
            if ($score >= $grade->min_score) return $grade;
        }
        return null;
    }
}
