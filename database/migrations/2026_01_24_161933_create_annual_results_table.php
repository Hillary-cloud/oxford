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
        Schema::create('annual_results', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('student_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('academic_session_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('subject_id')->constrained()->cascadeOnDelete();
            
            $table->decimal('term1_score', 5, 2)->nullable();
            $table->decimal('term2_score', 5, 2)->nullable();
            $table->decimal('term3_score', 5, 2)->nullable();
            $table->decimal('annual_score', 5, 2);
            $table->string('grade')->nullable();
            
            $table->timestamps();
            
            $table->unique(['student_id', 'academic_session_id', 'subject_id'], 'stu_sess_sub_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('annual_results');
    }
};
