<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Professeur;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfesseurController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Professeur::all()->map(fn($p) => $this->format($p)));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nom'     => 'required|string|max:100',
            'prenom'  => 'required|string|max:100',
            'email'   => 'required|email|unique:professeurs,email',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $prof = Professeur::create($data);

        return response()->json($this->format($prof), 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json($this->format(Professeur::findOrFail($id)));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $prof = Professeur::findOrFail($id);

        $data = $request->validate([
            'nom'     => 'sometimes|string|max:100',
            'prenom'  => 'sometimes|string|max:100',
            'email'   => 'sometimes|email|unique:professeurs,email,' . $id,
            'user_id' => 'nullable|exists:users,id',
        ]);

        $prof->update($data);

        return response()->json($this->format($prof));
    }

    public function destroy(int $id): JsonResponse
    {
        Professeur::findOrFail($id)->delete();

        return response()->json(['message' => 'Professeur supprimé.']);
    }

    private function format(Professeur $prof): array
    {
        return [
            'id'         => $prof->id,
            'nom'        => $prof->nom,
            'prenom'     => $prof->prenom,
            'email'      => $prof->email,
            'user_id'    => $prof->user_id,
            'created_at' => $prof->created_at,
        ];
    }
}
