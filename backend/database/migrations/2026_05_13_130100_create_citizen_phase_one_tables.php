<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('citizens')) {
            Schema::create('citizens', function (Blueprint $table) {
                $table->id();
                $table->string('registration_number')->unique();
                $table->string('national_id')->nullable()->index();
                $table->string('first_name', 100);
                $table->string('middle_name', 100)->nullable();
                $table->string('last_name', 100);
                $table->string('gender', 20);
                $table->date('date_of_birth');
                $table->string('place_of_birth')->nullable();
                $table->string('nationality', 80)->default('Ethiopian');
                $table->string('marital_status', 30)->nullable();
                $table->string('phone', 40)->nullable()->index();
                $table->string('email')->nullable()->index();
                $table->string('occupation')->nullable();
                $table->string('education_level')->nullable();
                $table->boolean('disability_status')->default(false);
                $table->string('emergency_contact')->nullable();
                $table->string('photo_path')->nullable();
                $table->string('registration_channel', 40)->default('municipal_office');
                $table->string('status', 30)->default('draft')->index();
                $table->foreignId('city_id')->nullable()->constrained('offices')->nullOnDelete();
                $table->foreignId('subcity_id')->nullable()->constrained('offices')->nullOnDelete();
                $table->foreignId('woreda_id')->nullable()->constrained('offices')->nullOnDelete();
                $table->foreignId('zone_id')->nullable()->constrained('offices')->nullOnDelete();
                $table->foreignId('registered_by')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('last_status_changed_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('submitted_at')->nullable();
                $table->timestamps();
                $table->softDeletes();

                $table->index(['status', 'zone_id']);
                $table->index(['city_id', 'subcity_id', 'woreda_id', 'zone_id']);
            });
        }

        if (! Schema::hasTable('citizen_addresses')) {
            Schema::create('citizen_addresses', function (Blueprint $table) {
                $table->id();
                $table->foreignId('citizen_id')->constrained('citizens')->cascadeOnDelete();
                $table->text('address');
                $table->string('house_number')->nullable();
                $table->foreignId('city_id')->nullable()->constrained('offices')->nullOnDelete();
                $table->foreignId('subcity_id')->nullable()->constrained('offices')->nullOnDelete();
                $table->foreignId('woreda_id')->nullable()->constrained('offices')->nullOnDelete();
                $table->foreignId('zone_id')->nullable()->constrained('offices')->nullOnDelete();
                $table->boolean('is_current')->default(true);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('citizen_documents')) {
            Schema::create('citizen_documents', function (Blueprint $table) {
                $table->id();
                $table->foreignId('citizen_id')->constrained('citizens')->cascadeOnDelete();
                $table->string('type', 60)->index();
                $table->string('title')->nullable();
                $table->string('file_path');
                $table->string('original_name')->nullable();
                $table->string('mime_type')->nullable();
                $table->unsignedBigInteger('size')->default(0);
                $table->boolean('is_required')->default(false);
                $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('verified_at')->nullable();
                $table->json('metadata')->nullable();
                $table->timestamps();
                $table->softDeletes();

                $table->index(['citizen_id', 'type']);
            });
        }

        if (! Schema::hasTable('citizen_status_histories')) {
            Schema::create('citizen_status_histories', function (Blueprint $table) {
                $table->id();
                $table->foreignId('citizen_id')->constrained('citizens')->cascadeOnDelete();
                $table->string('from_status', 30)->nullable();
                $table->string('to_status', 30);
                $table->text('reason')->nullable();
                $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
                $table->json('metadata')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('citizen_status_histories');
        Schema::dropIfExists('citizen_documents');
        Schema::dropIfExists('citizen_addresses');
        Schema::dropIfExists('citizens');
    }
};
