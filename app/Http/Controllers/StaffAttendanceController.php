<?php

namespace App\Http\Controllers;

use App\Models\StaffAttendance;
use App\Models\User;
use App\Models\GeneralSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Crypt;
use Carbon\Carbon;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class StaffAttendanceController extends Controller
{
    /**
     * Display the QR Monitor for Admins.
     */
    public function monitor()
    {
        return Inertia::render('StaffAttendance/Monitor');
    }

    /**
     * Generate a dynamic signed token for the QR code.
     */
    public function generateToken()
    {
        Gate::authorize('view staff attendance monitor');

        // Generate a signed URL that expires in 60 minutes (buffer for offline sync)
        $url = URL::temporarySignedRoute(
            'staff-attendance.clock-in-out',
            now()->addMinutes(60),
            ['id' => uniqid()]
        );

        return response()->json(['token' => $url]);
    }

    /**
     * Display the Scanner for Teachers.
     */
    public function scan()
    {
        return Inertia::render('StaffAttendance/Scan');
    }

    /**
     * Process the clock-in/out request.
     */
    public function clockInOut(Request $request)
    {
        if (!$request->hasValidSignature()) {
            return inertia('StaffAttendance/Scan', [
                'error' => 'The QR code has expired or is invalid. Please scan a fresh one.'
            ]);
        }

        $user = auth()->user();
        if (!$user) {
            return redirect()->route('login');
        }

        $today = Carbon::today();
        $now = Carbon::now();
        $deviceId = $request->input('device_id');

        // Security: Device Binding
        // Find any existing attendance for this user to check device consistency
        $lastAttendanceWithDevice = StaffAttendance::where('user_id', $user->id)
            ->whereNotNull('device_id')
            ->latest()
            ->first();

        if ($lastAttendanceWithDevice && $lastAttendanceWithDevice->device_id !== $deviceId) {
            return inertia('StaffAttendance/Scan', [
                'error' => 'Unauthorized device. Please use your registered phone.'
            ]);
        }

        // Check if attendance already recorded today
        $attendance = StaffAttendance::firstOrNew([
            'user_id' => $user->id,
            'date' => $today,
        ]);

        if (!$attendance->exists) {
            // First time today: Clock IN
            $attendance->clock_in = $now->toTimeString();
            $attendance->device_id = $deviceId;
            
            // Dynamic Lateness Logic
            $config = GeneralSetting::get('staff_attendance_config', [
                'late_time' => '08:30',
                'grace_period_minutes' => 0
            ]);

            $lateThreshold = Carbon::createFromTimeString($config['late_time']);
            if ($config['grace_period_minutes'] > 0) {
                $lateThreshold->addMinutes($config['grace_period_minutes']);
            }

            $attendance->status = $now->gt($lateThreshold) ? 'late' : 'present';
            
            $attendance->save();

            return redirect()->route('dashboard')->with('success', "Good morning, {$user->name}. You have clocked in at {$now->format('h:i A')}.");
        } 
        
        if ($attendance->clock_out) {
            return inertia('StaffAttendance/Scan', [
                'info' => "You have already clocked out for today at " . Carbon::parse($attendance->clock_out)->format('h:i A') . "."
            ]);
        }

        // Second time today: Clock OUT
        $attendance->clock_out = $now->toTimeString();
        $attendance->save();

        return redirect()->route('dashboard')->with('success', "Goodbye, {$user->name}. You have clocked out at {$now->format('h:i A')}.");
    }

    /**
     * Admin view for staff attendance logs.
     */
    public function index(Request $request)
    {
        $query = StaffAttendance::with('user');

        // Filter by Staff Name or ID
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('staff_id', 'like', "%{$search}%");
            });
        }

        // Filter by Specific Date
        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        // Filter by Month
        if ($request->filled('month')) {
            $monthDate = Carbon::parse($request->month);
            $query->whereMonth('date', $monthDate->month)
                  ->whereYear('date', $monthDate->year);
        }

        $attendances = $query->orderBy('date', 'desc')
            ->orderBy('clock_in', 'desc')
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('StaffAttendance/Index', [
            'attendances' => $attendances,
            'filters' => $request->only(['search', 'date', 'month'])
        ]);
    }
}
