<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\Permission;
use App\Models\Role;

return new class extends Migration
{
    public function up(): void
    {
        $guard = 'web';

        $permissions = [
            'view fees',
            'manage fees',
            'record payment',
            'generate fee report',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => $guard]);
        }

        // Give Super Admin all fee permissions
        $superAdmin = Role::where('name', 'Super Admin')->first();
        if ($superAdmin) {
            $superAdmin->givePermissionTo($permissions);
        }

        // Give Admin view + record
        $admin = Role::where('name', 'Admin')->first();
        if ($admin) {
            $admin->givePermissionTo(['view fees', 'record payment', 'generate fee report']);
        }
    }

    public function down(): void
    {
        $permissions = ['view fees', 'manage fees', 'record payment', 'generate fee report'];
        foreach ($permissions as $perm) {
            Permission::where('name', $perm)->delete();
        }
    }
};
