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
            $table->boolean('is_rule4_termly')->default(false)->after('is_rule3_annual');
            $table->boolean('is_rule4_annual')->default(false)->after('is_rule4_termly');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('promotion_rules', function (Blueprint $table) {
            $table->dropColumn(['is_rule4_termly', 'is_rule4_annual']);
        });
    }
};
