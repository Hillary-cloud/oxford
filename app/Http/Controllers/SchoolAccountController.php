<?php

namespace App\Http\Controllers;

use App\Models\SchoolAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SchoolAccountController extends Controller
{
    public function index()
    {
        $accounts = SchoolAccount::orderBy('name')->get();

        return Inertia::render('Fees/Accounts/Index', [
            'accounts' => $accounts,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'account_number' => 'nullable|string|max:50',
            'bank_name'      => 'nullable|string|max:255',
            'account_type'   => 'required|in:bank,pos,cash',
            'description'    => 'nullable|string',
            'is_active'      => 'boolean',
        ]);

        SchoolAccount::create($data);

        return back()->with('success', 'Account added successfully.');
    }

    public function update(Request $request, SchoolAccount $account)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'account_number' => 'nullable|string|max:50',
            'bank_name'      => 'nullable|string|max:255',
            'account_type'   => 'required|in:bank,pos,cash',
            'description'    => 'nullable|string',
            'is_active'      => 'boolean',
        ]);

        $account->update($data);

        return back()->with('success', 'Account updated successfully.');
    }

    public function destroy(SchoolAccount $account)
    {
        $account->update(['is_active' => !$account->is_active]);
        $status = $account->is_active ? 'activated' : 'deactivated';
        return back()->with('success', "Account {$status} successfully.");
    }
}
