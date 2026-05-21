<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;
use App\Models\Role;

class ResultPermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'view results',
            'manage results',
            'manage result pins',
            'view result analysis',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $superAdmin = Role::where('name', 'Super Admin')->first();
        $admin = Role::where('name', 'Admin')->first();
        $teacher = Role::where('name', 'Teacher')->first();

        if ($superAdmin) $superAdmin->givePermissionTo($permissions);
        if ($admin) $admin->givePermissionTo($permissions);
        
        // Teachers can view and manage results
        if ($teacher) {
            $teacher->givePermissionTo(['view results', 'manage results']);
        }
    }
}
