<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\GeneralSetting;
use App\Models\Student;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Session;

class PhotoCaptureController extends Controller
{
    /**
     * Show login page for portal.
     */
    public function login()
    {
        // If already authorized, redirect to capture
        if (session('photo_portal_access')) {
            return redirect()->route('portal.capture');
        }

        return Inertia::render('Portal/Login', [
            'school_name' => GeneralSetting::get('school_identity')['school_name'] ?? 'School Portal'
        ]);
    }

    /**
     * Authenticate access code.
     */
    public function authenticate(Request $request)
    {
        $request->validate([
            'access_code' => 'required|string',
        ]);

        $settingCode = GeneralSetting::get('photo_upload_access_code');

        if (!$settingCode || $request->access_code !== $settingCode) {
            return back()->withErrors(['access_code' => 'Invalid access code.']);
        }

        // Set session flag
        session(['photo_portal_access' => true]);

        return redirect()->route('portal.capture');
    }

    /**
     * Show capture interface.
     */
    public function index()
    {
        // Check session
        if (!session('photo_portal_access')) {
            return redirect()->route('portal.login');
        }

        return Inertia::render('Portal/Capture', [
            'school_name' => GeneralSetting::get('school_identity')['school_name'] ?? 'School Portal'
        ]);
    }

    /**
     * Search for student.
     */
    public function search(Request $request)
    {
        if (!session('photo_portal_access')) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $query = $request->input('query');
        
        if (empty($query) || strlen($query) < 2) {
            return response()->json([]);
        }

        $students = Student::with(['classSection.schoolClass', 'classSection.classArm'])
            ->where('surname', 'like', "%{$query}%")
            ->orWhere('othername', 'like', "%{$query}%")
            ->orWhere('registration_number', 'like', "%{$query}%")
            ->limit(10)
            ->get();

        return response()->json($students);
    }

    /**
     * Upload photo for student.
     */
    public function upload(Request $request)
    {
        if (!session('photo_portal_access')) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'student_id' => 'required|exists:students,id',
            'photo' => 'required|image|max:2048', // Max 2MB, though client should compress
        ]);

        $student = Student::findOrFail($request->student_id);

        try {
            // Delete old photo if exists
            if ($student->profile_picture) {
                Storage::disk('public')->delete($student->profile_picture);
            }

            // Store new photo
            $path = $request->file('photo')->store('students/profiles', 'public');
            
            $student->update(['profile_picture' => $path]);

            return response()->json(['success' => true, 'path' => $path]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Upload failed'], 500);
        }
    }
    
    /**
     * Logout from portal.
     */
    public function logout()
    {
        session()->forget('photo_portal_access');
        return redirect()->route('portal.login');
    }
}
