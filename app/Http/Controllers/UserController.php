<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Spatie\Permission\Models\Role;

use App\Services\IdGeneratorService;

class UserController extends Controller
{
    protected $idGenerator;

    public function __construct(IdGeneratorService $idGenerator)
    {
        $this->idGenerator = $idGenerator;
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::with('roles')
            ->whereDoesntHave('roles', function ($query) {
                $query->where('name', 'Super Admin');
            })
            ->latest()
            ->paginate(50);
        
        // The original request had a malformed snippet.
        // If the intent was to ensure uniqueness of users by ID after fetching,
        // it would typically be applied to the collection items if duplicates were possible
        // after pagination, or using distinct() on the query builder.
        // The provided snippet `->select('class_sections.*')->get()->unique('id')->values();paginate(50);`
        // was syntactically incorrect and would break pagination.
        // Assuming the primary goal is a paginated list of unique users,
        // and given that User::paginate() typically returns unique users by default,
        // no change is applied here to avoid breaking the existing functionality.
        // If specific uniqueness logic is needed, it should be clarified.
        
        return \Inertia\Inertia::render('Users/Index', [
            'users' => $users,
            'roles' => Role::where('name', '!=', 'Super Admin')->get()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $roles = Role::where('name', '!=', 'Super Admin')->get();
        return \Inertia\Inertia::render('Users/Create', [
            'roles' => $roles
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'profile_image' => ['nullable', 'image', 'max:2048'],
            'name' => ['required', 'string', 'max:255'],
            // 'staff_id' => ['required', 'string', 'max:255', 'unique:users'], // Auto-generated
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', Rules\Password::defaults()],
            'address' => ['required', 'string'],
            'qualification' => ['nullable', 'string'],
            'date_of_birth' => ['required', 'date'],
            'employment_date' => ['required', 'date'],
            'employment_type' => ['required', 'in:full time,contract,part time'],
            'next_of_kin' => ['nullable', 'string'],
            'next_of_kin_phone' => ['nullable', 'string'],
        ]);

        $imagePath = null;
        if ($request->hasFile('profile_image')) {
            $imagePath = $request->file('profile_image')->store('profile_images', 'public');
        }

        $user = User::create([
            'profile_image' => $imagePath,
            'name' => $request->name,
            'staff_id' => $this->idGenerator->generateStaffId(),
            'phone' => $request->phone,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'address' => $request->address,
            'qualification' => $request->qualification,
            'date_of_birth' => $request->date_of_birth,
            'employment_date' => $request->employment_date,
            'employment_type' => $request->employment_type,
            'next_of_kin' => $request->next_of_kin,
            'next_of_kin_phone' => $request->next_of_kin_phone,
        ]);

        // Automatically set role to 'Teacher'
        $user->assignRole('Teacher');

        return redirect()->route('users.index')->with('success', 'User created successfully.');
    }

    /**
     * Assign role to a user.
     */
    public function assignRole(Request $request, string $id)
    {
        $request->validate([
            'role' => ['required', 'exists:roles,name'],
        ]);

        // Prevent assigning Super Admin role
        if ($request->role === 'Super Admin') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot assign Super Admin role.'
            ], 403);
        }

        $user = User::findOrFail($id);
        $user->syncRoles([$request->role]);

        return redirect()->back()->with('success', 'Role assigned successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = User::with('roles')->findOrFail($id);
        return \Inertia\Inertia::render('Users/Show', [
            'user' => $user
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $user = User::with('roles')->findOrFail($id);
        $roles = Role::where('name', '!=', 'Super Admin')->get()->unique('id')->values();
        return \Inertia\Inertia::render('Users/Edit', [
            'user' => $user,
            'roles' => $roles
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'profile_image' => ['nullable', 'image', 'max:2048'],
            'name' => ['required', 'string', 'max:255'],
            'staff_id' => ['required', 'string', 'max:255', 'unique:users,staff_id,'.$user->id],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'password' => ['nullable', Rules\Password::defaults()],
            'address' => ['required', 'string'],
            'qualification' => ['nullable', 'string'],
            'date_of_birth' => ['required', 'date'],
            'employment_date' => ['required', 'date'],
            'employment_type' => ['required', 'in:full time,contract,part time'],
            'next_of_kin' => ['nullable', 'string'],
            'next_of_kin_phone' => ['nullable', 'string'],
            'role' => ['required', 'exists:roles,name'],
        ]);

        $data = [
            'name' => $request->name,
            'staff_id' => $request->staff_id,
            'phone' => $request->phone,
            'email' => $request->email,
            'address' => $request->address,
            'qualification' => $request->qualification,
            'date_of_birth' => $request->date_of_birth,
            'employment_date' => $request->employment_date,
            'employment_type' => $request->employment_type,
            'next_of_kin' => $request->next_of_kin,
            'next_of_kin_phone' => $request->next_of_kin_phone,
        ];

        if ($request->password) {
            $data['password'] = Hash::make($request->password);
        }

        if ($request->hasFile('profile_image')) {
            // Optional: delete old image
            $data['profile_image'] = $request->file('profile_image')->store('profile_images', 'public');
        }

        $user->update($data);

        $user->syncRoles([$request->role]);

        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }

    /**
     * Toggle user status (active/inactive).
     */
    public function toggleStatus(Request $request, string $id)
    {
        if (!auth()->user()->hasRole('Super Admin')) {
            return redirect()->back()->with('error', 'You cannot change user status.');
        }

        $user = User::findOrFail($id);
        $newStatus = $user->status === 'active' ? 'inactive' : 'active';
        $user->update(['status' => $newStatus]);

        return redirect()->back()->with('success', "User status updated to {$newStatus}.");
    }

    /**
     * Bulk update user status.
     */
    public function bulkUpdateStatus(Request $request)
    {
        if (!auth()->user()->hasRole('Super Admin')) {
            return redirect()->back()->with('error', 'You cannot update user statuses.');
        }

        $request->validate([
            'user_ids' => ['required', 'array'],
            'user_ids.*' => ['exists:users,id'],
            'status' => ['required', 'in:active,inactive'],
        ]);

        User::whereIn('id', $request->user_ids)->update(['status' => $request->status]);

        return redirect()->back()->with('success', count($request->user_ids) . ' user(s) status updated to ' . $request->status . '.');
    }

    /**
     * Bulk delete users.
     */
    public function bulkDelete(Request $request)
    {
        if (!auth()->user()->hasRole('Super Admin')) {
            return redirect()->back()->with('error', 'Only Super Admin can perform bulk deletions.');
        }

        $request->validate([
            'user_ids' => ['required', 'array'],
            'user_ids.*' => ['exists:users,id'],
        ]);

        User::whereIn('id', $request->user_ids)->delete();

        return redirect()->back()->with('success', count($request->user_ids) . ' user(s) deleted successfully.');
    }
}
