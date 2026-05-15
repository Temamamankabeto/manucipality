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
       Schema::create('asset_returns', function (Blueprint $table) {

            $table->id();

            /*
            Related Issue
            */

            $table->foreignId('asset_issue_id')
                ->constrained('asset_issues')
                ->cascadeOnDelete();

            $table->foreignId('asset_id')
                ->constrained('assets')
                ->cascadeOnDelete();

            /*
            Return Information
            */

            $table->integer('quantity')
                ->default(1);

            $table->date('return_date');

            /*
            Returned By User
            */

            $table->foreignId('returned_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
            Received By Store Keeper
            */

            $table->foreignId('received_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
            Condition After Return
            */

            $table->enum('condition', [
                'excellent',
                'good',
                'moderate',
                'poor',
                'very_poor',
                'damaged'
            ])->default('good');

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
        Schema::dropIfExists('asset_returns');
    }
};
