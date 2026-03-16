<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Salle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SalleController extends Controller
{
    public function index(): JsonResponse
    {
        $salles = Salle::withCount('pcs')
            ->get()
            ->map(fn($s) => $this->format($s));

        return response()->json($salles);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nom_salle'  => 'required|string|max:200',
            'code_salle' => 'required|string|max:20|unique:salles,code_salle',
            'capacite'   => 'required|integer|min:0',
            'nb_postes'  => 'sometimes|integer|min:0',
        ]);

        $salle = Salle::create($data);

        return response()->json($this->format($salle->loadCount('pcs')), 201);
    }

    public function show(int $id): JsonResponse
    {
        $salle = Salle::withCount('pcs')->findOrFail($id);

        return response()->json($this->format($salle));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $salle = Salle::findOrFail($id);

        $data = $request->validate([
            'nom_salle'  => 'sometimes|string|max:200',
            'code_salle' => 'sometimes|string|max:20|unique:salles,code_salle,' . $id,
            'capacite'   => 'sometimes|integer|min:0',
            'nb_postes'  => 'sometimes|integer|min:0',
        ]);

        $salle->update($data);

        return response()->json($this->format($salle->loadCount('pcs')));
    }

    public function destroy(int $id): JsonResponse
    {
        Salle::findOrFail($id)->delete();

        return response()->json(['message' => 'Salle supprimée.']);
    }

    private function format(Salle $salle): array
    {
        return [
            'id'         => $salle->id,
            'nom_salle'  => $salle->nom_salle,
            'code_salle' => $salle->code_salle,
            'capacite'   => $salle->capacite,
            'nb_postes'  => $salle->nb_postes,
            'pcs_count'  => $salle->pcs_count ?? 0,
            'created_at' => $salle->created_at,
        ];
    }
}
