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
        Schema::create('general_asset_inspections', function (Blueprint $table) {
    $table->id();

    $table->foreignId('general_asset_id')
        ->constrained('general_assets')
        ->cascadeOnDelete();

    $table->date('inspection_date');

    $table->foreignId('inspected_by')->nullable();

    $table->enum('condition', [
        'very_poor','poor','moderate','good','excellent'
    ]);

    $table->enum('working_status', [
        'working','not_working'
    ])->nullable();

    $table->text('inspection_note')->nullable();
    $table->text('recommendation')->nullable();

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('general_asset_inspections');
    }
};
