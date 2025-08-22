<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminLevelAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Super admins can access everything
        if ($user->role === 'super_admin') {
            return $next($request);
        }

        // Level admins can only access resources in their level
        if ($user->role === 'level_admin') {
            // Add level_id to request for filtering
            $request->merge(['admin_level_id' => $user->level_id]);
            return $next($request);
        }

        // Regular admins (backward compatibility)
        if ($user->role === 'admin') {
            return $next($request);
        }

        return response()->json(['error' => 'Insufficient privileges'], 403);
    }
}
