<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class StudentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'registration_number' => $this->faker->unique()->numerify('HUSS-####-###'),
            'surname' => $this->faker->lastName(),
            'othername' => $this->faker->firstName(),
            'gender' => $this->faker->randomElement(['male', 'female']),
            'date_of_birth' => $this->faker->date(),
            'address' => $this->faker->address(),
            'guardian_name' => $this->faker->name(),
            'guardian_number' => $this->faker->phoneNumber(),
            'class_section_id' => \App\Models\ClassSection::factory(),
            'academic_session_id' => \App\Models\AcademicSession::factory(),
            'status' => 'active',
        ];
    }
}
