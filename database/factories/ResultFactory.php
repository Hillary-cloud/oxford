<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ResultFactory extends Factory
{
    public function definition(): array
    {
        return [
            'student_id' => \App\Models\Student::factory(),
            'academic_session_id' => \App\Models\AcademicSession::factory(),
            'term_id' => \App\Models\Term::factory(),
            'class_section_id' => \App\Models\ClassSection::factory(),
            'subject_id' => \App\Models\Subject::factory(),
            'ca1_score' => $this->faker->numberBetween(0, 20),
            'ca2_score' => $this->faker->numberBetween(0, 20),
            'exam_score' => $this->faker->numberBetween(0, 60),
            'total_score' => $this->faker->numberBetween(0, 100),
            'grade' => $this->faker->randomElement(['A', 'B', 'C', 'D', 'E', 'F']),
            'remarks' => $this->faker->sentence(),
        ];
    }
}
