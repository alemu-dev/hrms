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
        Schema::table('employee_movements', function (Blueprint $table) {

            // علاقة مع الموظف
            $table->foreignId('employee_id')
                  ->constrained()
                  ->cascadeOnDelete();

            // نوع الحركة
            $table->string('type'); // promotion, transfer, etc.

            // الوظيفة
            $table->string('old_position')->nullable();
            $table->string('new_position')->nullable();

            // الدرجة
            $table->string('old_grade')->nullable();
            $table->string('new_grade')->nullable();

            // الخطوة
            $table->integer('old_step')->nullable();
            $table->integer('new_step')->nullable();

            // الراتب
            $table->decimal('old_salary', 10, 2)->nullable();
            $table->decimal('new_salary', 10, 2)->nullable();

            // تاريخ السريان
            $table->date('effective_date');

            // من وافق
            $table->foreignId('approved_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            // ملاحظات
            $table->text('remarks')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employee_movements', function (Blueprint $table) {

            $table->dropForeign(['employee_id']);
            $table->dropForeign(['approved_by']);

            $table->dropColumn([
                'employee_id',
                'type',
                'old_position',
                'new_position',
                'old_grade',
                'new_grade',
                'old_step',
                'new_step',
                'old_salary',
                'new_salary',
                'effective_date',
                'approved_by',
                'remarks',
            ]);
        });
    }
};