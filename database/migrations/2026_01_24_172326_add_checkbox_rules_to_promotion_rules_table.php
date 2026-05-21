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
        Schema::table('promotion_rules', function (Blueprint $table) {
            $table->boolean('is_avg_enabled')->default(true);
            $table->boolean('is_core_pass_enabled')->default(false);
            $table->boolean('is_core_fail_limit_enabled')->default(false);
            $table->integer('pass_other_subjects_count')->default(5);
            // existing columns like min_average and max_failed_subjects are reused/complemented
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('promotion_rules', function (Blueprint $table) {
            $table->dropColumn(['is_avg_enabled', 'is_core_pass_enabled', 'is_core_fail_limit_enabled', 'pass_other_subjects_count']);
        });
    }
};
