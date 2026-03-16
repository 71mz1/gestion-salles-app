<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::all()->map(fn($u) => $this->format($u));

        return response()->json($users);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nom'      => 'required|string|max:100',
            'prenom'   => 'required|string|max:100',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role'     => 'required|in:professeur,technicien,administrateur',
        ]);

        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);

        return response()->json($this->format($user), 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json($this->format(User::findOrFail($id)));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'nom'      => 'sometimes|string|max:100',
            'prenom'   => 'sometimes|string|max:100',
            'email'    => 'sometimes|email|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:6',
            'role'     => 'sometimes|in:professeur,technicien,administrateur',
        ]);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return response()->json($this->format($user));
    }

    public function destroy(int $id): JsonResponse
    {
        User::findOrFail($id)->delete();

        return response()->json(['message' => 'Utilisateur supprimé.']);
    }

    private function format(User $user): array
    {
        return [
            'id'         => $user->id,
            'nom'        => $user->nom,
            'prenom'     => $user->prenom,
            'email'      => $user->email,
            'role'       => $user->role,
            'created_at' => $user->created_at,
        ];
    }
}
