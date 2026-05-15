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
        Schema::create('asset_issues', function (Blueprint $table) {

            $table->id();

            /*
            Related Request
            */

            $table->foreignId('asset_request_id')
                ->nullable()
                ->constrained('asset_requests')
                ->nullOnDelete();

            $table->foreignId('asset_id')
                ->constrained('assets')
                ->cascadeOnDelete();

            /*
            Model 22
            */

            $table->string('issue_number')
                ->unique();

            /*
            Issue Information
            */

            $table->integer('quantity')
                ->default(1);

            $table->date('issue_date');

            /*
            Issued To
            */

            $table->foreignId('issued_to')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
            Store Keeper
            */

            $table->foreignId('issued_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
            Approved By Property Officer
            */

            $table->foreignId('approved_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
            Workflow Status
            */

            $table->enum('status', [
                'pending',
                'approved',
                'rejected',
                'issued',
                'returned'
            ])->default('pending');

            /*
            Purpose
            */

            $table->text('purpose')
                ->nullable();

            /*
            Rejection Reason
            */

            $table->text('rejection_reason')
                ->nullable();

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
        Schema::dropIfExists('asset_issues');
    }
};
