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
        // 1. Result Settings (CA configurations, global report card settings)
        Schema::create('result_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('key')->unique(); // e.g., 'ca_config', 'report_card_settings'
            $table->json('data');
            $table->timestamps();
        });

        // 2. Dynamic Grading Scales
        Schema::create('grades', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name'); // e.g., A, B, C
            $table->integer('min_score');
            $table->integer('max_score');
            $table->string('remarks')->nullable();
            $table->string('color')->nullable(); // For UI styling
            $table->timestamps();
        });

        // 3. Psychomotor Skill Categories
        Schema::create('psychomotor_skill_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name'); // e.g., Affective Domain, Psychomotor Domain
            $table->timestamps();
        });

        // 4. Psychomotor Skills
        Schema::create('psychomotor_skills', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('category_id')->constrained('psychomotor_skill_categories')->onDelete('cascade');
            $table->string('name'); // e.g., Punctuality, Honesty, Musical Skills
            $table->timestamps();
        });

        // 5. Student Psychomotor Ratings (for each student per term)
        Schema::create('student_psychomotor_ratings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignUuid('academic_session_id')->constrained('academic_sessions')->onDelete('cascade');
            $table->foreignUuid('term_id')->constrained('terms')->onDelete('cascade');
            $table->foreignUuid('skill_id')->constrained('psychomotor_skills')->onDelete('cascade');
            $table->integer('rating'); // e.g., 1-5
            $table->timestamps();
            $table->unique(['student_id', 'academic_session_id', 'term_id', 'skill_id'], 'student_term_skill_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_psychomotor_ratings');
        Schema::dropIfExists('psychomotor_skills');
        Schema::dropIfExists('psychomotor_skill_categories');
        Schema::dropIfExists('grades');
        Schema::dropIfExists('result_settings');
    }
};
