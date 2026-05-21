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
        Schema::table('class_sections', function (Blueprint $table) {
            $table->foreignUuid('form_teacher_id')->nullable()->constrained('users')->onDelete('set null');
        });

        Schema::table('class_section_subjects', function (Blueprint $table) {
            $table->foreignUuid('teacher_id')->nullable()->constrained('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('class_section_subjects', function (Blueprint $table) {
            $table->dropForeign(['teacher_id']);
            $table->dropColumn('teacher_id');
        });

        Schema::table('class_sections', function (Blueprint $table) {
            $table->dropForeign(['form_teacher_id']);
            $table->dropColumn('form_teacher_id');
        });
    }
};
