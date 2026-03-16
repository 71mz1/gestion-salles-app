<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pc;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PosteController extends Controller
{
    public function etat(Request $request, int $id): JsonResponse
    {
        $poste = Pc::with('salle')->findOrFail($id);

        return response()->json([
            'id'                  => $poste->id,
            'numero'              => $poste->numero,
            'etat'                => $poste->etat,
            'marque'              => $poste->marque,
            'modele'              => $poste->modele,
            'processeur'          => $poste->processeur,
            'ram'                 => $poste->ram,
            'disque'              => $poste->disque,
            'systeme_exploitation' => $poste->systeme_exploitation,
            'date_installation'   => $poste->date_installation,
            'notes'               => $poste->notes,
            'salle'               => $poste->salle ? [
                'id'   => $poste->salle->id,
                'nom'  => $poste->salle->nom,
                'code' => $poste->salle->code,
            ] : null,
            'pannes_count' => $poste->pannes()->count(),
            'derniere_panne' => $poste->pannes()
                ->latest()
                ->first(['id', 'titre', 'statut', 'created_at']),
        ]);
    }
}
