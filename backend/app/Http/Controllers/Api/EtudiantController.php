<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Etudiant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EtudiantController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Etudiant::with('niveau')->get()->map(fn($e) => [
            'id'      => $e->id,
            'nom'     => $e->nom,
            'prenom'  => $e->prenom,
            'niveau'  => $e->niveau,
        ]));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nom'       => 'required|string|max:100',
            'prenom'    => 'required|string|max:100',
            'niveau_id' => 'required|exists:niveaux,id',
        ]);

        return response()->json(Etudiant::create($data)->load('niveau'), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $etudiant = Etudiant::findOrFail($id);

        $data = $request->validate([
            'nom'       => 'sometimes|string|max:100',
            'prenom'    => 'sometimes|string|max:100',
            'niveau_id' => 'sometimes|exists:niveaux,id',
        ]);

        $etudiant->update($data);

        return response()->json($etudiant->load('niveau'));
    }

    public function destroy(int $id): JsonResponse
    {
        Etudiant::findOrFail($id)->delete();

        return response()->json(['message' => 'Étudiant supprimé.']);
    }
}
