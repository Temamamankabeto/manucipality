<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('household_members')) {
            return;
        }

        Schema::create('household_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('household_id')->constrained('households')->cascadeOnDelete();
            $table->foreignId('citizen_id')->constrained('citizens')->cascadeOnDelete();
            $table->string('relationship', 50)->index();
            $table->boolean('is_head')->default(false)->index();
            $table->boolean('is_dependent')->default(false)->index();
            $table->date('joined_at')->nullable();
            $table->date('left_at')->nullable();
            $table->string('status', 30)->default('active')->index();
            $table->foreignId('added_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['household_id', 'citizen_id']);
            $table->index(['citizen_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('household_members');
    }
};
