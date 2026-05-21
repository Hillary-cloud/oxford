<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StaffAttendancePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Permissions
        $permissions = [
            'view staff attendance monitor',
            'mark staff attendance',
            'view staff attendance logs',
        ];

        foreach ($permissions as $permission) {
            \App\Models\Permission::firstOrCreate(['name' => $permission]);
        }

        // Assign to Roles
        $superAdmin = \App\Models\Role::where('name', 'Super Admin')->first();
        if ($superAdmin) {
            $superAdmin->givePermissionTo($permissions);
        }

        $admin = \App\Models\Role::where('name', 'Admin')->first();
        if ($admin) {
            $admin->givePermissionTo($permissions);
        }

        // Grant 'mark staff attendance' to Teachers and Staff if they exist
        foreach (['Teacher', 'Staff'] as $roleName) {
            $role = \App\Models\Role::where('name', $roleName)->first();
            if ($role) {
                $role->givePermissionTo('mark staff attendance');
            }
        }
    }
}
