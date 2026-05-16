<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('tax_bills', function (Blueprint $table) {
            $table->id();

            $table->string('bill_number')->unique();

            $table->foreignId('tax_assessment_id')
                ->constrained('tax_assessments')
                ->cascadeOnDelete();

            $table->foreignId('citizen_id')
                ->nullable()
                ->constrained('citizens')
                ->nullOnDelete();

            $table->decimal('subtotal', 18, 2);
            $table->decimal('penalty_amount', 18, 2)->default(0);
            $table->decimal('total_amount', 18, 2);

            $table->enum('status', [
                'draft',
                'issued',
                'paid',
                'partial',
                'overdue',
                'cancelled',
            ])->default('draft');

            $table->date('due_date')->nullable();
            $table->timestamp('issued_at')->nullable();
            $table->timestamp('paid_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('tax_bills');
    }
};