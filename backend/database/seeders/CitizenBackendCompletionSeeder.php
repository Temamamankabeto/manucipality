<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class CitizenBackendCompletionSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $guard = 'sanctum';

        $permissions = [
            'dashboard.view',
            'dashboard.citizens.view',

            'users.read', 'users.view', 'users.create', 'users.update', 'users.delete', 'users.toggle', 'users.reset-password',
            'roles.read', 'roles.view', 'roles.create', 'roles.update', 'roles.delete', 'roles.assign', 'roles.assign-permissions',
            'permissions.read', 'permissions.view', 'permissions.create', 'permissions.update', 'permissions.delete',
            'offices.read', 'offices.view', 'offices.create', 'offices.update', 'offices.delete',

            'citizens.read', 'citizens.view', 'citizens.create', 'citizens.update', 'citizens.delete', 'citizens.submit',
            'citizens.verify', 'citizens.validate', 'citizens.approve', 'citizens.suspend', 'citizens.deactivate', 'citizens.reactivate', 'citizens.merge',
            'citizen-documents.manage', 'citizen-photo.manage', 'citizen-duplicates.check',

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
            'citizens.duplicates.resolve',
            'citizens.duplicates.dismiss',
            'citizen_approvals.view',

            'households.read', 'households.create', 'households.update', 'households.delete',
            'notifications.read', 'notifications.manage', 'notifications.send',
            'reports.view', 'reports.export', 'reports.citizens.view',
            'audit.view',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => $guard]);
        }

        $superAdmin = Role::firstOrCreate(['name' => User::ROLE_SUPER_ADMIN, 'guard_name' => $guard]);
        $admin = Role::firstOrCreate(['name' => User::ROLE_ADMIN, 'guard_name' => $guard]);

        $superAdmin->syncPermissions(Permission::where('guard_name', $guard)->pluck('name')->all());

        $admin->syncPermissions([
            'dashboard.view', 'dashboard.citizens.view',
            'users.read', 'users.view', 'users.create', 'users.update', 'users.delete', 'users.toggle', 'users.reset-password',
            'offices.read', 'offices.view',
            'citizens.read', 'citizens.view', 'citizens.create', 'citizens.update', 'citizens.delete', 'citizens.submit',
            'citizens.verify', 'citizens.validate', 'citizens.approve',
            'citizen-documents.manage', 'citizen-photo.manage', 'citizen-duplicates.check',
            'citizens.workflow.view', 'citizens.workflow.review', 'citizens.workflow.verify-documents',
            'citizens.workflow.woreda-verify', 'citizens.workflow.subcity-approve', 'citizens.workflow.generate-id',
            'citizens.workflow.activate', 'citizens.workflow.reject', 'citizens.workflow.flag',
            'citizens.duplicates.view', 'citizens.duplicates.resolve', 'citizens.duplicates.dismiss',
            'citizen_approvals.view',
            'households.read', 'households.create', 'households.update', 'households.delete',
            'notifications.read', 'notifications.manage', 'notifications.send',
            'reports.view', 'reports.export', 'reports.citizens.view',
            'audit.view',
        ]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
