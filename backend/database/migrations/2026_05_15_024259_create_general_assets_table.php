<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('general_assets', function (Blueprint $table) {

            $table->id();

            /*
            Shared Master Tables
            */

            $table->foreignId('asset_type_id')
                ->constrained('asset_types')
                ->cascadeOnDelete();

            $table->foreignId('asset_group_id')
                ->constrained('asset_groups')
                ->cascadeOnDelete();

            $table->foreignId('asset_subgroup_id')
                ->constrained('asset_subgroups')
                ->cascadeOnDelete();

            /*
            Asset Information
            */

            $table->string('asset_code')
                ->unique();

            $table->string('asset_name');

            /*
            Location
            */

            $table->string('location')
                ->nullable();

            /*
            Asset Condition
            */

            $table->enum('condition', [
                'very_poor',
                'poor',
                'moderate',
                'good',
                'excellent'
            ])->default('good');

            /*
            Mainly for Light Assets
            */

            $table->enum('working_status', [
                'working',
                'not_working'
            ])->nullable();

            /*
            Asset Size
            */

            $table->decimal('size', 15, 2)
                ->nullable();

            $table->string('size_unit')
                ->nullable();

            /*
            Construction Information
            */

            $table->year('construction_year')
                ->nullable();

            /*
            Estimated Value
            */

            $table->decimal('estimated_value', 15, 2)
                ->default(0);

            /*
            Responsible Department
            */

            $table->foreignId('department_id')
                ->nullable()
                ->constrained('departments')
                ->nullOnDelete();

            /*
            Status
            */

            $table->enum('status', [
                'active',
                'under_maintenance',
                'damaged',
                'closed'
            ])->default('active');

            /*
            Description
            */

            $table->text('description')
                ->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('general_assets');
    }
};