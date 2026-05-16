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
                if (! Schema::hasColumn('citizens', 'deactivated_at')) {
                    $table->timestamp('deactivated_at')->nullable()->after('suspended_at');
                }
                if (! Schema::hasColumn('citizens', 'reactivated_at')) {
                    $table->timestamp('reactivated_at')->nullable()->after('deactivated_at');
                }
                if (! Schema::hasColumn('citizens', 'deactivation_reason')) {
                    $table->text('deactivation_reason')->nullable()->after('flag_reason');
                }
                if (! Schema::hasColumn('citizens', 'merged_into_citizen_id')) {
                    $table->foreignId('merged_into_citizen_id')->nullable()->after('deactivation_reason')->constrained('citizens')->nullOnDelete();
                }
                if (! Schema::hasColumn('citizens', 'merged_by')) {
                    $table->foreignId('merged_by')->nullable()->after('merged_into_citizen_id')->constrained('users')->nullOnDelete();
                }
                if (! Schema::hasColumn('citizens', 'merged_at')) {
                    $table->timestamp('merged_at')->nullable()->after('merged_by');
                }
            });
        }

        if (Schema::hasTable('citizen_duplicate_flags')) {
            Schema::table('citizen_duplicate_flags', function (Blueprint $table) {
                if (! Schema::hasColumn('citizen_duplicate_flags', 'resolution_note')) {
                    $table->text('resolution_note')->nullable()->after('remarks');
                }
            });
        }
    }

    public function down(): void
    {
        // Intentionally not dropping columns to protect production citizen history.
    }
};
