<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SchoolClassFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->regexify('JSS[1-3]|SSS[1-3]'),
            'type' => $this->faker->randomElement(['primary', 'secondary']),
        ];
    }
}
