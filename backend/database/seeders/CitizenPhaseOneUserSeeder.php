<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class CitizenPhaseOneUserSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(LocationUserSeeder::class);
    }
}
