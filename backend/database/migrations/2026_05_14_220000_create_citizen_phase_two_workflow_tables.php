<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('citizens')) {
            Schema::table('citizens', function (Blueprint $table) {
                if (! Schema::hasColumn('citizens', 'citizen_uid')) {
                    $table->string('citizen_uid', 80)->nullable()->unique()->after('registration_number');
                }
                if (! Schema::hasColumn('citizens', 'current_workflow_stage')) {
                    $table->string('current_workflow_stage', 60)->nullable()->after('status');
                }
                if (! Schema::hasColumn('citizens', 'reviewed_at')) {
                    $table->timestamp('reviewed_at')->nullable()->after('submitted_at');
                }
                if (! Schema::hasColumn('citizens', 'woreda_verified_at')) {
                    $table->timestamp('woreda_verified_at')->nullable()->after('reviewed_at');
                }
                if (! Schema::hasColumn('citizens', 'subcity_approved_at')) {
                    $table->timestamp('subcity_approved_at')->nullable()->after('woreda_verified_at');
                }
                if (! Schema::hasColumn('citizens', 'city_id_generated_at')) {
                    $table->timestamp('city_id_generated_at')->nullable()->after('subcity_approved_at');
                }
                if (! Schema::hasColumn('citizens', 'activated_at')) {
                    $table->timestamp('activated_at')->nullable()->after('city_id_generated_at');
                }
                if (! Schema::hasColumn('citizens', 'rejected_at')) {
                    $table->timestamp('rejected_at')->nullable()->after('activated_at');
                }
                if (! Schema::hasColumn('citizens', 'flagged_at')) {
                    $table->timestamp('flagged_at')->nullable()->after('rejected_at');
                }
                if (! Schema::hasColumn('citizens', 'suspended_at')) {
                    $table->timestamp('suspended_at')->nullable()->after('flagged_at');
                }
                if (! Schema::hasColumn('citizens', 'rejection_reason')) {
                    $table->text('rejection_reason')->nullable()->after('suspended_at');
                }
                if (! Schema::hasColumn('citizens', 'flag_reason')) {
                    $table->text('flag_reason')->nullable()->after('rejection_reason');
                }
            });
        }

        if (Schema::hasTable('citizen_documents')) {
            Schema::table('citizen_documents', function (Blueprint $table) {
                if (! Schema::hasColumn('citizen_documents', 'verification_status')) {
                    $table->string('verification_status', 30)->default('pending')->after('verified_at')->index();
                }
                if (! Schema::hasColumn('citizen_documents', 'verification_remarks')) {
                    $table->text('verification_remarks')->nullable()->after('verification_status');
                }
                if (! Schema::hasColumn('citizen_documents', 'verified_by')) {
                    $table->foreignId('verified_by')->nullable()->after('verification_remarks')->constrained('users')->nullOnDelete();
                }
            });
        }

        if (! Schema::hasTable('citizen_approvals')) {
            Schema::create('citizen_approvals', function (Blueprint $table) {
                $table->id();
                $table->foreignId('citizen_id')->constrained('citizens')->cascadeOnDelete();
                $table->string('stage', 60)->index();
                $table->string('action', 60)->index();
                $table->string('from_status', 40)->nullable();
                $table->string('to_status', 40)->nullable();
                $table->text('remarks')->nullable();
                $table->foreignId('decided_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('decided_at')->nullable();
                $table->json('metadata')->nullable();
                $table->timestamps();

                $table->index(['citizen_id', 'stage']);
                $table->index(['citizen_id', 'action']);
            });
        }

        if (! Schema::hasTable('citizen_duplicate_flags')) {
            Schema::create('citizen_duplicate_flags', function (Blueprint $table) {
                $table->id();
                $table->foreignId('citizen_id')->constrained('citizens')->cascadeOnDelete();
                $table->foreignId('matched_citizen_id')->nullable()->constrained('citizens')->nullOnDelete();
                $table->string('national_id')->nullable()->index();
                $table->string('phone')->nullable()->index();
                $table->string('status', 30)->default('open')->index();
                $table->string('severity', 30)->default('medium');
                $table->text('remarks')->nullable();
                $table->foreignId('flagged_by')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('flagged_at')->nullable();
                $table->timestamp('resolved_at')->nullable();
                $table->timestamps();

                $table->index(['citizen_id', 'status']);
            });
        }

        if (! Schema::hasTable('citizen_unique_ids')) {
            Schema::create('citizen_unique_ids', function (Blueprint $table) {
                $table->id();
                $table->foreignId('citizen_id')->unique()->constrained('citizens')->cascadeOnDelete();
                $table->string('citizen_uid', 80)->unique();
                $table->foreignId('generated_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('generated_at')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('citizen_unique_ids');
        Schema::dropIfExists('citizen_duplicate_flags');
        Schema::dropIfExists('citizen_approvals');

        if (Schema::hasTable('citizen_documents')) {
            Schema::table('citizen_documents', function (Blueprint $table) {
                foreach (['verified_by', 'verification_remarks', 'verification_status'] as $column) {
                    if (Schema::hasColumn('citizen_documents', $column)) {
                        if ($column === 'verified_by') {
                            $table->dropConstrainedForeignId('verified_by');
                        } else {
                            $table->dropColumn($column);
                        }
                    }
                }
            });
        }

        if (Schema::hasTable('citizens')) {
            Schema::table('citizens', function (Blueprint $table) {
                foreach ([
                    'citizen_uid', 'current_workflow_stage', 'reviewed_at', 'woreda_verified_at',
                    'subcity_approved_at', 'city_id_generated_at', 'activated_at', 'rejected_at',
                    'flagged_at', 'suspended_at', 'rejection_reason', 'flag_reason',
                ] as $column) {
                    if (Schema::hasColumn('citizens', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }
};
