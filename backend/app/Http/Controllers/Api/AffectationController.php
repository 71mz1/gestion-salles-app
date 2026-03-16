<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Affectation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AffectationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Affectation::with(['pc.salle', 'etudiant.niveau']);

        if ($request->has('date')) {
            $query->whereDate('date', $request->date);
        }

        return response()->json($query->get()->map(fn($a) => $this->format($a)));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'pc_id'       => 'required|exists:pcs,id',
            'etudiant_id' => 'required|exists:etudiants,id',
            'date'        => 'required|date',
            'heure_debut' => 'required|date_format:H:i',
            'heure_fin'   => 'required|date_format:H:i|after:heure_debut',
        ]);

        $affectation = Affectation::create($data);

        return response()->json($this->format($affectation->load(['pc.salle', 'etudiant.niveau'])), 201);
    }

    public function destroy(int $id): JsonResponse
    {
        Affectation::findOrFail($id)->delete();

        return response()->json(['message' => 'Affectation supprimée.']);
    }

    private function format(Affectation $a): array
    {
        return [
            'id'          => $a->id,
            'date'        => $a->date,
            'heure_debut' => $a->heure_debut,
            'heure_fin'   => $a->heure_fin,
            'pc'          => $a->pc ? [
                'id'        => $a->pc->id,
                'num_poste' => $a->pc->num_poste,
                'salle'     => $a->pc->salle ? [
                    'code_salle' => $a->pc->salle->code_salle,
                    'nom_salle'  => $a->pc->salle->nom_salle,
                ] : null,
            ] : null,
            'etudiant'    => $a->etudiant ? [
                'id'     => $a->etudiant->id,
                'nom'    => $a->etudiant->nom,
                'prenom' => $a->etudiant->prenom,
                'niveau' => $a->etudiant->niveau,
            ] : null,
        ];
    }
}
