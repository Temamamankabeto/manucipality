<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class CitizenPhaseOnePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(LocationPermissionSeeder::class);
    }
}
