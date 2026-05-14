<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class CitizenAccessPermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $guard = 'sanctum';

        $permissions = [
            'dashboard.view',
            'dashboard.citizens.view',

            'citizens.read',
            'citizens.view',
            'citizens.create',
            'citizens.update',
            'citizens.delete',
            'citizens.submit',

            'citizen-documents.manage',
            'citizen-photo.manage',
            'citizen-duplicates.check',

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

            'households.read',
            'households.create',
            'households.update',
            'households.delete',

            'users.read',
            'users.create',
            'users.update',
            'users.delete',
            'users.toggle',
            'users.reset-password',

            'offices.read',
            'offices.create',
            'offices.update',
            'offices.delete',

            'notifications.read',
            'notifications.manage',

            'reports.citizens.view',
            'reports.view',
            'reports.export',
            'audit.view',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => $guard]);
        }

        $superAdmin = Role::firstOrCreate(['name' => User::ROLE_SUPER_ADMIN, 'guard_name' => $guard]);
        $admin = Role::firstOrCreate(['name' => User::ROLE_ADMIN, 'guard_name' => $guard]);

        $superAdmin->syncPermissions(Permission::where('guard_name', $guard)->pluck('name')->all());

        $admin->syncPermissions([
            'dashboard.view',
            'dashboard.citizens.view',

            'citizens.read',
            'citizens.view',
            'citizens.create',
            'citizens.update',
            'citizens.submit',

            'citizen-documents.manage',
            'citizen-photo.manage',
            'citizen-duplicates.check',

            'citizens.workflow.view',
            'citizens.workflow.review',
            'citizens.workflow.verify-documents',
            'citizens.workflow.woreda-verify',
            'citizens.workflow.subcity-approve',
            'citizens.workflow.generate-id',
            'citizens.workflow.activate',
            'citizens.workflow.reject',
            'citizens.workflow.flag',

            'households.read',
            'households.create',
            'households.update',
            'households.delete',

            'users.read',
            'users.create',
            'users.update',
            'users.toggle',
            'users.reset-password',

            'offices.read',
            'offices.create',
            'offices.update',

            'notifications.read',
            'notifications.manage',

            'reports.citizens.view',
            'reports.view',
            'reports.export',
            'audit.view',
        ]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
