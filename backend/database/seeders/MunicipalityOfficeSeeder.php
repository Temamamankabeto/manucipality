<?php

namespace Database\Seeders;

use App\Models\Office;
use Illuminate\Database\Seeder;

class MunicipalityOfficeSeeder extends Seeder
{
    public function run(): void
    {
        $city = Office::updateOrCreate(
            ['code' => 'ADA-CITY'],
            ['name' => 'Adama City', 'type' => Office::TYPE_CITY, 'parent_id' => null, 'is_active' => true]
        );

        $subcities = [
            ['code' => 'ADA-SC-01', 'name' => 'Adama Subcity 01'],
            ['code' => 'ADA-SC-02', 'name' => 'Adama Subcity 02'],
            ['code' => 'ADA-SC-03', 'name' => 'Adama Subcity 03'],
        ];

        foreach ($subcities as $subcityIndex => $subcityData) {
            $subcity = Office::updateOrCreate(
                ['code' => $subcityData['code']],
                ['name' => $subcityData['name'], 'type' => Office::TYPE_SUBCITY, 'parent_id' => $city->id, 'is_active' => true]
            );

            for ($woredaNumber = 1; $woredaNumber <= 2; $woredaNumber++) {
                $woredaCode = sprintf('ADA-SC-%02d-W%02d', $subcityIndex + 1, $woredaNumber);
                $woreda = Office::updateOrCreate(
                    ['code' => $woredaCode],
                    [
                        'name' => sprintf('%s Woreda %02d', $subcityData['name'], $woredaNumber),
                        'type' => Office::TYPE_WOREDA,
                        'parent_id' => $subcity->id,
                        'is_active' => true,
                    ]
                );

                for ($zoneNumber = 1; $zoneNumber <= 2; $zoneNumber++) {
                    Office::updateOrCreate(
                        ['code' => sprintf('%s-Z%02d', $woredaCode, $zoneNumber)],
                        [
                            'name' => sprintf('%s Zone %02d', $woreda->name, $zoneNumber),
                            'type' => Office::TYPE_ZONE,
                            'parent_id' => $woreda->id,
                            'is_active' => true,
                        ]
                    );
                }
            }
        }
    }
}
