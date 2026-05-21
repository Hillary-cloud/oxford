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
        Schema::table('cbt_exams', function (Blueprint $table) {
            $table->uuid('school_class_id')->nullable()->change();
        });

        Schema::create('cbt_exam_sections', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('cbt_exam_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('class_section_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cbt_exam_sections');
        Schema::table('cbt_exams', function (Blueprint $table) {
            // Reverting nullable change can be tricky if data exists with nulls, 
            // but for down method we assume rollback to strict state.
            $table->uuid('school_class_id')->nullable(false)->change();
        });
    }
};
