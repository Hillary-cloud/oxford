<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;
use App\Models\Role;

class AttendancePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create the permission
        $permission = Permission::firstOrCreate(['name' => 'take attendance']);

        // Assign to Super Admin
        $superAdmin = Role::firstOrCreate(['name' => 'Super Admin']);
        if (!$superAdmin->hasPermissionTo('take attendance')) {
            $superAdmin->givePermissionTo('take attendance');
        }
        
        // Assign to Admin
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        if (!$adminRole->hasPermissionTo('take attendance')) {
            $adminRole->givePermissionTo('take attendance');
        }

        // Assign to Teacher
        $teacherRole = Role::firstOrCreate(['name' => 'Teacher']);
        if (!$teacherRole->hasPermissionTo('take attendance')) {
            $teacherRole->givePermissionTo('take attendance');
        }

        $this->command->info('Attendance permissions seeded successfully.');
    }
}
