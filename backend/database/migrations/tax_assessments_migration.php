<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('tax_assessments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('property_id')
                ->constrained('properties')
                ->cascadeOnDelete();

            $table->foreignId('property_valuation_id')
                ->nullable()
                ->constrained('property_valuations')
                ->nullOnDelete();

            $table->foreignId('tax_type_id')
                ->constrained('tax_types')
                ->cascadeOnDelete();

            $table->year('assessment_year');

            $table->decimal('assessed_value', 18, 2);
            $table->decimal('tax_rate', 8, 2)->default(0);
            $table->decimal('tax_amount', 18, 2);
            $table->decimal('penalty_amount', 18, 2)->default(0);
            $table->decimal('total_amount', 18, 2);

            $table->enum('status', [
                'draft',
                'generated',
                'paid',
                'overdue',
                'cancelled',
            ])->default('generated');

            $table->date('due_date')->nullable();
            $table->timestamp('paid_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('tax_assessments');
    }
};