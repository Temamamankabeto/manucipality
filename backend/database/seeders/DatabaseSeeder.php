<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AdamaOfficeHierarchySeeder::class,
            RolesPermissionsSeeder::class,
            CitizenPhaseOnePermissionSeeder::class,
            LocationPermissionSeeder::class,
            MunicipalityUserSeeder::class,
            CitizenPhaseOneUserSeeder::class,
            LocationUserSeeder::class,
        ]);
    }
}
