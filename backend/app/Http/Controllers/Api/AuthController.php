<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\JwtService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    private JwtService $jwt;

    public function __construct(JwtService $jwt)
    {
        $this->jwt = $jwt;
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Identifiants incorrects.'], 401);
        }

        $token = $this->jwt->encode($user);

        return response()->json([
            'token' => $token,
            'type'  => 'Bearer',
            'user'  => [
                'id'     => $user->id,
                'nom'    => $user->nom,
                'prenom' => $user->prenom,
                'email'  => $user->email,
                'role'   => $user->role,
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->attributes->get('auth_user');

        return response()->json([
            'id'     => $user->id,
            'nom'    => $user->nom,
            'prenom' => $user->prenom,
            'email'  => $user->email,
            'role'   => $user->role,
        ]);
    }

    public function logout(): JsonResponse
    {
        return response()->json(['message' => 'Déconnexion réussie.']);
    }
}
