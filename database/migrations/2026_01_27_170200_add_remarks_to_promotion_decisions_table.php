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
        Schema::table('promotion_decisions', function (Blueprint $table) {
            $table->text('form_teacher_remark')->nullable()->after('is_locked');
            $table->text('principal_remark')->nullable()->after('form_teacher_remark');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('promotion_decisions', function (Blueprint $table) {
            $table->dropColumn(['form_teacher_remark', 'principal_remark']);
        });
    }
};
