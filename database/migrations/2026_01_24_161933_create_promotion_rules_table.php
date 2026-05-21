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
        Schema::create('promotion_rules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('academic_session_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('school_class_id')->constrained()->cascadeOnDelete();
            $table->string('method')->default('annual_average'); // annual_average, 3rd_term_only, weighted
            $table->json('weights')->nullable(); // e.g. {"1st_term": 30, "2nd_term": 30, "3rd_term": 40}
            $table->decimal('min_average', 5, 2)->default(50.00);
            $table->integer('max_failed_subjects')->default(2);
            $table->json('core_subject_ids')->nullable();
            $table->timestamps();
            
            $table->unique(['academic_session_id', 'school_class_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotion_rules');
    }
};
