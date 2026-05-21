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
        Schema::table('students', function (Blueprint $table) {
            if (Schema::hasColumn('students', 'admission_number')) {
                $table->renameColumn('admission_number', 'registration_number');
            }
            if (Schema::hasColumn('students', 'first_name')) {
                $table->renameColumn('first_name', 'othername');
            }
            if (Schema::hasColumn('students', 'last_name')) {
                $table->renameColumn('last_name', 'surname');
            }
            if (Schema::hasColumn('students', 'dob')) {
                $table->renameColumn('dob', 'date_of_birth');
            }
            if (Schema::hasColumn('students', 'parent_name')) {
                $table->renameColumn('parent_name', 'guardian_name');
            }
            if (Schema::hasColumn('students', 'parent_phone')) {
                $table->renameColumn('parent_phone', 'guardian_number');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            if (Schema::hasColumn('students', 'registration_number')) {
                $table->renameColumn('registration_number', 'admission_number');
            }
            if (Schema::hasColumn('students', 'othername')) {
                $table->renameColumn('othername', 'first_name');
            }
            if (Schema::hasColumn('students', 'surname')) {
                $table->renameColumn('surname', 'last_name');
            }
            if (Schema::hasColumn('students', 'date_of_birth')) {
                $table->renameColumn('date_of_birth', 'dob');
            }
            if (Schema::hasColumn('students', 'guardian_name')) {
                $table->renameColumn('guardian_name', 'parent_name');
            }
            if (Schema::hasColumn('students', 'guardian_number')) {
                $table->renameColumn('guardian_number', 'parent_phone');
            }
        });
    }
};
