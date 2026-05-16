<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_receipts', function (Blueprint $table) {

            $table->id();

            $table->string('receipt_number')
                ->unique();

            $table->foreignId('tax_payment_id')
                ->constrained('tax_payments')
                ->cascadeOnDelete();

            $table->foreignId('tax_bill_id')
                ->nullable()
                ->constrained('tax_bills')
                ->nullOnDelete();

            $table->foreignId('citizen_id')
                ->nullable()
                ->constrained('citizens')
                ->nullOnDelete();

            $table->decimal('amount', 18, 2);

            $table->enum('status', [
                'generated',
                'verified',
                'cancelled',
            ])->default('generated');

            $table->foreignId('generated_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('verified_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('generated_at')
                ->nullable();

            $table->timestamp('verified_at')
                ->nullable();

            $table->text('verification_note')
                ->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'payment_receipts'
        );
    }
};