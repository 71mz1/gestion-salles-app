<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pc;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PcController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Pc::with('salle');

        if ($request->has('salle_id')) {
            $query->where('salle_id', $request->salle_id);
        }

        return response()->json($query->get()->map(fn($p) => $this->format($p)));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'num_poste'            => 'required|string|max:50',
            'salle_id'             => 'required|exists:salles,id',
            'processeur'           => 'nullable|string|max:200',
            'ram'                  => 'nullable|string|max:50',
            'disque_dur'           => 'nullable|string|max:100',
            'systeme_exploitation' => 'nullable|string|max:100',
            'etat'                 => 'sometimes|in:fonctionnel,en_panne,en_maintenance',
        ]);

        $pc = Pc::create($data);

        return response()->json($this->format($pc->load('salle')), 201);
    }

    public function show(int $id): JsonResponse
    {
        $pc = Pc::with('salle')->findOrFail($id);

        return response()->json($this->format($pc));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $pc = Pc::findOrFail($id);

        $data = $request->validate([
            'num_poste'            => 'sometimes|string|max:50',
            'salle_id'             => 'sometimes|exists:salles,id',
            'processeur'           => 'nullable|string|max:200',
            'ram'                  => 'nullable|string|max:50',
            'disque_dur'           => 'nullable|string|max:100',
            'systeme_exploitation' => 'nullable|string|max:100',
            'etat'                 => 'sometimes|in:fonctionnel,en_panne,en_maintenance',
        ]);

        $pc->update($data);

        return response()->json($this->format($pc->load('salle')));
    }

    public function destroy(int $id): JsonResponse
    {
        Pc::findOrFail($id)->delete();

        return response()->json(['message' => 'PC supprimé.']);
    }

    private function format(Pc $pc): array
    {
        return [
            'id'                   => $pc->id,
            'num_poste'            => $pc->num_poste,
            'salle_id'             => $pc->salle_id,
            'salle'                => $pc->salle ? [
                'id'         => $pc->salle->id,
                'nom_salle'  => $pc->salle->nom_salle,
                'code_salle' => $pc->salle->code_salle,
            ] : null,
            'processeur'           => $pc->processeur,
            'ram'                  => $pc->ram,
            'disque_dur'           => $pc->disque_dur,
            'systeme_exploitation' => $pc->systeme_exploitation,
            'etat'                 => $pc->etat,
            'created_at'           => $pc->created_at,
        ];
    }
}
