<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // PostgreSQL configuration

        // Set client encoding
        DB::statement("SET client_encoding TO 'UTF8'");

        // Set timezone (optional)
        DB::statement("SET timezone TO 'UTC'");

        // Set standard conforming strings
        DB::statement("SET standard_conforming_strings = on");

        // Optional: set search path
        // DB::statement("SET search_path TO public");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reversal needed
    }
};