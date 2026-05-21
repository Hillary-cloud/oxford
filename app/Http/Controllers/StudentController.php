<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\ClassSection;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

use App\Services\IdGeneratorService;

class StudentController extends Controller
{
    protected $idGenerator;

    public function __construct(IdGeneratorService $idGenerator)
    {
        $this->idGenerator = $idGenerator;
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Student::with(['classSection.schoolClass', 'classSection.classArm'])
            ->join('class_sections', 'students.class_section_id', '=', 'class_sections.id')
            ->join('school_classes', 'class_sections.school_class_id', '=', 'school_classes.id')
            ->select('students.*');

        // Apply Filters
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('students.status', $request->status);
        }

        if ($request->has('class_id') && $request->class_id !== 'all') {
            $query->where('class_sections.school_class_id', $request->class_id);
        }

        if ($request->has('class_arm_id') && $request->class_arm_id !== 'all') {
            $query->where('class_sections.class_arm_id', $request->class_arm_id);
        }

        if ($request->has('search') && $request->search) {
            $term = $request->search;
            $query->where(function($q) use ($term) {
                $q->where('students.surname', 'like', "%{$term}%")
                  ->orWhere('students.othername', 'like', "%{$term}%")
                  ->orWhere('students.registration_number', 'like', "%{$term}%");
            });
        }

        $students = $query->orderBy('school_classes.level')
            ->orderBy('school_classes.name')
            ->orderBy('students.surname')
            ->paginate(100)
            ->withQueryString();

        $classes = \App\Models\SchoolClass::orderBy('level')->get();
        $classArms = \App\Models\ClassArm::orderBy('name')->get();

        if ($request->wantsJson() || $request->query('format') === 'json') {
            return response()->json([
                'students' => $students->map(fn($s) => [
                    'id' => $s->id,
                    'surname' => $s->surname,
                    'othername' => $s->othername,
                    'registration_number' => $s->registration_number,
                    'class_name' => ($s->classSection?->schoolClass?->name ?? '') . ' ' . ($s->classSection?->name ?? ''),
                ]),
                'pagination' => [
                    'total' => $students->total(),
                    'current_page' => $students->currentPage(),
                ]
            ]);
        }

