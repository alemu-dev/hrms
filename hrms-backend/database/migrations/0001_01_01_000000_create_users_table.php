<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Employee Education (one-to-many)
        Schema::create('employee_education', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('level')->nullable(); // e.g. High School, Bachelor, Certificate
            $table->string('field')->nullable(); // e.g. Computer Science, Accounting
            $table->string('institution')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->text('notes')->nullable(); // flexible description
            $table->timestamps();
        });

        // Employee Experience (one-to-many)
        Schema::create('employee_experience', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('company');
            $table->string('role');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->text('responsibilities')->nullable();
            $table->timestamps();
        });

        // Employee Biography (one-to-one)
        Schema::create('employee_biography', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->longText('bio_text')->nullable();
            $table->timestamps();
        });

        // Employee Documents (one-to-many)
        Schema::create('employee_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('document_type'); // e.g. CV, Certificate, ID
            $table->string('file_path');     // storage path
            $table->timestamp('uploaded_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_education');
        Schema::dropIfExists('employee_experience');
        Schema::dropIfExists('employee_biography');
        Schema::dropIfExists('employee_documents');
    }
};
