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
            CitizenBackendCompletionSeeder::class,
            CitizenPhaseOnePermissionSeeder::class,
            CitizenPhaseTwoPermissionSeeder::class,
            CitizenPhaseThreePermissionSeeder::class,
            LocationPermissionSeeder::class,
            MunicipalityUserSeeder::class,
            CitizenPhaseOneUserSeeder::class,
            LocationUserSeeder::class,
        ]);
    }
}
