<?php

namespace App\Http\Controllers;

use App\Models\CbtExam;
use App\Models\CbtQuestion;
use App\Models\AcademicSession;
use App\Models\Term;
use App\Models\Subject;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CbtController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();
        
        $examsQuery = CbtExam::with(['academicSession', 'term', 'subject', 'schoolClass', 'sections.classArm'])
            ->withCount(['attempts as submitted_attempts_count' => function ($query) {
                $query->where('status', 'submitted');
            }])
            ->latest();

        if ($user->hasRole('Teacher') && !$user->hasRole('Super Admin') && !$user->hasRole('Admin')) {
            $examsQuery->where(function($q) use ($user) {
                // Must be associated via at least one Section
                $q->whereHas('sections', function($sectionQ) use ($user) {
                    $sectionQ->where('form_teacher_id', $user->id) // Is Form Teacher
                             ->orWhereExists(function ($subQ) use ($user) {
                                 // Or Is Subject Teacher for the Exam's Subject
                                 $subQ->select(DB::raw(1))
                                      ->from('class_section_subjects')
                                      ->whereColumn('class_section_subjects.class_section_id', 'class_sections.id')
                                      ->where('class_section_subjects.teacher_id', $user->id)
                                      // Correlated to the main CbtExam table
                                      ->whereColumn('class_section_subjects.subject_id', 'cbt_exams.subject_id'); 
                             });
                });
            });
        }

        $exams = $examsQuery->paginate(15);
            

        
        $subjectsQuery = Subject::orderBy('name');
        $classesQuery = SchoolClass::orderBy('name'); // We need to eager load sections later based on user role

        if ($user->hasRole('Teacher') && !$user->hasRole('Super Admin') && !$user->hasRole('Admin')) {
            // Filter Subjects: Only those assigned to this teacher
            $subjectsQuery->whereExists(function ($q) use ($user) {
                $q->select(DB::raw(1))
                  ->from('class_section_subjects')
                  ->whereColumn('class_section_subjects.subject_id', 'subjects.id')
                  ->where('class_section_subjects.teacher_id', $user->id);
            });

            // Filter Classes: Only those where teacher is Form Teacher OR Subject Teacher
            // And eager load only RELEVANT sections
            $sectionsFilter = function ($q) use ($user) {
                $q->where('form_teacher_id', $user->id)
                  ->orWhereHas('subjects', function($subQ) use ($user) {
                       $subQ->where('class_section_subjects.teacher_id', $user->id);
                  });
            };

            $classesQuery->whereHas('sections', $sectionsFilter)
                         ->with(['sections' => function($q) use ($sectionsFilter, $user) {
                             $sectionsFilter($q);
                             $q->with(['classArm', 'subjects' => function($subQ) use ($user) {
                                  $subQ->where('class_section_subjects.teacher_id', $user->id);
                             }]); 
                         }]);
        } else {
             // Admin sees all
             $classesQuery->with(['sections' => function($q) {
                 $q->with(['classArm', 'subjects']);
             }]);
        }

        return Inertia::render('Cbt/Index', [
            'exams' => $exams,
            'sessions' => AcademicSession::latest()->get(),
            'terms' => Term::all(),
            'subjects' => $subjectsQuery->get(),
            'classes' => $classesQuery->get(),
            'school_identity' => \App\Models\GeneralSetting::get('school_identity'),
            // Fetch CA Config for Result Assessment Name dropdown
            'assessment_config' => \App\Models\ResultSetting::getByKey('ca_config', []),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'term_id' => 'required|exists:terms,id',
            'subject_id' => 'required|exists:subjects,id',
            'school_class_id' => 'required|exists:school_classes,id',
            'section_ids' => 'required|array|min:1',
            'section_ids.*' => [
                'exists:class_sections,id',
                function ($attribute, $value, $fail) use ($request) {
                    $section = \App\Models\ClassSection::find($value);
                    if ($section && $section->school_class_id != $request->school_class_id) {
                        $fail("The selected class arm does not belong to the chosen class.");
                    }
                }
            ],
            'duration_minutes' => 'required|integer|min:1',
            'start_date' => 'required|date',
            'result_assessment_name' => 'required|string',
            'shuffle_questions' => 'boolean',
            'show_result_immediately' => 'boolean',
            'is_published' => 'boolean'
        ]);
        
        // Auto-calculate total marks based on Assessment Config
        $totalMarks = 0;
        $passMark = 0; // Or removed entirely, but DB expects column.
        
        if (!empty($validated['result_assessment_name'])) {
            $name = $validated['result_assessment_name'];
            
            if ($name === 'Exam') {
                // Heuristic: 100 - sum(CA)
                $caConfig = \App\Models\ResultSetting::getByKey('ca_config', []);
                $caTotal = collect($caConfig)->sum('max_score');
                $totalMarks = 100 - $caTotal; // Remaining
                if ($totalMarks < 0) $totalMarks = 0; // Safety
            } else {
                $caConfig = \App\Models\ResultSetting::getByKey('ca_config', []);
                $found = collect($caConfig)->firstWhere('name', $name);
                if ($found) {
                    $totalMarks = $found['max_score'];
                }
            }
        }
        
        // Default pass mark if not set? E.g. 50% of total
        $passMark = $totalMarks * 0.5;

        // Remove section_ids from raw model create
        $sectionIds = $validated['section_ids'] ?? [];
        unset($validated['section_ids']);

        // Create exam
        $exam = CbtExam::create(array_merge($validated, [
            'total_marks' => $totalMarks > 0 ? $totalMarks : 100,
            'pass_mark' => $passMark
        ]));
        
        // Update Sections
        foreach ($sectionIds as $sectId) {
            $exam->sections()->attach($sectId, ['id' => (string) \Illuminate\Support\Str::orderedUuid()]);
        }
        
        return redirect()->back()->with('success', 'Exam created successfully.');
    }
    
    // ... Other methods placeholders
    public function update(Request $request, CbtExam $exam)
    {
        \Log::info("CBT Update Attempt for Exam: {$exam->id}", $request->all());
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'academic_session_id' => 'required|exists:academic_sessions,id',
                'term_id' => 'required|exists:terms,id',
                'subject_id' => 'required|exists:subjects,id',
                'school_class_id' => 'required|exists:school_classes,id',
                'section_ids' => 'required|array|min:1',
                'section_ids.*' => [
                    'exists:class_sections,id',
                    function ($attribute, $value, $fail) use ($request) {
                        $section = \App\Models\ClassSection::find($value);
                        if ($section && $section->school_class_id != $request->school_class_id) {
                            $fail("The selected class arm does not belong to the chosen class.");
                        }
                    }
                ],
                'duration_minutes' => 'required|integer|min:1',
                'start_date' => 'required|date',
                'result_assessment_name' => 'required|string',
                'shuffle_questions' => 'boolean',
                'show_result_immediately' => 'boolean',
                'is_published' => 'boolean'
            ]);

            \Log::info("CBT Update Validation Passed for Exam: {$exam->id}");

            // Calculate marks
            $totalMarks = $exam->total_marks;
            $passMark = $exam->pass_mark;

            if (!empty($validated['result_assessment_name'])) {
                $name = $validated['result_assessment_name'];
                if ($name === 'Exam') {
                    $caConfig = \App\Models\ResultSetting::getByKey('ca_config', []);
                    $caTotal = collect($caConfig)->sum('max_score');
                    $totalMarks = 100 - $caTotal;
                    if ($totalMarks < 0) $totalMarks = 0;
                } else {
                    $caConfig = \App\Models\ResultSetting::getByKey('ca_config', []);
                    $found = collect($caConfig)->firstWhere('name', $name);
                    if ($found) {
                        $totalMarks = $found['max_score'];
                    }
                }
                $passMark = $totalMarks * 0.5;
            }

            // Remove section_ids from raw model update
            $sectionIds = $validated['section_ids'] ?? [];
            unset($validated['section_ids']);

            $exam->update(array_merge($validated, [
                'total_marks' => $totalMarks,
                'pass_mark' => $passMark
            ]));
            
            // Update Sections
            $exam->sections()->detach();
            foreach ($sectionIds as $sectId) {
                $exam->sections()->attach($sectId, ['id' => (string) \Illuminate\Support\Str::orderedUuid()]);
            }

            \Log::info("CBT Update Successful for Exam: {$exam->id}");
            return redirect()->back()->with('success', 'Exam updated successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::warning("CBT Update Validation Failed for Exam: {$exam->id}", $e->errors());
            throw $e;
        } catch (\Exception $e) {
            \Log::error("CBT Update Critical Error for Exam: {$exam->id}: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()->with('error', 'Update failed: ' . $e->getMessage());
        }
    }

    public function destroy(CbtExam $exam)
    {
        $exam->delete();
        return redirect()->back()->with('success', 'Exam deleted.');
    }

    public function togglePublish(CbtExam $exam)
    {
        $exam->is_published = !$exam->is_published;
        $exam->save();
        return redirect()->back()->with('success', $exam->is_published ? 'Exam published.' : 'Exam unpublished.');
    }

    public function syncToResults(CbtExam $exam)
    {
        if (empty($exam->result_assessment_name)) {
            return redirect()->back()->with('error', 'No result category set for this exam.');
        }

        $attempts = $exam->attempts()->where('status', 'submitted')->get();
        $count = 0;

        foreach ($attempts as $attempt) {
            $student = $attempt->student;
            if (!$student) continue;

            $result = \App\Models\Result::firstOrNew([
                'student_id' => $attempt->student_id,
                'subject_id' => $exam->subject_id,
                'academic_session_id' => $exam->academic_session_id,
                'term_id' => $exam->term_id,
            ]);

            // If it's a new record, we need to set the class_section_id
            if (!$result->exists) {
                $result->class_section_id = $student->class_section_id;
            }

            $score = (float) $attempt->score_obtained;
            $isExam = strtolower($exam->result_assessment_name) === 'exam';

            if ($isExam) {
                $result->exam_score = $score;
            } else {
                $assessments = $result->assessments ?? [];
                $found = false;
                foreach ($assessments as &$ass) {
                    if ($ass['name'] === $exam->result_assessment_name) {
                        $ass['score'] = $score;
                        $found = true;
                        break;
                    }
                }
                if (!$found) {
                    $assessments[] = [
                        'name' => $exam->result_assessment_name,
                        'score' => $score
                    ];
                }
                $result->assessments = $assessments;
            }

            // Recalculate Total Score
            $caTotal = collect($result->assessments ?? [])->sum('score');
            $result->total_score = $caTotal + ($result->exam_score ?? 0);

            // Recalculate Grade
            $gradeData = \App\Models\Result::computeDynamicGrade($result->total_score);
            $result->grade = $gradeData['name'];
            $result->remarks = $gradeData['remarks'];

            $result->save();
            $count++;
        }

        return redirect()->back()->with('success', "Successfully synced {$count} records to result management.");
    }


    public function questions(CbtExam $exam)
    {
        $exam->load(['questions', 'subject', 'schoolClass']);
        $exam->questions->makeVisible('correct_answer');
        
        return Inertia::render('Cbt/QuestionManager', [
            'exam' => $exam
        ]);
    }
    
    public function storeQuestion(Request $request, CbtExam $exam)
    {
        $validated = $request->validate([
            'question_text' => 'required|string',
            'question_type' => 'required|in:single_choice', // Enforce single choice
            'points' => 'required|integer|min:1',
            'options' => 'present|array',
            'correct_answer' => 'required|array|min:1|max:1', // Enforce exactly one correct answer
        ]);

        $exam->questions()->create($validated);

        return redirect()->back()->with('success', 'Question added.');
    }

    public function updateQuestion(Request $request, $id)
    {
        $question = CbtQuestion::findOrFail($id);

        $validated = $request->validate([
            'question_text' => 'required|string',
            'question_type' => 'required|in:single_choice', 
            'points' => 'required|integer|min:1',
            'options' => 'present|array',
            'correct_answer' => 'required|array|min:1|max:1',
        ]);

        $question->update($validated);

        return redirect()->back()->with('success', 'Question updated.');
    }

    public function destroyQuestion($id)
    {
        $question = CbtQuestion::findOrFail($id);
        $question->delete();
        return redirect()->back()->with('success', 'Question deleted.');
    }
    
    public function bulkUploadQuestions(Request $request, CbtExam $exam)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt'
        ]);

        $file = $request->file('file');
        $path = $file->getRealPath();

        // Simple CSV Parser
        if (($handle = fopen($path, "r")) !== FALSE) {
            $header = fgetcsv($handle, 1000, ",");
            // Basic mapping check - assume standard columns if header matches or just mapped by index
            // Needed columns: question, a, b, c, d, correct, points
            
            while (($row = fgetcsv($handle, 1000, ",")) !== FALSE) {
                // Skip empty rows
                if (count($row) < 2) continue;

                // Index assumptions: 
                // 0: Question, 1: A, 2: B, 3: C, 4: D, 5: Correct, 6: Points
                // Note: Simplified columns compared to before (Type removed or ignored)
                
                // If the CSV still has 8 columns (legacy logic), we might need adapting.
                // Let's assume user uses NEW sample which has 7 columns (Question, A, B, C, D, Correct, Points)
                // But we should also be robust if they use old format. 
                // Let's assume standard format from updated downloadSample.
                
                // CHECK if row seems to have Type column (if "single_choice" or similar text is in col 1)
                $hasTypeColumn = false;
                if (isset($row[1]) && in_array(strtolower($row[1]), ['single_choice', 'multi_choice', 'theory'])) {
                    $hasTypeColumn = true;
                }

                $questionText = $row[0] ?? '';
                if(empty($questionText)) continue;

                // Adjust indices based on detection
                $idxA = $hasTypeColumn ? 2 : 1;
                $idxCorrect = $hasTypeColumn ? 6 : 5;
                $idxPoints = $hasTypeColumn ? 7 : 6;

                $options = [];
                if (!empty($row[$idxA])) $options[] = ['id' => 'A', 'text' => $row[$idxA]];
                if (!empty($row[$idxA+1])) $options[] = ['id' => 'B', 'text' => $row[$idxA+1]];
                if (!empty($row[$idxA+2])) $options[] = ['id' => 'C', 'text' => $row[$idxA+2]];
                if (!empty($row[$idxA+3])) $options[] = ['id' => 'D', 'text' => $row[$idxA+3]];

                // Correct answer parsing
                $correctRaw = strtoupper(trim($row[$idxCorrect] ?? ''));
                $correct = [];
                // Only take first valid letter
                if (!empty($correctRaw)) {
                    $firstChar = substr($correctRaw, 0, 1);
                    if(in_array($firstChar, ['A','B','C','D'])) $correct[] = $firstChar;
                }
                
                // Skip if no correct answer? Or default?
                // if(empty($correct)) continue; 

                $points = intval($row[$idxPoints] ?? 1);

                $exam->questions()->create([
                    'question_text' => $questionText,
                    'question_type' => 'single_choice',
                    'options' => $options,
                    'correct_answer' => $correct,
                    'points' => $points,
                ]);
            }
            fclose($handle);
            return redirect()->back()->with('success', 'Questions imported successfully.');
        }
        
        return redirect()->back()->with('error', 'Failed to read file.');
    }
    
    public function results(CbtExam $exam)
    {
        return Inertia::render('Cbt/Results', [
            'exam' => $exam->load(['attempts.student', 'subject', 'schoolClass'])
        ]);
    }

    public function downloadSample()
    {
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=cbt_questions_sample.csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        // Simplified Columns
        $columns = ['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer', 'Points'];

        $callback = function() use ($columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            $data = [
                ['What is the capital of Nigeria?', 'Lagos', 'Abuja', 'Kano', 'Enugu', 'B', '2'],
                ['What is 2 + 2?', '1', '2', '3', '4', 'D', '1'],
                ['Who is the current President?', 'Tinubu', 'Buhari', 'Jonathan', 'Obasanjo', 'A', '1']
            ];

            foreach ($data as $row) {
                fputcsv($file, $row);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
