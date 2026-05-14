<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class CitizenPhaseThreePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'households.read',
            'households.create',
            'households.update',
            'households.delete',
            'citizens.profile.view',
            'citizens.profile.update',
            'reports.citizens.view',
            'dashboard.citizens.view',
            'notifications.read',
            'notifications.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'sanctum']);
        }

        $superAdmin = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'sanctum']);
        $admin = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'sanctum']);

        $superAdmin->syncPermissions(Permission::where('guard_name', 'sanctum')->pluck('name')->all());
        $admin->givePermissionTo($permissions);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
