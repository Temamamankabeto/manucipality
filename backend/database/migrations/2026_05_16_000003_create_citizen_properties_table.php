<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('citizen_properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('citizen_id')->constrained('citizens')->cascadeOnDelete();
            $table->foreignId('property_id')->constrained('properties')->cascadeOnDelete();
            $table->enum('ownership_type', ['owner', 'co_owner', 'lease_holder'])->default('owner');
            $table->date('ownership_start_date')->nullable();
            $table->date('ownership_end_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['citizen_id', 'property_id', 'ownership_type']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('citizen_properties');
    }
};