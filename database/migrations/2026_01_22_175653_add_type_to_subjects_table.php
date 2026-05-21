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
        Schema::table('subjects', function (Blueprint $table) {
            if (!Schema::hasColumn('subjects', 'type')) {
                $table->enum('type', ['core', 'elective'])->default('core')->after('code');
            }
            if (!Schema::hasColumn('subjects', 'description')) {
                $table->text('description')->nullable()->after('type');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            if (Schema::hasColumn('subjects', 'description')) {
                $table->dropColumn('description');
            }
            // We usually don't drop type if it was already there, 
            // but if we added it, we could. For safety, we'll leave it.
        });
    }
};
