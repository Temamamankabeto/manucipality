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
        Schema::create('asset_disposals', function (Blueprint $table) {

            $table->id();

            $table->foreignId('asset_id')
                ->constrained('assets')
                ->cascadeOnDelete();

            /*
            Disposal Number
            */

            $table->string('disposal_number')
                ->unique();

            /*
            Disposal Information
            */

            $table->date('disposal_date')
                ->nullable();

            $table->text('reason');

            /*
            Inspection Result
            */

            $table->text('inspection_result')
                ->nullable();

            /*
            Technical Expert Review
            */

            $table->foreignId('inspected_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
            Committee Decision
            */

            $table->enum('committee_decision', [
                'pending',
                'approved',
                'rejected'
            ])->default('pending');

            /*
            Regional Approval
            */

            $table->enum('regional_approval', [
                'pending',
                'approved',
                'rejected'
            ])->default('pending');

            /*
            Auction Status
            */

            $table->enum('auction_status', [
                'pending',
                'auctioned',
                'sold'
            ])->default('pending');

            /*
            Revenue
            */

            $table->decimal('revenue_amount', 15, 2)
                ->default(0);

            /*
            Remarks
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
        Schema::dropIfExists('asset_disposals');
    }
};
