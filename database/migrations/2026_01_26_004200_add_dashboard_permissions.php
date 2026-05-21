<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'view dashboard stats',
            'view dashboard charts',
            'view activity log'
        ];

        foreach ($permissions as $permission) {
            \App\Models\Permission::firstOrCreate(['name' => $permission]);
        }

        // Assign to Super Admin
        $role = \App\Models\Role::where('name', 'Super Admin')->first();
        if ($role) {
            $role->givePermissionTo($permissions);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $permissions = [
            'view dashboard stats',
            'view dashboard charts',
            'view activity log'
        ];

        foreach ($permissions as $permission) {
            $p = \App\Models\Permission::where('name', $permission)->first();
            if ($p) {
                $p->delete();
            }
        }
    }
};
