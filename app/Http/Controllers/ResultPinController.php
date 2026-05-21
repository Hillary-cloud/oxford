<?php

namespace App\Http\Controllers;

use App\Models\ResultPin;
use App\Models\Student;
use App\Models\Result;
use App\Models\AcademicSession;
use App\Models\Term;
use App\Models\ClassSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ResultPinController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/ResultPins/Index', [
            'sessions' => AcademicSession::with('terms')->latest()->get(),
            'terms' => Term::all(),
            'classes' => ClassSection::with(['schoolClass', 'classArm'])->get()->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->schoolClass->name . ($c->classArm->name !== 'No arm' ? ' ' . $c->classArm->name : '')
            ]),
        ]);
    }

    public function getStudents(Request $request)
    {
        $request->validate([
            'class_section_ids' => 'required|array',
            'class_section_ids.*' => 'exists:class_sections,id',
            'academic_session_id' => 'nullable|exists:academic_sessions,id',
            'term_id' => 'nullable',
        ]);

        $sessionId = $request->academic_session_id;
        $session = $sessionId ? AcademicSession::find($sessionId) : null;
        $isCurrentInfo = !$session || $session->is_current;

        if ($isCurrentInfo) {
            // Fetch students currently in these classes
            $students = Student::whereIn('class_section_id', $request->class_section_ids)
                ->where('status', 'active')
                ->select('id', 'surname', 'othername', 'registration_number')
                ->orderBy('surname')
                ->get();
        } else {
            // Fetch students who have results in these classes for the specified session
            // We use the Result model to determine historical class membership
            $students = Student::whereHas('results', function ($query) use ($sessionId, $request) {
                    $query->where('academic_session_id', $sessionId)
                          ->whereIn('class_section_id', $request->class_section_ids);
                })
                ->select('id', 'surname', 'othername', 'registration_number')
                ->orderBy('surname')
                ->get();
        }

        return response()->json($students);
    }

    public function checkExistence(Request $request) {
        $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'term_id' => 'required|exists:terms,id',
            'generation_mode' => 'nullable|in:class,student',
            'class_section_ids' => 'required_if:generation_mode,class|array',
            'class_section_ids.*' => 'exists:class_sections,id',
            'student_ids' => 'required_if:generation_mode,student|array',
            'student_ids.*' => 'exists:students,id',
        ]);

        $query = ResultPin::where('academic_session_id', $request->academic_session_id)
            ->where('term_id', $request->term_id);

        if ($request->input('generation_mode') === 'student' && $request->has('student_ids')) {
            $query->whereIn('student_id', $request->student_ids);
        } else {
            $studentIds = Student::whereIn('class_section_id', $request->class_section_ids)->pluck('id');
            $query->whereIn('student_id', $studentIds);
        }

        return response()->json(['count' => $query->count()]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'term_id' => 'required|exists:terms,id',
            'generation_mode' => 'nullable|in:class,student',
            'class_section_ids' => 'required_if:generation_mode,class|array',
            'class_section_ids.*' => 'exists:class_sections,id',
            'student_ids' => 'required_if:generation_mode,student|array',
            'student_ids.*' => 'exists:students,id',
        ]);

        // Eager load relationships needed for CSV
        $sessionId = $request->academic_session_id;
        $session = AcademicSession::find($sessionId);
        $isCurrentInfo = !$session || $session->is_current;
        
        $withRelations = ['classSection.schoolClass', 'classSection.classArm'];
        if (!$isCurrentInfo) {
            $withRelations['results'] = function($q) use ($sessionId) {
                 $q->where('academic_session_id', $sessionId)
                   ->with(['classSection.schoolClass', 'classSection.classArm']);
            };
        }

        $query = Student::with($withRelations);

        if ($request->input('generation_mode') === 'student' && $request->has('student_ids')) {
            $query->whereIn('id', $request->student_ids);
        } else {
            // Class mode
            if ($isCurrentInfo) {
                $query->whereIn('class_section_id', $request->class_section_ids);
            } else {
                $query->whereHas('results', function ($q) use ($sessionId, $request) {
                    $q->where('academic_session_id', $sessionId)
                      ->whereIn('class_section_id', $request->class_section_ids);
                });
            }
        }
        
        $students = $query->get();
        $term = Term::find($request->term_id);
        $session = AcademicSession::find($request->academic_session_id);
        
        // Delete existing PINs for these students in this session/term
        ResultPin::where('academic_session_id', $request->academic_session_id)
            ->where('term_id', $request->term_id)
            ->whereIn('student_id', $students->pluck('id'))
            ->delete();

        $response = new StreamedResponse(function() use ($students, $request, $term, $session) {
            $handle = fopen('php://output', 'w');
            // Byte Order Mark (BOM) for Excel compatibility
            fputs($handle, chr(0xEF).chr(0xBB).chr(0xBF));
            
            fputcsv($handle, ['Student Name', 'Admission Number', 'Class', 'Session', 'Term', 'Serial Number', 'PIN Code']);

            foreach ($students as $student) {
                // Generate 12-digit PIN
                $rawPin = (string) random_int(100000000000, 999999999999); 
                
                // Generate Serial: ABC-1234-5678
                $serial = strtoupper(Str::random(3)) . '-' . rand(1000, 9999) . '-' . rand(1000, 9999);
                
                // Create Record
                ResultPin::create([
                    'student_id' => $student->id,
                    'academic_session_id' => $request->academic_session_id,
                    'term_id' => $request->term_id,
                    'pin_code' => \Illuminate\Support\Facades\Crypt::encryptString($rawPin),
                    'serial_number' => $serial,
                    'generated_by' => auth()->id(),
                    'usage_count' => 0,
                    'max_usage' => 5
                ]);

                $className = 'N/A';
                
                // Prioritize historical class if loaded and available
                $historicalResult = $student->relationLoaded('results') ? $student->results->first() : null;
                
                if ($historicalResult && $historicalResult->classSection) {
                    $className = ($historicalResult->classSection->schoolClass->name ?? '') . 
                                ($historicalResult->classSection->classArm && $historicalResult->classSection->classArm->name !== 'No arm' 
                                    ? ' ' . $historicalResult->classSection->classArm->name 
                                    : '');
                } elseif ($student->classSection) {
                    $className = ($student->classSection->schoolClass->name ?? '') . 
                                ($student->classSection->classArm && $student->classSection->classArm->name !== 'No arm' 
                                    ? ' ' . $student->classSection->classArm->name 
                                    : '');
                }

                fputcsv($handle, [
                    $student->surname . ' ' . $student->othername,
                    $student->registration_number,
                    $className,
                    $session->name ?? 'N/A',
                    $term->name ?? 'N/A',
                    $serial,
                    $rawPin 
                ]);
            }
            fclose($handle);
        });

        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', 'attachment; filename="result_pins_' . time() . '.csv"');

        return $response;
    }

    protected function prepareSmsData(Request $request)
    {
        $sessionId = $request->academic_session_id;
        $termId = $request->term_id;
        $session = AcademicSession::find($sessionId);
        $term = Term::find($termId);

        $query = Student::query();

        if ($request->input('generation_mode') === 'student' && $request->has('student_ids')) {
            $query->whereIn('id', $request->student_ids);
        } else {
            $query->whereIn('class_section_id', $request->class_section_ids);
        }

        $students = $query->with(['classSection.schoolClass', 'classSection.classArm'])->whereNotNull('guardian_number')->get();

        if ($students->isEmpty()) {
            return ['success' => false, 'message' => 'No students with guardian phone numbers found.'];
        }

        // Get all PINs for these students in this session/term
        $pins = ResultPin::where('academic_session_id', $sessionId)
            ->where('term_id', $termId)
            ->whereIn('student_id', $students->pluck('id'))
            ->get();

        if ($pins->isEmpty()) {
            return ['success' => false, 'message' => 'No PINs found for these students. Please generate PINs first.'];
        }

        // Group students by guardian number
        $guardianGroups = $students->groupBy('guardian_number');
        $messages = [];

        foreach ($guardianGroups as $phoneNumber => $group) {
            $guardianName = $group->first()->guardian_name ?: 'Parent/Guardian';
            $pinsText = [];

            foreach ($group as $student) {
                $studentPin = $pins->firstWhere('student_id', $student->id);
                if ($studentPin) {
                    try {
                        $rawPin = \Illuminate\Support\Facades\Crypt::decryptString($studentPin->pin_code);
                        $className = $student->classSection?->full_name ?: 'N/A';
                        $pinsText[] = "{$student->surname} {$student->othername} ({$className} - {$student->registration_number}): {$rawPin}";
                    } catch (\Exception $e) {
                        continue;
                    }
                }
            }

            if (empty($pinsText)) continue;

            $allPins = implode("\n", $pinsText);
            $baseUrl = rtrim(config('app.url'), '/');
            $message = "Hi {$guardianName}, {$session->name} {$term->name} Result PINs:\n{$allPins}\nMax:5 uses. Check:{$baseUrl}/result-checker";
            
            $messages[] = [
                'phone' => $phoneNumber,
                'guardian' => $guardianName,
                'students' => $group->pluck('othername')->toArray(),
                'message' => $message,
                'char_count' => strlen($message),
                'units' => ceil(strlen($message) / 160)
            ];
        }

        return [
            'success' => true,
            'messages' => $messages,
            'total_recipients' => count($messages),
            'total_units' => array_sum(array_column($messages, 'units'))
        ];
    }

    public function previewSms(Request $request)
    {
        $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'term_id' => 'required|exists:terms,id',
            'generation_mode' => 'nullable|in:class,student',
            'class_section_ids' => 'required_if:generation_mode,class|array',
            'class_section_ids.*' => 'exists:class_sections,id',
            'student_ids' => 'required_if:generation_mode,student|array',
            'student_ids.*' => 'exists:students,id',
        ]);

        $data = $this->prepareSmsData($request);
        return response()->json($data);
    }

    public function sendSms(Request $request, \App\Services\SmsService $smsService)
    {
        $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'term_id' => 'required|exists:terms,id',
            'generation_mode' => 'nullable|in:class,student',
            'class_section_ids' => 'required_if:generation_mode,class|array',
            'class_section_ids.*' => 'exists:class_sections,id',
            'student_ids' => 'required_if:generation_mode,student|array',
            'student_ids.*' => 'exists:students,id',
        ]);

        $data = $this->prepareSmsData($request);

        if (!$data['success']) {
            return response()->json($data);
        }

        $sentCount = 0;
        $failedCount = 0;

        foreach ($data['messages'] as $sms) {
            $result = $smsService->send($sms['phone'], $sms['message']);
            
            if ($result['success']) {
                $sentCount++;
            } else {
                $failedCount++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => "SMS processing complete. Sent: {$sentCount}, Failed: {$failedCount}."
        ]);
    }
}
