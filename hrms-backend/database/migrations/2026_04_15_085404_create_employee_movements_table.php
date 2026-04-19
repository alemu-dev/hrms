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

            $table->foreignId('employee_id')
                  ->constrained('employee_profiles')
                  ->cascadeOnDelete();

            $table->enum('type', [
                'promotion',
                'transfer',
                'demotion',
                'salary_adjustment',
                'step_increment',
                'grade_increment'
            ]);

            // Position
            $table->string('old_position')->nullable();
            $table->string('old_position_number')->nullable();
            $table->string('new_position')->nullable();
            $table->string('new_position_number')->nullable();

            // Grade
            $table->string('old_grade')->nullable();
            $table->string('new_grade')->nullable();

            // Step
            $table->integer('old_step')->nullable();
            $table->integer('new_step')->nullable();

            // Salary
            $table->decimal('old_salary', 12, 2)->nullable();
            $table->decimal('new_salary', 12, 2)->nullable();

            $table->date('effective_date');

            $table->foreignId('approved_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            $table->text('remarks')->nullable();

            $table->timestamps();

            $table->index('employee_id');
            $table->index('effective_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_movements');
    }
};