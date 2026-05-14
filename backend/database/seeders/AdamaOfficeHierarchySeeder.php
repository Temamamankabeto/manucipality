<?php

namespace Database\Seeders;

use App\Models\Office;
use Illuminate\Database\Seeder;

class AdamaOfficeHierarchySeeder extends Seeder
{
    public function run(): void
    {
        $city = Office::updateOrCreate(
            ['code' => 'ADAMA'],
            [
                'name' => 'Adama',
                'type' => Office::TYPE_CITY,
                'parent_id' => null,
                'is_active' => true,
            ]
        );

        $structure = [
            'Abbaa Gadaa' => ['Badhaatuu', 'Dagaagaa', 'Odaa'],
            'Boolee' => ['Gooroo', 'Dhakaa Adii', 'Dhaddacha Araaraa', 'Andoodee'],
            'Daabee' => ['Caffee', 'Hangaatuu', 'Solloqqee Dongorree'],
            'Bokkuu Shanan' => ['Haroorettii', 'Torban Oboo', "Hawaash Malkaa Sa’aa"],
            'Luugoo' => ['Barreechaa', 'Migiraa', 'Dirree Nagaa'],
            'Dambalaa' => ['Irreecha', 'Malkaa Adaamaa', 'Wanjii'],
        ];

        $subcityIndex = 1;
        foreach ($structure as $subcityName => $woredas) {
            $subcityCode = sprintf('ADAMA-SC-%02d', $subcityIndex);
            $subcity = Office::updateOrCreate(
                ['code' => $subcityCode],
                [
                    'name' => $subcityName,
                    'type' => Office::TYPE_SUBCITY,
                    'parent_id' => $city->id,
                    'is_active' => true,
                ]
            );

            $woredaIndex = 1;
            foreach ($woredas as $woredaName) {
                $woredaCode = sprintf('%s-W-%02d', $subcityCode, $woredaIndex);
                $woreda = Office::updateOrCreate(
                    ['code' => $woredaCode],
                    [
                        'name' => $woredaName,
                        'type' => Office::TYPE_WOREDA,
                        'parent_id' => $subcity->id,
                        'is_active' => true,
                    ]
                );

                Office::updateOrCreate(
                    ['code' => sprintf('%s-Z-%02d', $woredaCode, 1)],
                    [
                        'name' => $woredaName . ' Zone 01',
                        'type' => Office::TYPE_ZONE,
                        'parent_id' => $woreda->id,
                        'is_active' => true,
                    ]
                );

                $woredaIndex++;
            }

            $subcityIndex++;
        }
    }
}
