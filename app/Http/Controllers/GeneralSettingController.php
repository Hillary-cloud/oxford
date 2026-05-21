<?php

namespace App\Http\Controllers;

use App\Models\GeneralSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class GeneralSettingController extends Controller
{
    /**
     * Display the settings page.
     */
    public function index()
    {
        return Inertia::render('GeneralSettings/Index', [
            'settings' => [
                'school_identity' => GeneralSetting::get('school_identity'),
                'theme_colors' => GeneralSetting::get('theme_colors'),
                'photo_upload_access_code' => GeneralSetting::get('photo_upload_access_code'),
                'system_lockdown' => GeneralSetting::get('system_lockdown', false),
                'staff_attendance_config' => GeneralSetting::get('staff_attendance_config', [
                    'late_time' => '08:30',
                    'grace_period_minutes' => 0
                ]),
            ]
        ]);
    }

    /**
     * Update settings.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:identity,theming,reset_theme,security',
            'school_name' => 'nullable|string|max:255',
            'school_code' => 'nullable|string|max:10',
            'school_motto' => 'nullable|string|max:255',
            'school_address' => 'nullable|string|max:255',
            'school_email' => 'nullable|string|email|max:255',
            'school_phone' => 'nullable|string|max:20',
            'current_registration_year' => 'nullable|integer|min:2000|max:2099',
            'logo' => 'nullable|image|max:2048',
            'colors' => 'nullable|required_if:type,theming|array',
            'photo_upload_access_code' => 'nullable|required_if:type,security|string|min:4|max:20',
            'system_lockdown' => 'nullable|boolean',
            'late_time' => 'nullable|required_if:type,attendance|string',
            'grace_period_minutes' => 'nullable|required_if:type,attendance|integer|min:0|max:120',
        ]);

        if ($validated['type'] === 'reset_theme') {
            GeneralSetting::set('theme_colors', [
                'primary' => '#6366f1',
                'secondary' => '#ec4899',
                'background' => '#e5e7eb',
                'sidebar' => '#1e293b',
                'text' => '#0f172a',
                'button' => '#4f46e5',
                'result_primary' => '#1e3a8a',
                'result_secondary' => '#6366f1',
            ]);
            return redirect()->back()->with('success', 'Theme reset to defaults.');
        }

        if ($validated['type'] === 'identity') {
            $identity = GeneralSetting::get('school_identity') ?? [];
            
            $identity['school_name'] = $validated['school_name'];
            $identity['school_code'] = strtoupper($validated['school_code']);
            $identity['school_motto'] = $validated['school_motto'] ?? ($identity['school_motto'] ?? '');
            $identity['school_address'] = $validated['school_address'] ?? ($identity['school_address'] ?? '');
            $identity['school_email'] = $validated['school_email'] ?? ($identity['school_email'] ?? '');
            $identity['school_phone'] = $validated['school_phone'] ?? ($identity['school_phone'] ?? '');
            $identity['current_registration_year'] = $validated['current_registration_year'];

            if ($request->hasFile('logo')) {
                // Delete old logo if exists
                if (!empty($identity['logo'])) {
                    Storage::disk('public')->delete($identity['logo']);
                }
                $identity['logo'] = $request->file('logo')->store('school/logo', 'public');
            }

            GeneralSetting::set('school_identity', $identity);
            
            return redirect()->back()->with('success', 'School identity updated successfully.');
        }

        if ($validated['type'] === 'theming') {
            // Validate hex codes
            // We can add stricter validation later if needed
            GeneralSetting::set('theme_colors', $validated['colors']);
            return redirect()->back()->with('success', 'Theme colors updated successfully.');
        }

        if ($validated['type'] === 'security') {
            if ($request->has('photo_upload_access_code')) {
                GeneralSetting::set('photo_upload_access_code', $validated['photo_upload_access_code']);
            }
            if ($request->has('system_lockdown')) {
                GeneralSetting::set('system_lockdown', filter_var($validated['system_lockdown'], FILTER_VALIDATE_BOOLEAN));
            }
            return redirect()->back()->with('success', 'Security settings updated successfully.');
        }

        if ($validated['type'] === 'attendance') {
            GeneralSetting::set('staff_attendance_config', [
                'late_time' => $validated['late_time'],
                'grace_period_minutes' => (int) $validated['grace_period_minutes'],
            ]);
            return redirect()->back()->with('success', 'Staff attendance settings updated successfully.');
        }

        return redirect()->back()->with('error', 'Invalid setting type.');
    }
}
