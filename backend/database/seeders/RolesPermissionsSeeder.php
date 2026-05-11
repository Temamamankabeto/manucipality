<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolesPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'auth.me',

            'users.read', 'users.create', 'users.update', 'users.disable', 'users.delete',
            'roles.read', 'roles.assign',
            'permissions.read',
            'audit.read',
         

             
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'sanctum',
            ]);
        }

        $roleMap = [
// system Admin
        
            // Procurement & Payment  module 
            'Employee / Requester',
            'Department Head',
            'Budget Officer',
            'Procurement Officer',
            'Storekeeper',
            'Finance Officer',
            'Finance Manager',
            'Auditor',
           
            // • Asset Management module
            'Asset Officer',
            'Department Manager',
            'Storekeeper',
            'Maintenance Officer',
            'Technician',
            'Finance Officer',
            'Auditor',
            'City Manager',

            // • Citizen Management module 
            'Citizen',
            'Front Officer',
            'Back Officer',
            'Registrar Supervisor',
            'ID Officer',
             
            'Auditor',
            'City Manager',
        // •Property Management module
          'Citizen / Owner',
          'Front Officer',
          'Property Officer',
          'Surveyor / GIS Officer',
          'Valuation Officer',
          'Lease Officer',
          'Finance Officer',
          'Legal Officer',
          'Property Supervisor',
          'Auditor',
       


        ];

        foreach ($roleMap as $roleName => $permissionsForRole) {
            $role = Role::firstOrCreate([
                'name' => $roleName,
                'guard_name' => 'sanctum',
            ]);

            $role->syncPermissions($permissionsForRole);
        }

        $generalAdmin = Role::firstOrCreate([
            'name' => 'General Admin',
            'guard_name' => 'sanctum',
        ]);

        $generalAdmin->syncPermissions(Permission::where('guard_name', 'sanctum')->pluck('name')->toArray());

        $admin = User::firstOrCreate(
            ['email' => 'admin@aig.com'],
            [
                'name' => 'General Admin',
                'phone' => '+1234567890',
                'password' => Hash::make('Admin@12345'),
            ]
        );

        if (!$admin->hasRole('General Admin')) {
            $admin->assignRole('General Admin');
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}