<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class LocationManagementSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AdamaOfficeHierarchySeeder::class,
            LocationPermissionSeeder::class,
            LocationUserSeeder::class,
        ]);
    }
}
