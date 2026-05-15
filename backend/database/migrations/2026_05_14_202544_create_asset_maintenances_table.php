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
       Schema::create('asset_maintenances', function (Blueprint $table) {

            $table->id();

            $table->foreignId('asset_id')
                ->constrained('assets')
                ->cascadeOnDelete();

            /*
            Maintenance Information
            */

            $table->date('maintenance_date');

            $table->text('problem_description');

            $table->text('maintenance_action')
                ->nullable();

            /*
            Cost
            */

            $table->decimal('maintenance_cost', 15, 2)
                ->default(0);

            /*
            Maintenance By
            */

            $table->foreignId('maintained_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
            Maintenance Status
            */

            $table->enum('status', [
                'pending',
                'in_progress',
                'completed'
            ])->default('pending');

            /*
            Remark
            */

            $table->text('remark')
                ->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_maintenances');
    }
};
