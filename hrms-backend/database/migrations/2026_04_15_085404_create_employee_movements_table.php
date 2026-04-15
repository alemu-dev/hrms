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
                  ->constrained()
                  ->cascadeOnDelete();

            $table->string('type');

            $table->string('old_position')->nullable();
            $table->string('new_position')->nullable();

            $table->string('old_grade')->nullable();
            $table->string('new_grade')->nullable();

            $table->integer('old_step')->nullable();
            $table->integer('new_step')->nullable();

            $table->decimal('old_salary', 10, 2)->nullable();
            $table->decimal('new_salary', 10, 2)->nullable();

            $table->date('effective_date');

            $table->foreignId('approved_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            $table->text('remarks')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_movements');
    }
};