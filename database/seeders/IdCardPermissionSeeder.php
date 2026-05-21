<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;
use App\Models\Role;

class IdCardPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create the permission
        $permission = Permission::firstOrCreate(['name' => 'manage id card']);

        // Assign to Super Admin
        $role = Role::firstOrCreate(['name' => 'Super Admin']);
        if (!$role->hasPermissionTo('manage id card')) {
            $role->givePermissionTo('manage id card');
        }
        
        // Assign to Admin (optional, but good for school admins)
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        if (!$adminRole->hasPermissionTo('manage id card')) {
            $adminRole->givePermissionTo('manage id card');
        }

        $this->command->info('ID Card permissions seeded successfully.');
    }
}
