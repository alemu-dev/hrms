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
        Schema::create('employee_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('full_name');
            $table->string('gender')->nullable(); 
            $table->string('department')->nullable();
            
            // Define position first
            $table->string('position')->nullable();
            
            // Order them logically here; ->after() is removed because it's not used in Schema::create
            $table->string('position_number')->nullable();
            $table->string('grade')->nullable();
            $table->integer('step')->nullable();
            
            $table->decimal('salary', 10, 2)->nullable();
            $table->date('hire_date')->nullable();
            $table->string('status')->default('active');
            $table->string('phone_number')->nullable();
            $table->string('address')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_profiles');
    }
};