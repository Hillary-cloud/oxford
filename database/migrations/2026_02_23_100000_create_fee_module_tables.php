<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // -------------------------------------------------------
        // 1. School Accounts (bank / POS / cash endpoints)
        // -------------------------------------------------------
        Schema::create('school_accounts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('account_number')->nullable();
            $table->string('bank_name')->nullable();
            $table->enum('account_type', ['bank', 'pos', 'cash'])->default('bank');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // -------------------------------------------------------
        // 2. Fee Groups  (custom student buckets – e.g. Boarding)
        // -------------------------------------------------------
        Schema::create('fee_groups', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // -------------------------------------------------------
        // 3. Student ↔ Fee Group pivot
        // -------------------------------------------------------
        Schema::create('student_fee_groups', function (Blueprint $table) {
            $table->id();
            $table->uuid('student_id');
            $table->uuid('fee_group_id');
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('students')->cascadeOnDelete();
            $table->foreign('fee_group_id')->references('id')->on('fee_groups')->cascadeOnDelete();
            $table->unique(['student_id', 'fee_group_id']);
        });

        // -------------------------------------------------------
        // 4. Fee Types  (the template / definition of a fee)
        // -------------------------------------------------------
        Schema::create('fee_types', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('amount', 12, 2);
            $table->boolean('is_recurring')->default(false);
            $table->enum('recurring_interval', ['termly', 'monthly', 'annually'])->nullable();
            $table->uuid('academic_session_id')->nullable();
            $table->uuid('term_id')->nullable();
            $table->date('due_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->uuid('created_by');
            $table->timestamps();

            $table->foreign('academic_session_id')->references('id')->on('academic_sessions')->nullOnDelete();
            $table->foreign('term_id')->references('id')->on('terms')->nullOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->cascadeOnDelete();
        });

        // -------------------------------------------------------
        // 5. Fee Assignments  (who the fee applies to)
        // -------------------------------------------------------
        Schema::create('fee_assignments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('fee_type_id');
            $table->enum('target_type', ['all', 'class', 'student', 'group', 'gender']);
            // Nullable FKs — only one should be set depending on target_type
            $table->uuid('school_class_id')->nullable();
            $table->uuid('student_id')->nullable();
            $table->uuid('fee_group_id')->nullable();
            $table->enum('gender', ['male', 'female'])->nullable();
            $table->timestamps();

            $table->foreign('fee_type_id')->references('id')->on('fee_types')->cascadeOnDelete();
            $table->foreign('school_class_id')->references('id')->on('school_classes')->nullOnDelete();
            $table->foreign('student_id')->references('id')->on('students')->cascadeOnDelete();
            $table->foreign('fee_group_id')->references('id')->on('fee_groups')->cascadeOnDelete();
        });

        // -------------------------------------------------------
        // 6. Fee Payments  (a transaction header)
        // -------------------------------------------------------
        Schema::create('fee_payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('receipt_number')->unique();
            $table->uuid('student_id');
            $table->uuid('fee_type_id');
            $table->uuid('academic_session_id');
            $table->uuid('term_id')->nullable();
            $table->decimal('total_amount', 12, 2);   // full fee amount
            $table->decimal('amount_paid', 12, 2);    // this payment installment
            $table->decimal('balance', 12, 2);        // outstanding after this payment
            $table->enum('status', ['pending', 'partial', 'paid'])->default('pending');
            $table->date('payment_date');
            $table->text('notes')->nullable();
            $table->uuid('created_by');
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('students')->cascadeOnDelete();
            $table->foreign('fee_type_id')->references('id')->on('fee_types')->cascadeOnDelete();
            $table->foreign('academic_session_id')->references('id')->on('academic_sessions')->cascadeOnDelete();
            $table->foreign('term_id')->references('id')->on('terms')->nullOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->cascadeOnDelete();
        });

        // -------------------------------------------------------
        // 7. Payment Items  (multi-method breakdown per payment)
        // -------------------------------------------------------
        Schema::create('payment_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('fee_payment_id');
            $table->enum('payment_method', ['cash', 'transfer', 'pos', 'bank_teller']);
            $table->decimal('amount', 12, 2);
            $table->uuid('school_account_id')->nullable();  // null for cash
            $table->string('reference_number')->nullable(); // teller / bank ref
            $table->string('notes')->nullable();
            $table->timestamps();

            $table->foreign('fee_payment_id')->references('id')->on('fee_payments')->cascadeOnDelete();
            $table->foreign('school_account_id')->references('id')->on('school_accounts')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_items');
        Schema::dropIfExists('fee_payments');
        Schema::dropIfExists('fee_assignments');
        Schema::dropIfExists('fee_types');
        Schema::dropIfExists('student_fee_groups');
        Schema::dropIfExists('fee_groups');
        Schema::dropIfExists('school_accounts');
    }
};
