<?php

namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Models\User;

class JwtService
{
    private string $secret;
    private string $algo = 'HS256';
    private int $ttl = 3600; // 1 hour in seconds

    public function __construct()
    {
        $this->secret = env('JWT_SECRET', 'fallback_secret');
    }

    public function encode(User $user): string
    {
        $now = time();
        $payload = [
            'iss' => env('APP_URL'),
            'sub' => $user->id,
            'iat' => $now,
            'exp' => $now + $this->ttl,
            'role' => $user->role,
            'email' => $user->email,
        ];

        return JWT::encode($payload, $this->secret, $this->algo);
    }

    public function decode(string $token): object
    {
        return JWT::decode($token, new Key($this->secret, $this->algo));
    }

    public function getUserFromToken(string $token): ?User
    {
        try {
            $payload = $this->decode($token);
            return User::find($payload->sub);
        } catch (\Exception $e) {
            return null;
        }
    }
}
