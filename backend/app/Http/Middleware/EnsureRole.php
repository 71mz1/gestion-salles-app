<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles)
    {
        $user = $request->attributes->get('auth_user');

        if (!$user || !in_array($user->role, $roles)) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        return $next($request);
    }
}
