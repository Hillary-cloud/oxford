<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class GradeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->randomElement(['A', 'B', 'C', 'D', 'E', 'F']),
            'min_score' => $this->faker->numberBetween(0, 90),
            'max_score' => $this->faker->numberBetween(91, 100),
            'remarks' => $this->faker->word(),
        ];
    }
}
