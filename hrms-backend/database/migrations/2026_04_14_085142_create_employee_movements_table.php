<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('employee_movements', function (Blueprint $table) {
            $table->id();

            // ✅ Correct foreign key
            $table->foreignId('employee_id')
                  ->constrained('employee_profiles')
                  ->cascadeOnDelete();

            $table->enum('type', [
                'step_increment',
                'grade_increment',
                'promotion'
            ]);

            $table->string('old_position')->nullable();
            $table->string('new_position')->nullable();

            $table->string('old_grade')->nullable();
            $table->string('new_grade')->nullable();

            $table->string('old_step')->nullable();
            $table->string('new_step')->nullable();

            $table->decimal('old_salary', 10, 2)->nullable();
            $table->decimal('new_salary', 10, 2)->nullable();

            $table->date('effective_date');

            $table->string('approved_by')->nullable();
            $table->text('remarks')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_movements');
    }
};