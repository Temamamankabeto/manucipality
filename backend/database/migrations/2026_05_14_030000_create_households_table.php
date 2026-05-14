<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('households')) {
            return;
        }

        Schema::create('households', function (Blueprint $table) {
            $table->id();
            $table->string('household_number')->unique();
            $table->foreignId('head_citizen_id')->nullable()->constrained('citizens')->nullOnDelete();
            $table->foreignId('city_id')->constrained('offices')->cascadeOnDelete();
            $table->foreignId('subcity_id')->constrained('offices')->cascadeOnDelete();
            $table->foreignId('woreda_id')->constrained('offices')->cascadeOnDelete();
            $table->foreignId('zone_id')->constrained('offices')->cascadeOnDelete();
            $table->string('house_number')->nullable();
            $table->text('address')->nullable();
            $table->string('status', 30)->default('active')->index();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['city_id', 'subcity_id', 'woreda_id', 'zone_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('households');
    }
};
