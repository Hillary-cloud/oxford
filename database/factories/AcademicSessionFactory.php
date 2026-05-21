<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class AcademicSessionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->year . '/' . ($this->faker->year + 1),
            'start_date' => $this->faker->date(),
            'end_date' => $this->faker->date(),
            'status' => 'active',
        ];
    }
}
