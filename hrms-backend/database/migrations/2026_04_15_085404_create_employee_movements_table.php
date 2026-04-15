<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_movements', function (Blueprint $table) {
            $table->id();

            // Link to employee_profiles (IMPORTANT FIX)
            $table->foreignId('employee_id')
                  ->constrained('employee_profiles')
                  ->cascadeOnDelete();

            // Movement type (promotion, transfer, etc.)
            $table->string('type');

            // Position
            $table->string('old_position')->nullable();
            $table->string('new_position')->nullable();

            // Grade
            $table->string('old_grade')->nullable();
            $table->string('new_grade')->nullable();

            // Step
            $table->integer('old_step')->nullable();
            $table->integer('new_step')->nullable();

            // Salary
            $table->decimal('old_salary', 10, 2)->nullable();
            $table->decimal('new_salary', 10, 2)->nullable();

            // Effective date
            $table->date('effective_date');

            // Approved by (users table)
            $table->foreignId('approved_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            // Notes
            $table->text('remarks')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_movements');
    }
};