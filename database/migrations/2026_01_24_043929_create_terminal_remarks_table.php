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
        Schema::create('terminal_remarks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('student_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('academic_session_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('term_id')->constrained()->onDelete('cascade');
            $table->text('form_teacher_remark')->nullable();
            $table->text('principal_remark')->nullable();
            $table->string('promotion_status')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('terminal_remarks');
    }
};
