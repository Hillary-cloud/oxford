<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Exams Table
        Schema::create('cbt_exams', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('academic_session_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('term_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('subject_id')->constrained()->cascadeOnDelete();
            // If class_id is null, it might be a general exam, but usually exams are per class or class_arm. 
            // We'll make it nullable for flexibility (e.g. general entrance exam), but standard usage is per class.
            $table->foreignUuid('school_class_id')->nullable()->constrained()->nullOnDelete(); 
            
            $table->string('title');
            $table->text('description')->nullable();
            
            $table->integer('duration_minutes')->default(60);
            $table->integer('total_marks')->default(100);
            $table->integer('pass_mark')->nullable();
            
            $table->dateTime('start_date')->nullable(); // When the exam becomes available
            $table->dateTime('end_date')->nullable();   // When the exam closes
            
            $table->boolean('is_published')->default(false);
            $table->boolean('shuffle_questions')->default(true);
            $table->boolean('show_result_immediately')->default(true); // If false, student sees "Submitted" only
            
            // Link to Results (Continuous Assessment)
            // If set (e.g., 'CA1', 'CA2', 'Exam'), score will potentially update the Result table
            $table->string('result_assessment_name')->nullable(); 
            
            $table->timestamps();
        });

        // 2. Questions Table
        Schema::create('cbt_questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('cbt_exam_id')->constrained()->cascadeOnDelete();
            
            $table->longText('question_text'); // Rich text support
            $table->string('question_type')->default('single_choice'); // single_choice, multi_choice, boolean, theory
            
            $table->longText('options')->nullable(); // JSON: [{id: 1, text: "A"}, {id: 2, text: "B"}]
            $table->longText('correct_answer')->nullable(); // JSON or String. Obfuscated in specialized usage if needed.
            
            $table->integer('points')->default(1);
            $table->integer('display_order')->default(0);
            
            $table->timestamps();
        });

        // 3. Attempts Table (Student taking an exam)
        Schema::create('cbt_attempts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('cbt_exam_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('student_id')->constrained()->cascadeOnDelete();
            
            $table->timestamp('started_at');
            $table->timestamp('submitted_at')->nullable();
            
            $table->integer('score_obtained')->nullable();
            $table->integer('total_questions_answered')->default(0);
            
            // State persistence for Resume Capability
            $table->integer('remaining_seconds')->nullable(); // Time left when last synchronized
            $table->json('data_snapshot')->nullable(); // Backup of local state if needed
            
            $table->string('status')->default('in_progress'); // in_progress, submitted, graded
            
            $table->timestamps();
        });

        // 4. Answers Table (Individual question responses)
        Schema::create('cbt_answers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('cbt_attempt_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('cbt_question_id')->constrained()->cascadeOnDelete();
            
            $table->longText('answer'); // Student's selected option(s) or text
            $table->boolean('is_correct')->default(false);
            $table->integer('score_earned')->default(0);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cbt_answers');
        Schema::dropIfExists('cbt_attempts');
        Schema::dropIfExists('cbt_questions');
        Schema::dropIfExists('cbt_exams');
    }
};
