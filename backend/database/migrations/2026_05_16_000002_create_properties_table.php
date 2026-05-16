<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_category_id')->constrained('property_categories')->cascadeOnDelete();
            $table->string('property_number')->unique();
            $table->string('title');
            $table->string('property_type');
            $table->decimal('area_size',12,2)->nullable();
            $table->string('area_unit')->default('sqm');
            $table->string('latitude')->nullable();
            $table->string('longitude')->nullable();
            $table->text('address')->nullable();
            $table->foreignId('city_id')->nullable()->constrained('offices')->nullOnDelete();
            $table->foreignId('subcity_id')->nullable()->constrained('offices')->nullOnDelete();
            $table->foreignId('woreda_id')->nullable()->constrained('offices')->nullOnDelete();
            $table->enum('status',['draft','active','inactive'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('properties');
    }
};