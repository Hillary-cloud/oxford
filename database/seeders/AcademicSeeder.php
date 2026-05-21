<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AcademicSession;
use App\Models\Term;
use App\Models\SchoolClass;
use App\Models\ClassArm;
use App\Models\Subject;

class AcademicSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Academic Session
        $session = AcademicSession::firstOrCreate(
            ['name' => '2024/2025'],
            [
                'start_date' => '2024-09-01',
                'end_date' => '2025-07-31',
                'is_current' => true,
            ]
        );

        // 2. Term
        Term::firstOrCreate(
            ['name' => 'First Term', 'academic_session_id' => $session->id],
            [
                'start_date' => '2024-09-01',
                'end_date' => '2024-12-20',
                'is_current' => true,
            ]
        );

        // 3. Classes and Arms
        $classes = [
            ['name' => 'JSS 1', 'level' => '1'],
            ['name' => 'JSS 2', 'level' => '2'],
            ['name' => 'JSS 3', 'level' => '3'],
        ];

        // Seed available arms first
        $armNames = ['No arm', 'A', 'B', 'C'];
        $arms = [];
        foreach ($armNames as $name) {
            $arms[] = ClassArm::firstOrCreate(['name' => $name]);
        }

        foreach ($classes as $classData) {
            $class = SchoolClass::firstOrCreate(['name' => $classData['name']], $classData);
            
            // Create sections for "No arm" by default for each class
            \App\Models\ClassSection::firstOrCreate([
                'school_class_id' => $class->id,
                'class_arm_id' => $arms[0]->id, // "No arm"
            ]);
        }

        // 4. Subjects
        $subjects = [
            ['name' => 'Mathematics', 'code' => 'MATH101'],
            ['name' => 'English Language', 'code' => 'ENG101'],
            ['name' => 'Basic Science', 'code' => 'SCI101'],
        ];

        foreach ($subjects as $subject) {
            Subject::firstOrCreate(['code' => $subject['code']], $subject);
        }
    }
}
