<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;
use App\Models\User;

class RoleSeeder extends Seeder
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
            'create student',
            'view student',
            'manage student',
            'create subject',
            'view subject',
            'manage subject',
            'create user',
            'view user',
            'manage user',
            'manage result pins',
            'manage id card',
            'manage cbt',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create Roles
        $superAdminRole = Role::firstOrCreate(['name' => 'Super Admin']);
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $teacherRole = Role::firstOrCreate(['name' => 'Teacher']);

        $superAdminRole->givePermissionTo($permissions);
        $adminRole->givePermissionTo($permissions);
        
        // Assign CBT permissions to Teacher
        $teacherRole->givePermissionTo(['manage cbt']);

        // Assign Super Admin to the first user (Test User)
        $user = User::where('email', 'test@example.com')->first();
        if ($user) {
            $user->assignRole($superAdminRole);
        }
    }
}
