<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Panne;
use App\Models\Pc;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PanneController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Panne::with(['pc.salle', 'professeur']);

        if ($request->has('statue')) {
            $query->where('statue', $request->statue);
        }

        $pannes = $query->orderByDesc('date_panne')->get()->map(fn($p) => $this->format($p));

        return response()->json($pannes);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'descr_panne' => 'required|string',
            'date_panne'  => 'required|date',
            'pc_id'       => 'required|exists:pcs,id',
            'prof_id'     => 'required|exists:professeurs,id',
            'photo'       => 'nullable|string',
        ]);

        $panne = Panne::create(array_merge($data, ['statue' => 'en_attente']));

        $panne->pc->update(['etat' => 'en_panne']);

        return response()->json($this->format($panne->load(['pc.salle', 'professeur'])), 201);
    }

    public function show(int $id): JsonResponse
    {
        $panne = Panne::with(['pc.salle', 'professeur'])->findOrFail($id);

        return response()->json($this->format($panne));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $panne = Panne::findOrFail($id);

        $data = $request->validate([
            'statue'           => 'sometimes|in:en_attente,en_cours,resolue',
            'descr_reparation' => 'nullable|string',
            'date_reparation'  => 'nullable|date',
            'photo_reparation' => 'nullable|string',
        ]);

        $panne->update($data);

        if (($data['statue'] ?? null) === 'resolue') {
            $panne->pc->update(['etat' => 'fonctionnel']);
        }

        return response()->json($this->format($panne->load(['pc.salle', 'professeur'])));
    }

    public function destroy(int $id): JsonResponse
    {
        Panne::findOrFail($id)->delete();

        return response()->json(['message' => 'Panne supprimée.']);
    }

    private function format(Panne $panne): array
    {
        return [
            'id'               => $panne->id,
            'descr_panne'      => $panne->descr_panne,
            'photo'            => $panne->photo,
            'date_panne'       => $panne->date_panne,
            'statue'           => $panne->statue,
            'descr_reparation' => $panne->descr_reparation,
            'date_reparation'  => $panne->date_reparation,
            'photo_reparation' => $panne->photo_reparation,
            'pc'               => $panne->pc ? [
                'id'        => $panne->pc->id,
                'num_poste' => $panne->pc->num_poste,
                'etat'      => $panne->pc->etat,
                'salle'     => $panne->pc->salle ? [
                    'id'         => $panne->pc->salle->id,
                    'code_salle' => $panne->pc->salle->code_salle,
                    'nom_salle'  => $panne->pc->salle->nom_salle,
                ] : null,
            ] : null,
            'professeur'       => $panne->professeur ? [
                'id'     => $panne->professeur->id,
                'nom'    => $panne->professeur->nom,
                'prenom' => $panne->professeur->prenom,
            ] : null,
            'created_at'       => $panne->created_at,
        ];
    }
}
