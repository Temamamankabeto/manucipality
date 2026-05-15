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
        Schema::create('asset_receives', function (Blueprint $table) {

            $table->id();

            $table->foreignId('asset_id')
                ->constrained('assets')
                ->cascadeOnDelete();

            /*
            Model 19 Receive Number
            */

            $table->string('receive_number')
                ->unique();

            /*
            Receive Information
            */

            $table->integer('quantity')
                ->default(1);

            $table->date('receive_date');

            $table->string('supplier')
                ->nullable();

            /*
            Store Keeper
            */

            $table->foreignId('received_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
            Property Officer Approval
            */

            $table->foreignId('approved_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
            Status
            */

            $table->enum('status', [
                'pending',
                'approved',
                'rejected'
            ])->default('pending');

            /*
            Rejection Reason
            */

            $table->text('rejection_reason')
                ->nullable();

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
        Schema::dropIfExists('asset_recieves');
    }
};
