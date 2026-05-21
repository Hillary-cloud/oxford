<?php

use App\Models\AcademicSession;
use App\Models\ClassArm;
use App\Models\ClassSection;
use App\Models\Grade;
use App\Models\Result;
use App\Models\ResultPin;
use App\Models\ResultSetting;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Term;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('a student can check their report card with a valid pin', function () {
    // 1. Arrange: Setup Data
    $session = AcademicSession::factory()->create();
    $term = Term::factory()->create([
        'academic_session_id' => $session->id,
        'result_published_at' => now(), // Important: Results must be published
        'name' => 'First Term'
    ]);
    
    $student = Student::factory()->create([
        'registration_number' => 'HUSS-2026-001',
    ]);
    
    // Create Class Structure (JSS1 A)
    $schoolClass = SchoolClass::factory()->create(['name' => 'JSS 1']);
    $classArm = ClassArm::factory()->create(['name' => 'A']);
    $section = ClassSection::factory()->create([
        'school_class_id' => $schoolClass->id,
        'class_arm_id' => $classArm->id,
        'academic_session_id' => $session->id,
    ]);
    
    // Enroll student in class
    $student->class_section_id = $section->id;
    $student->save();
    
    // Create Valid PIN
    $pin = ResultPin::create([
        'student_id' => $student->id,
        'academic_session_id' => $session->id,
        'term_id' => $term->id,
        'pin_code' => Hash::make('123456789012'), // Hashed
        'serial_number' => 'HUSS-ABC-001',
        'usage_count' => 0,
        'max_usage' => 5,
        'generated_by' => 1,
    ]);
    
    // Create a Result
    $subject = Subject::factory()->create();
    Result::create([
        'student_id' => $student->id,
        'academic_session_id' => $session->id,
        'term_id' => $term->id,
        'class_section_id' => $section->id,
        'subject_id' => $subject->id,
        'ca1_score' => 10,
        'exam_score' => 60,
        'total_score' => 70,
        'grade' => 'A',
        'remarks' => 'Good',
    ]);
    
    // Create Grades (needed for rendering)
    Grade::factory()->create(['name' => 'A', 'min_score' => 70, 'max_score' => 100]);
    
    // 2. Act: Submit Check Request
    $response = $this->post(route('result-checker.check'), [
        'registration_number' => 'HUSS-2026-001',
        'academic_session_id' => $session->id,
        'term_id' => $term->id,
        'pin_code' => '123456789012',
    ]);
    
    // 3. Assert: Verify Success
    // Should render the Inertia page 'ResultChecker/PublicReportCard'
    $response->assertStatus(200); 
    
    // Optional: Assert usage count increased
    $pin->refresh();
    expect($pin->usage_count)->toBe(1);
    
});

test('pin check fails if result not published', function () {
    $session = AcademicSession::factory()->create();
    $term = Term::factory()->create([
        'academic_session_id' => $session->id,
        'result_published_at' => null, // Not Published
    ]);
    
    $student = Student::factory()->create(['registration_number' => 'HUSS-TEST']);
    
    // Valid PIN
    ResultPin::create([
        'student_id' => $student->id,
        'academic_session_id' => $session->id,
        'term_id' => $term->id,
        'pin_code' => Hash::make('123456789012'),
        'serial_number' => 'HUSS-ABC-001',
        'max_usage' => 5,
        'generated_by' => 1,
    ]);
    
    $response = $this->post(route('result-checker.check'), [
        'registration_number' => 'HUSS-TEST',
        'academic_session_id' => $session->id,
        'term_id' => $term->id,
        'pin_code' => '123456789012',
    ]);
    
    // Should return with error
    $response->assertSessionHasErrors('pin_code');
});
