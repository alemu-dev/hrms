<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPositionNumbersToEmployeeMovementsTable extends Migration
{
    public function up(): void
    {
        Schema::table('employee_movements', function (Blueprint $table) {
            $table->string('old_position_number')->nullable()->after('old_position');
            $table->string('new_position_number')->nullable()->after('new_position');
        });
    }

    public function down(): void
    {
        Schema::table('employee_movements', function (Blueprint $table) {
            $table->dropColumn(['old_position_number', 'new_position_number']);
        });
    }
}