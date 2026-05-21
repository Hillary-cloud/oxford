<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class TermFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->randomElement(['First Term', 'Second Term', 'Third Term']),
            'academic_session_id' => \App\Models\AcademicSession::factory(),
            'start_date' => $this->faker->date(),
            'end_date' => $this->faker->date(),
            'result_published_at' => $this->faker->optional(0.5)->dateTime(),
        ];
    }
}
