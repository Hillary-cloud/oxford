<?php

namespace App\Http\Controllers;

use App\Models\CbtExam;
use App\Models\CbtAttempt;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class CbtStudentController extends Controller
{
    public function index()
    {
        // Get student from session
        $studentId = session('student_id');
        if (!$studentId) {
             return redirect()->route('cbt.login');
        }
        
        $student = \App\Models\Student::with(['classSection.schoolClass', 'classSection.classArm'])->find($studentId);
        
        if (!$student) {
             return Inertia::render('Cbt/Student/Index', ['exams' => [], 'error' => 'Student record not found.', 'student' => null]);
        }

        $classSectionId = $student->class_section_id;
        $schoolClassId = $student->class_section?->school_class_id;

        // Query logic:
        // 1. Is Published AND
        // 2. (Matches school_class_id OR Matches class_section_id via pivot OR has NULL school_class_id)
        $exams = CbtExam::where('is_published', true)
            ->where(function ($query) use ($schoolClassId, $classSectionId) {
                $query->where('school_class_id', $schoolClassId)
                      ->orWhereHas('sections', function ($q) use ($classSectionId) {
                          $q->where('class_sections.id', $classSectionId);
                      })
                      ->orWhereNull('school_class_id');
            })
            ->where(function ($query) use ($student) {
                // Allow core subjects OR elective subjects the student is assigned to
                $query->whereHas('subject', function ($q) {
                    $q->where('type', 'core');
                })
                ->orWhere(function ($q) use ($student) {
                    $q->whereHas('subject', function ($subQ) {
                        $subQ->where('type', 'elective');
                    })
                    ->whereExists(function ($subQ) use ($student) {
                        $subQ->select(DB::raw(1))
                            ->from('student_subject_assignments')
                            ->whereColumn('student_subject_assignments.subject_id', 'cbt_exams.subject_id')
                            ->whereColumn('student_subject_assignments.academic_session_id', 'cbt_exams.academic_session_id')
                            ->where('student_subject_assignments.student_id', $student->id);
                    });
                });
            })
            ->with(['subject', 'academicSession', 'term'])
            ->latest()
            ->get()
            ->map(function ($exam) use ($student) {
                // Attach status if attempted
                $attempt = CbtAttempt::where('cbt_exam_id', $exam->id)
                    ->where('student_id', $student->id)
                    ->first();
                $exam->attempt_status = $attempt?->status; // in_progress, submitted
                return $exam;
            });
            
        return Inertia::render('Cbt/Student/Index', [
            'exams' => $exams,
            'student' => $student
        ]);
    }
    
    public function show(CbtExam $exam)
    {
        return Inertia::render('Cbt/Student/Instruction', [
            'exam' => $exam->load(['subject', 'schoolClass'])
        ]);
    }
    
    public function start(Request $request, CbtExam $exam)
    {
        $studentId = session('student_id');
        $student = \App\Models\Student::with(['classSection.schoolClass', 'classSection.classArm'])->findOrFail($studentId);
        
        // Strict Eligibility Check: If subject is elective, student must be assigned
        if ($exam->subject && $exam->subject->type === 'elective') {
            $isAssigned = \App\Models\StudentSubjectAssignment::where('student_id', $student->id)
                ->where('subject_id', $exam->subject_id)
                ->where('academic_session_id', $exam->academic_session_id)
                ->exists();
            
            if (!$isAssigned) {
                return redirect()->route('student.cbt.index')->with('error', 'You are not assigned to this elective subject.');
            }
        }

        // Find or Create Attempt
        $attempt = CbtAttempt::firstOrCreate(
            ['cbt_exam_id' => $exam->id, 'student_id' => $student->id],
            [
                'started_at' => now(),
                'status' => 'in_progress',
                'remaining_seconds' => $exam->duration_minutes * 60
            ]
        );
        
        // If submitted, deny access
        if ($attempt->status === 'submitted' || $attempt->status === 'graded') {
            return redirect()->route('student.cbt.index')->with('error', 'Exam already submitted.');
        }
        
        // Load questions (Hidden correct_answers automatically)
        $questions = $exam->questions()
            ->select(['id', 'cbt_exam_id', 'question_text', 'question_type', 'options', 'points']) // Explicit select to ensure correct_answer is excluded if not hidden
            ->get();
            
        if ($exam->shuffle_questions) {
            $questions = $questions->shuffle()->values();
        }

        return Inertia::render('Cbt/Student/ExamRoom', [
            'exam' => $exam->load(['subject', 'schoolClass']),
            'questions' => $questions,
            'attempt' => $attempt,
            'student' => $student
        ]);
    }
    
    public function sync(Request $request, CbtExam $exam)
    {
        $request->validate([
            'attempt_id' => 'required|exists:cbt_attempts,id',
            'remaining_seconds' => 'required|integer',
            'data_snapshot' => 'nullable|array'
        ]);
        
        $attempt = CbtAttempt::findOrFail($request->attempt_id);
        $attempt->update([
            'remaining_seconds' => $request->remaining_seconds,
            'data_snapshot' => $request->data_snapshot
        ]);
        
        return response()->json(['success' => true]);
    }
    
    public function submit(Request $request, CbtExam $exam)
    {
        try {
            $request->validate([
                'attempt_id' => 'required',
                'answers' => 'present|array' 
                // answers: [{ question_id: "uuid", answer: "A" or ["A","B"] }, ...]
            ]);
            
            $attempt = CbtAttempt::findOrFail($request->attempt_id);
            
            if($attempt->status === 'submitted') {
                 return redirect()->route('student.cbt.index');
            }
            
            $questions = $exam->questions()->get()->keyBy('id');
            $totalScore = 0;
            $answeredCount = 0;
            
            foreach ($request->answers as $ans) {
                $qId = $ans['question_id'];
                $studentAns = $ans['answer'];
                
                if (!isset($questions[$qId])) continue;
                
                $question = $questions[$qId];
                $isCorrect = false;
                $points = 0;
                
                // Grading Logic
                // Note: correct_answer is stored as array in DB (casted) or we decode if needed
                // The logic depends on question type.
                $correctDB = $question->correct_answer; // Array ['A'] or ['A', 'B']
                
                \Illuminate\Support\Facades\Log::info("Grading Q: {$qId}", [
                    'student_ans' => $studentAns,
                    'correct_db' => $correctDB,
                    'type' => $question->question_type
                ]);

                if ($question->question_type === 'single_choice') {
                    // If studentAns matches the FIRST (and only) element of correctDB
                    if (is_array($correctDB) && count($correctDB) > 0) {
                         // Loose comparison to handle string/int differences if any
                         $isCorrect = ($studentAns == $correctDB[0]);
                    }
                } elseif ($question->question_type === 'multi_choice') {
                    // Compare arrays (sort both)
                    if (is_array($studentAns) && is_array($correctDB)) {
                        sort($studentAns);
                        sort($correctDB);
                        $isCorrect = ($studentAns == $correctDB);
                    }
                }
                
                if ($isCorrect) {
                    $points = $question->points;
                    $totalScore += $points;
                }
                
                // Save individual answer
                \App\Models\CbtAnswer::create([
                    'cbt_attempt_id' => $attempt->id,
                    'cbt_question_id' => $qId,
                    'answer' => is_array($studentAns) ? json_encode($studentAns) : $studentAns,
                    'is_correct' => $isCorrect,
                    'score_earned' => $points
                ]);
                
                $answeredCount++;
            }
            

            
            $attempt->update([
                'status' => 'submitted',
                'submitted_at' => now(),
                'score_obtained' => $totalScore,
                'total_questions_answered' => $answeredCount,
                'remaining_seconds' => 0
            ]);
            
            // Update Result Table if result_assessment_name is set (CA1, CA2 etc)
            // Only if user is student enrolled in that subject
            if ($exam->result_assessment_name && $attempt->student) {
                // Find existing Result record or create? Usually created during term setup.
                // We search for Result
                $result = \App\Models\Result::where('student_id', $attempt->student_id)
                    ->where('subject_id', $exam->subject_id)
                    ->where('academic_session_id', $exam->academic_session_id)
                    ->where('term_id', $exam->term_id)
                    ->first();
                    
                if ($result) {
                    $assessments = $result->assessments ?? []; // Array of {name: "CA1", score: 10}
                    // Update or Add
                    $found = false;
                    foreach($assessments as &$ass) {
                        if (is_array($ass) && isset($ass['name']) && $ass['name'] === $exam->result_assessment_name) {
                            $ass['score'] = $totalScore; // Or scaled? User didn't specify scaling. Assume raw.
                            $found = true;
                            break;
                        }
                    }
                    unset($ass); // Break reference

                    if (!$found) {
                        $assessments[] = ['name' => $exam->result_assessment_name, 'score' => $totalScore];
                    }
                    
                    $result->assessments = $assessments;
                    // Recompute total if needed, but usually ResultController handles that. 
                    // We'll just save assessments for now.
                    $result->save();
                }
            }
            
            $flashData = ['success' => 'Exam submitted successfully.'];
            
            if ($exam->show_result_immediately) {
                $flashData['last_score'] = $totalScore;
                $flashData['last_total'] = $questions->sum('points');
            }

            return redirect()->route('student.cbt.index')->with($flashData);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('CBT Submission Error: ' . $e->getMessage() . ' Trace: ' . $e->getTraceAsString());
            return back()->withErrors(['submission_error' => 'An error occurred during submission: ' . $e->getMessage()]);
        }
    }
}
