<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('student_subject_assignments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('student_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('class_section_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('academic_session_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(
                ['student_id', 'subject_id', 'class_section_id', 'academic_session_id'],
                'student_subject_assignment_unique'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_subject_assignments');
    }
};
