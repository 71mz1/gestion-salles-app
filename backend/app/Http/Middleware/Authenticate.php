<?php

namespace App\Http\Middleware;

use App\Services\JwtService;
use Closure;
use Illuminate\Http\Request;

class Authenticate
{
    public function __construct(private JwtService $jwt) {}

    public function handle(Request $request, Closure $next)
    {
        $header = $request->header('Authorization');

        if (!$header || strpos($header, 'Bearer ') !== 0) {
            return response()->json(['message' => 'Token manquant.'], 401);
        }

        $token = substr($header, 7);
        $user = $this->jwt->getUserFromToken($token);

        if (!$user) {
            return response()->json(['message' => 'Token invalide ou expiré.'], 401);
        }

        $request->attributes->set('auth_user', $user);

        return $next($request);
    }
}
