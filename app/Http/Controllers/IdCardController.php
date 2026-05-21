<?php

namespace App\Http\Controllers;

use App\Models\GeneralSetting;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IdCardController extends Controller
{
    /**
     * Display the ID Card dashboard.
     */
    public function index(Request $request)
    {
        $classes = SchoolClass::orderBy('level')->orderBy('name')->get();
        // Load settings
        $config = GeneralSetting::get('id_card_config') ?? [];
        $sessions = \App\Models\AcademicSession::orderBy('name', 'desc')->get();

        // Determine active tab request
        $students = [];
        $staff = [];
        
        if ($request->tab === 'students') {
            $query = Student::with(['classSection.schoolClass', 'classSection.classArm', 'classSection'])
                ->whereIn('status', ['active']);
                
            if ($request->class_id) {
                // Filter by class - via classSection.schoolClass relationship
                $query->whereHas('classSection.schoolClass', function($q) use ($request) {
                    $q->where('id', $request->class_id);
                });
            }
            
            $students = $query->orderBy('surname')->paginate(50)->withQueryString();
        }

        if ($request->tab === 'staff') {
            // Fetch users who are not students/parents, essentially staff
            // Adjust role checks based on your specific roles
            $staff = User::whereDoesntHave('roles', function($q) {
                $q->whereIn('name', ['Student', 'Parent', 'Super Admin']);
            })->orderBy('name')->paginate(50)->withQueryString();
        }

        return Inertia::render('IdCards/Index', [
            'classes' => $classes,
            'sessions' => $sessions,
            'students' => $request->tab === 'students' ? $students : [],
            'staff' => $request->tab === 'staff' ? $staff : [],
            'idConfig' => $config,
            'filters' => $request->only(['class_id', 'tab']),
            'school' => GeneralSetting::get('school_identity')
        ]);
    }

    /**
     * Store ID Card settings (expirations).
     */
    public function storeSettings(Request $request)
    {
        $validated = $request->validate([
            'expirations' => 'nullable|array', // keyed by class_id, but now maybe wrapped by session?
            // Actually, frontend will send structure: expirations[session_id][class_id] = date
            // The validation 'nullable|array' allows flexible structure, or we can use keys
        ]);

        $currentConfig = GeneralSetting::get('id_card_config') ?? [];
        
        // Merge new settings with existing
        $newConfig = array_merge($currentConfig, $validated);

        GeneralSetting::set('id_card_config', $newConfig);

        return back()->with('success', 'ID Card configuration saved successfully.');
    }

    /**
     * Display the Public Verification Page.
     */
    public function verify($uuid) 
    {
        $student = Student::with(['classSection.schoolClass', 'classSection.classArm'])->find($uuid);
        
        if ($student) {
            return Inertia::render('IdCards/Verify', [
                'record' => $student,
                'type' => 'student',
                'school' => GeneralSetting::get('school_identity')
            ]);
        }

        $staff = User::find($uuid);
        
        if ($staff) {
             return Inertia::render('IdCards/Verify', [
                'record' => $staff,
                'type' => 'staff',
                'school' => GeneralSetting::get('school_identity')
            ]);
        }
        
        abort(404, 'ID Card record not found.');
    }
}
