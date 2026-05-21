<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\GeneralSetting;
use Illuminate\Support\Facades\Auth;

class CheckSystemLockdown
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip for specific routes if needed, e.g., logout to prevent loops, though logout is POST.
        // But if they are logged out, Auth::check() is false, so it's fine.
        
        // Retrieve setting. Default to false (not locked).
        $isLocked = GeneralSetting::get('system_lockdown', false);

        if ($isLocked && Auth::check()) {
            $user = Auth::user();
            
            // Allow Super Admin to bypass
            if (!$user->hasRole('Super Admin')) {
                // Force logout
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                // Redirect to login with error
                return redirect()->route('login')->withErrors([
                    'login' => 'System is currently in Maintenance Mode.',
                ]);
            }
        }

        return $next($request);
    }
}
