<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SubjectFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->word(),
            'code' => $this->faker->unique()->lexify('SUB###'),
            'type' => $this->faker->randomElement(['core', 'elective']),
        ];
    }
}
