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
       Schema::create('assets', function (Blueprint $table) {

            $table->id();

            /*
            Relationships
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
            Asset Identification
            */

            $table->string('asset_code')->unique();

            $table->string('asset_name');

            $table->string('brand')->nullable();

            $table->string('model')->nullable();

            $table->string('serial_number')->nullable();

            /*
            Purchase Information
            */

            $table->date('purchase_date')->nullable();

            $table->decimal('purchase_cost', 15, 2)
                ->default(0);

            $table->string('supplier')->nullable();

            /*
            Quantity
            */

            $table->integer('quantity')
                ->default(1);

            $table->integer('available_quantity')
                ->default(0);

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
            Asset Status
            */

            $table->enum('status', [
                'available',
                'assigned',
                'maintenance',
                'damaged',
                'disposed',
                'auctioned'
            ])->default('available');

            /*
            Only for General Assets
            */

            $table->enum('working_status', [
                'working',
                'not_working'
            ])->nullable();

            /*
            Location
            */

            $table->string('location')->nullable();

            /*
            Department
            */

            $table->foreignId('department_id')
                ->nullable()
                ->constrained('departments')
                ->nullOnDelete();

            /*
            Store Keeper
            */

            $table->foreignId('store_keeper_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
            Description
            */

            $table->text('description')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