        return Inertia::render('Students/Index', [
            'students' => $students,
            'classes' => $classes,
            'classArms' => $classArms,
            'filters' => $request->only(['status', 'class_id', 'class_arm_id', 'search'])
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $student = Student::with(['classSection.schoolClass', 'classSection.classArm'])->findOrFail($id);
        return Inertia::render('Students/Show', [
            'student' => $student
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $classSections = ClassSection::with(['schoolClass', 'classArm'])
            ->join('school_classes', 'class_sections.school_class_id', '=', 'school_classes.id')
            ->orderBy('school_classes.level')
            ->orderBy('school_classes.name')
            ->select('class_sections.*')
            ->get()
            ->unique('id')
            ->values();
        $sessions = \App\Models\AcademicSession::orderBy('name', 'desc')->get();
        $currentSession = \App\Models\AcademicSession::where('is_current', true)->first() ?? $sessions->first();

        return Inertia::render('Students/Create', [
            'classSections' => $classSections,
            'sessions' => $sessions,
            'currentSession' => $currentSession
        ]);
    }

    /**
     * Show the import form.
     */
    public function import()
    {
        $classSections = ClassSection::with(['schoolClass', 'classArm'])
            ->join('school_classes', 'class_sections.school_class_id', '=', 'school_classes.id')
            ->orderBy('school_classes.level')
            ->orderBy('school_classes.name')
            ->select('class_sections.*')
            ->get()
            ->unique('id')
            ->values();
        // Assuming current academic session for import
        $sessions = \App\Models\AcademicSession::orderBy('name', 'desc')->get();
        
        return Inertia::render('Students/Import', [
            'classSections' => $classSections,
            'sessions' => $sessions
        ]);
    }

    /**
     * Store bulk students from import.
     */
    public function storeBulk(Request $request)
    {
        $request->validate([
            'students' => 'required|array|min:1',
            'students.*.surname' => 'required|string',
            'students.*.othername' => 'required|string',
            'students.*.gender' => 'required|in:male,female,other',
            'students.*.class_section_id' => 'required|exists:class_sections,id',
            'students.*.academic_session_id' => 'required|exists:academic_sessions,id',
        ]);

        $studentsData = $request->input('students');

        DB::transaction(function () use ($studentsData) {
            // Fetch initial ID to start sequence
            $baseId = $this->idGenerator->generateStudentId();
            
            // Extract prefix and starting sequence
            $parts = explode('/', $baseId);
            $sequence = intval(array_pop($parts));
            $prefix = implode('/', $parts) . '/';

            foreach ($studentsData as $studentData) {
                $regNum = $prefix . str_pad($sequence++, 3, '0', STR_PAD_LEFT);
                
                Student::create([
                    'registration_number' => $regNum,
                    'surname' => $studentData['surname'],
                    'othername' => $studentData['othername'],
                    'gender' => strtolower($studentData['gender']),
                    'date_of_birth' => $studentData['date_of_birth'] ?? null, 
                    'address' => $studentData['address'] ?? null,
                    'guardian_name' => $studentData['guardian_name'] ?? null,
                    'guardian_number' => $studentData['guardian_number'] ?? null,
                    'guardian_email' => $studentData['guardian_email'] ?? null,
                    'class_section_id' => $studentData['class_section_id'],
                    'academic_session_id' => $studentData['academic_session_id'],
                    'status' => 'active',
                ]);
            }
        });

        return redirect()->route('students.index')->with('success', count($studentsData) . ' students imported successfully.');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            // 'registration_number' => 'required|string|max:255|unique:students', // Auto-generated now
            'surname' => 'required|string|max:255',
            'othername' => 'required|string|max:255',
            'gender' => 'required|string|in:male,female,other',
            'date_of_birth' => 'required|date',
            'address' => 'nullable|string',
            'guardian_name' => 'nullable|string|max:255',
            'guardian_number' => 'nullable|string|max:255',
            'guardian_email' => 'nullable|email|max:255',
            'class_section_id' => 'required|exists:class_sections,id',
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'status' => 'nullable|string|in:active,inactive',
            'profile_picture' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('profile_picture')) {
            $validated['profile_picture'] = $request->file('profile_picture')->store('students/profiles', 'public');
        }

        $validated['status'] = $validated['status'] ?? 'active';
        $validated['registration_number'] = $this->idGenerator->generateStudentId();

        Student::create($validated);

        return redirect()->route('students.index')->with('success', 'Student added successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $student = Student::findOrFail($id);
        $classSections = ClassSection::with(['schoolClass', 'classArm'])
            ->join('school_classes', 'class_sections.school_class_id', '=', 'school_classes.id')
            ->orderBy('school_classes.level')
            ->orderBy('school_classes.name')
            ->select('class_sections.*')
            ->get()
            ->unique('id')
            ->values();
        return Inertia::render('Students/Edit', [
            'student' => $student,
            'classSections' => $classSections
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $student = Student::findOrFail($id);

        $validated = $request->validate([
            'registration_number' => 'required|string|max:255|unique:students,registration_number,' . $id,
            'surname' => 'required|string|max:255',
            'othername' => 'required|string|max:255',
            'gender' => 'required|string|in:male,female,other',
            'date_of_birth' => 'required|date',
            'address' => 'nullable|string',
            'guardian_name' => 'nullable|string|max:255',
            'guardian_number' => 'nullable|string|max:255',
            'guardian_email' => 'nullable|email|max:255',
            'class_section_id' => 'required|exists:class_sections,id',
            'status' => 'required|string|in:active,inactive,graduated',
            'profile_picture' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('profile_picture')) {
            if ($student->profile_picture) {
                Storage::disk('public')->delete($student->profile_picture);
            }
            $validated['profile_picture'] = $request->file('profile_picture')->store('students/profiles', 'public');
        } else {
            unset($validated['profile_picture']);
        }

        $student->update($validated);

        return redirect()->route('students.index')->with('success', 'Student information updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $student = Student::findOrFail($id);
        
        if ($student->profile_picture) {
            Storage::disk('public')->delete($student->profile_picture);
        }
        
        $student->delete();

        return redirect()->route('students.index')->with('success', 'Student record deleted successfully.');
    }
    /**
     * Bulk delete students.
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'student_ids' => ['required', 'array'],
            'student_ids.*' => ['exists:students,id'],
        ]);

        $students = Student::whereIn('id', $request->student_ids)->get();
        
        foreach ($students as $student) {
            if ($student->profile_picture) {
                Storage::disk('public')->delete($student->profile_picture);
            }
            $student->delete();
        }

        return redirect()->route('students.index')->with('success', count($request->student_ids) . ' student(s) deleted successfully.');
    }
}
