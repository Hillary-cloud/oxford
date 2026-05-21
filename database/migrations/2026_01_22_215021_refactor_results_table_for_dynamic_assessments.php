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
        Schema::table('results', function (Blueprint $table) {
            $table->dropColumn('ca_score');
            $table->json('assessments')->nullable()->after('subject_id');
            $table->integer('position')->nullable()->after('grade'); // Subject position in class
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('results', function (Blueprint $table) {
            $table->decimal('ca_score', 8, 2)->default(0);
            $table->dropColumn(['assessments', 'position']);
        });
    }
};
