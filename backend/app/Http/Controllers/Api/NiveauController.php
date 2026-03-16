<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Niveau;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NiveauController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Niveau::all());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'semestre' => 'required|string|max:50',
            'filiere'  => 'required|string|max:100',
        ]);

        return response()->json(Niveau::create($data), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $niveau = Niveau::findOrFail($id);

        $data = $request->validate([
            'semestre' => 'sometimes|string|max:50',
            'filiere'  => 'sometimes|string|max:100',
        ]);

        $niveau->update($data);

        return response()->json($niveau);
    }

    public function destroy(int $id): JsonResponse
    {
        Niveau::findOrFail($id)->delete();

        return response()->json(['message' => 'Niveau supprimé.']);
    }
}
