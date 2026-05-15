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
        Schema::create('departments', function (Blueprint $table) {

            $table->id();

            /*
            Department Information
            */

            $table->string('name');

            $table->string('code')
                ->unique()
                ->nullable();

            /*
            Parent Department
            Example:
            Finance -> Budget Team
            */

            $table->foreignId('parent_department_id')
                ->nullable()
                ->constrained('departments')
                ->nullOnDelete();

            /*
            Department Head
            */

            $table->foreignId('head_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
            Contact Information
            */

            $table->string('phone')
                ->nullable();

            $table->string('email')
                ->nullable();

            /*
            Office Location
            */

            $table->string('location')
                ->nullable();

            /*
            Department Type
            */

            $table->enum('department_type', [
                'store',
                'property_administration',
                'finance',
                'transport',
                'ict',
                'procurement',
                'management',
                'other'
            ])->default('other');

            /*
            Status
            */

            $table->enum('status', [
                'active',
                'inactive'
            ])->default('active');

            /*
            Description
            */

            $table->text('description')
                ->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('departments');
    }
};