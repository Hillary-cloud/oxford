<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Fix Students Table
        Schema::table('students', function (Blueprint $table) {
            if (DB::getDriverName() !== 'sqlite') {
                // Drop old foreign key if it exists
                // Laravel naming convention for the old one was students_class_arm_id_foreign
                $table->dropForeign('students_class_arm_id_foreign');
                
                // Re-add correctly pointing to class_sections
                $table->foreign('class_section_id')->references('id')->on('class_sections')->onDelete('cascade');
            }
        });

        // Fix Results Table
        Schema::table('results', function (Blueprint $table) {
            if (DB::getDriverName() !== 'sqlite') {
                // Drop old foreign key if it exists
                // Laravel naming convention for the old one was results_class_arm_id_foreign
                $table->dropForeign('results_class_arm_id_foreign');
                
                // Re-add correctly pointing to class_sections
                $table->foreign('class_section_id')->references('id')->on('class_sections')->onDelete('cascade');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('results', function (Blueprint $table) {
            $table->dropForeign(['class_section_id']);
            $table->foreign('class_section_id')->references('id')->on('class_arms')->onDelete('cascade');
        });

        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign(['class_section_id']);
            $table->foreign('class_section_id')->references('id')->on('class_arms')->onDelete('cascade');
        });
    }
};
