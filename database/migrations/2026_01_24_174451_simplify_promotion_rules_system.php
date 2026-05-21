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
            // Check if columns exist before adding them to avoid errors on retry
            if (!Schema::hasColumn('promotion_rules', 'is_rule1_termly')) {
                $table->boolean('is_rule1_termly')->default(true);
                $table->boolean('is_rule1_annual')->default(true);
                $table->boolean('is_rule2_termly')->default(false);
                $table->boolean('is_rule2_annual')->default(false);
                $table->boolean('is_rule3_termly')->default(false);
                $table->boolean('is_rule3_annual')->default(false);
            }
            
            // Make school_class_id nullable if it's not already
            $table->foreignUuid('school_class_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('promotion_rules', function (Blueprint $table) {
            $table->dropColumn([
                'is_rule1_termly', 'is_rule1_annual',
                'is_rule2_termly', 'is_rule2_annual',
                'is_rule3_termly', 'is_rule3_annual'
            ]);
        });
    }
};
