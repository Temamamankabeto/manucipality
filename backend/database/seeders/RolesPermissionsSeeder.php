<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $guard = 'sanctum';

        $permissions = [
            'dashboard.view',
            'users.view', 'users.create', 'users.update', 'users.delete', 'users.toggle', 'users.reset-password',
            'roles.view', 'roles.create', 'roles.update', 'roles.delete', 'roles.assign', 'roles.assign-permissions',
            'permissions.view', 'permissions.create', 'permissions.update', 'permissions.delete',
            'offices.view',
            'audit.view',
            'citizens.view', 'citizens.create', 'citizens.update', 'citizens.verify', 'citizens.validate', 'citizens.approve', 'citizens.suspend',
            'reports.view', 'reports.export',
            'notifications.view', 'notifications.send',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => $guard]);
        }

        $superAdmin = Role::firstOrCreate(['name' => User::ROLE_SUPER_ADMIN, 'guard_name' => $guard]);
        $admin = Role::firstOrCreate(['name' => User::ROLE_ADMIN, 'guard_name' => $guard]);

        $superAdmin->syncPermissions(Permission::where('guard_name', $guard)->pluck('name')->all());

        $admin->syncPermissions([
            'dashboard.view',
            'users.view', 'users.create', 'users.update', 'users.delete', 'users.toggle', 'users.reset-password',
            'roles.view', 'roles.assign',
            'offices.view',
            'audit.view',
            'citizens.view', 'citizens.create', 'citizens.update', 'citizens.verify', 'citizens.validate', 'citizens.approve', 'citizens.suspend',
            'reports.view', 'reports.export',
            'notifications.view', 'notifications.send',
        ]);

        $this->convertOldRoles($superAdmin, $admin);

        Role::query()
            ->where('guard_name', $guard)
            ->whereNotIn('name', [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN])
            ->delete();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    protected function convertOldRoles(Role $superAdmin, Role $admin): void
    {
        $oldSuperRoles = ['System Admin', 'General Admin', 'City Manager', 'City DMIN'];
        $oldAdminLevels = [
            'City Admin' => User::LEVEL_CITY,
            'City Manager' => User::LEVEL_CITY,
            'Subcity Admin' => User::LEVEL_SUBCITY,
            'Woreda Admin' => User::LEVEL_WOREDA,
            'Zone Admin' => User::LEVEL_ZONE,
            'Zone admin' => User::LEVEL_ZONE,
        ];

        User::query()->with('roles')->chunkById(100, function ($users) use ($oldSuperRoles, $oldAdminLevels, $superAdmin, $admin) {
            foreach ($users as $user) {
                $roleNames = $user->roles->pluck('name')->all();

                if (array_intersect($roleNames, $oldSuperRoles)) {
                    $user->syncRoles([$superAdmin->name]);
                    $user->forceFill(['admin_level' => null])->save();
                    continue;
                }

                foreach ($oldAdminLevels as $oldRole => $level) {
                    if (in_array($oldRole, $roleNames, true)) {
                        $user->syncRoles([$admin->name]);
                        $user->forceFill(['admin_level' => $level])->save();
                        continue 2;
                    }
                }
            }
        });

        DB::table('model_has_roles')
            ->whereNotIn('role_id', [$superAdmin->id, $admin->id])
            ->delete();
    }
}
