<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;

class CbtLoginController extends Controller
{
    public function showLoginForm()
    {
        if (session('student_id')) {
            return redirect()->route('student.cbt.index');
        }
        return Inertia::render('Cbt/Student/Login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'admission_number' => 'required|string',
            'surname' => 'required|string',
        ]);

        // Find student by admission number (registration_number)
        $student = Student::where('registration_number', $request->admission_number)->first();

        // Check if student exists and surname matches (case-insensitive)
        if (! $student || strtolower($student->surname) !== strtolower($request->surname)) {
            throw ValidationException::withMessages([
                'admission_number' => ['The provided credentials do not match our records.'],
            ]);
        }
        
        // Store student ID in session
        $request->session()->put('student_id', $student->id);

        return redirect()->route('student.cbt.index');
    }

    public function logout(Request $request)
    {
        $request->session()->forget('student_id');

        return redirect()->route('cbt.login');
    }
}
