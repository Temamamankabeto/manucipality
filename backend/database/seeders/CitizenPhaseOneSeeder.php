<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class CitizenPhaseOneSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            MunicipalityOfficeSeeder::class,
            CitizenPhaseOnePermissionSeeder::class,
            CitizenPhaseOneUserSeeder::class,
        ]);
    }
}
