<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class ResultPinFactory extends Factory
{
    public function definition(): array
    {
        return [
            'student_id' => \App\Models\Student::factory(),
            'academic_session_id' => \App\Models\AcademicSession::factory(),
            'term_id' => \App\Models\Term::factory(),
            'pin_code' => Hash::make('123456789012'),
            'serial_number' => 'HUSS-' . $this->faker->unique()->bothify('???-####'),
            'usage_count' => 0,
            'max_usage' => 5,
            'generated_by' => 1,
        ];
    }
}
