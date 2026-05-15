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
        Schema::create('asset_requests', function (Blueprint $table) {
        $table->id();

     $table->foreignId('asset_id')
        ->constrained('assets')
        ->cascadeOnDelete();

    $table->foreignId('requested_by')
        ->constrained('users')
        ->cascadeOnDelete();

    $table->integer('quantity')->default(1);

    $table->text('reason')->nullable();

    $table->string('status')->default('pending');
    // pending | approved | rejected | issued

    $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_requests');
    }
};
