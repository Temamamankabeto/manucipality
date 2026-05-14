<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class CitizenPhaseTwoPermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'citizens.workflow.view',
            'citizens.workflow.review',
            'citizens.workflow.verify-documents',
            'citizens.workflow.woreda-verify',
            'citizens.workflow.subcity-approve',
            'citizens.workflow.generate-id',
            'citizens.workflow.activate',
            'citizens.workflow.reject',
            'citizens.workflow.flag',
            'citizens.workflow.suspend',
            'citizens.duplicates.view',
            'citizen_approvals.view',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'sanctum']);
        }

        $superAdmin = Role::firstOrCreate(['name' => User::ROLE_SUPER_ADMIN, 'guard_name' => 'sanctum']);
        $admin = Role::firstOrCreate(['name' => User::ROLE_ADMIN, 'guard_name' => 'sanctum']);

        $superAdmin->givePermissionTo(Permission::where('guard_name', 'sanctum')->pluck('name')->all());
        $admin->givePermissionTo($permissions);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
