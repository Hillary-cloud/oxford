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
        Schema::create('promotion_decisions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('student_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('academic_session_id')->constrained()->cascadeOnDelete();
            
            $table->decimal('annual_average', 5, 2);
            $table->integer('total_failed_subjects')->default(0);
            $table->string('status'); // Promoted, Not Promoted, Promoted on Trial
            $table->string('decision_method')->default('auto'); // auto, manual_override
            
            $table->text('reason')->nullable();
            $table->foreignUuid('processed_by')->constrained('users')->cascadeOnDelete();
            $table->boolean('is_locked')->default(false);
            
            $table->timestamps();
            
            $table->unique(['student_id', 'academic_session_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotion_decisions');
    }
};
