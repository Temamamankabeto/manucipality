<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('citizen_notifications')) {
            Schema::create('citizen_notifications', function (Blueprint $table) {
                $table->id();
                $table->foreignId('citizen_id')->nullable()->constrained('citizens')->nullOnDelete();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('type', 80)->default('general')->index();
                $table->string('channel', 30)->default('in_app')->index();
                $table->string('title');
                $table->text('body')->nullable();
                $table->string('status', 30)->default('unread')->index();
                $table->json('metadata')->nullable();
                $table->timestamp('sent_at')->nullable();
                $table->timestamp('read_at')->nullable();
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();

                $table->index(['citizen_id', 'status']);
                $table->index(['user_id', 'status']);
            });
        }

        if (! Schema::hasTable('citizen_service_histories')) {
            Schema::create('citizen_service_histories', function (Blueprint $table) {
                $table->id();
                $table->foreignId('citizen_id')->constrained('citizens')->cascadeOnDelete();
                $table->string('service_name');
                $table->string('reference_number')->nullable();
                $table->string('status', 50)->nullable();
                $table->text('description')->nullable();
                $table->json('metadata')->nullable();
                $table->timestamp('occurred_at')->nullable();
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();

                $table->index(['citizen_id', 'service_name']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('citizen_service_histories');
        Schema::dropIfExists('citizen_notifications');
    }
};
