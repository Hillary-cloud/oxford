<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ClassSectionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'school_class_id' => \App\Models\SchoolClass::factory(),
            'class_arm_id' => \App\Models\ClassArm::factory(),
            'academic_session_id' => \App\Models\AcademicSession::factory(),
            'status' => 'active',
        ];
    }
}
