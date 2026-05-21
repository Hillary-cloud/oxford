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
        Schema::create('results', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('student_id');
            $table->uuid('term_id');
            $table->uuid('academic_session_id');
            $table->uuid('subject_id');
            $table->uuid('class_arm_id');

            $table->foreign('student_id')->references('id')->on('students')->cascadeOnDelete();
            $table->foreign('term_id')->references('id')->on('terms')->cascadeOnDelete();
            $table->foreign('academic_session_id')->references('id')->on('academic_sessions')->cascadeOnDelete();
            $table->foreign('subject_id')->references('id')->on('subjects')->cascadeOnDelete();
            $table->foreign('class_arm_id')->references('id')->on('class_arms')->cascadeOnDelete();
            $table->float('ca_score')->default(0);
            $table->float('exam_score')->default(0);
            $table->float('total_score')->default(0);
            $table->string('grade')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('results');
    }
};
