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
        Schema::create('result_pins', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignIdFor(\App\Models\Student::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(\App\Models\AcademicSession::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(\App\Models\Term::class)->constrained()->cascadeOnDelete();
            $table->string('pin_code'); // Hashed
            $table->string('serial_number')->unique();
            $table->integer('usage_count')->default(0);
            $table->integer('max_usage')->default(5);
            $table->foreignUuid('generated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('result_pins');
    }
};
