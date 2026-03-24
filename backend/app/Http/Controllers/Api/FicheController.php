<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pc;
use App\Models\Salle;
use Illuminate\Http\JsonResponse;

class FicheController extends Controller
{
    public function pc(int $id): JsonResponse
    {
        $pc = Pc::with([
            'salle',
            'pannes.professeur',
            'affectations.etudiant.niveau',
        ])->findOrFail($id);

        $affectations = $pc->affectations->map(fn($a) => [
            'id'          => $a->id,
            'date'        => $a->date?->format('Y-m-d'),
            'heure_debut' => $a->heure_debut,
            'heure_fin'   => $a->heure_fin,
            'etudiant'    => $a->etudiant ? [
                'id'     => $a->etudiant->id,
                'nom'    => $a->etudiant->nom,
                'prenom' => $a->etudiant->prenom,
                'niveau' => $a->etudiant->niveau ? [
                    'filiere'  => $a->etudiant->niveau->filiere,
                    'semestre' => $a->etudiant->niveau->semestre,
                ] : null,
            ] : null,
        ]);

        $pannes = $pc->pannes->sortByDesc('date_panne')->map(fn($p) => [
            'id'               => $p->id,
            'descr_panne'      => $p->descr_panne,
            'date_panne'       => $p->date_panne,
            'statue'           => $p->statue,
            'descr_reparation' => $p->descr_reparation,
            'date_reparation'  => $p->date_reparation,
            'professeur'       => $p->professeur ? [
                'nom'    => $p->professeur->nom,
                'prenom' => $p->professeur->prenom,
            ] : null,
        ])->values();

        return response()->json([
            'id'                   => $pc->id,
            'num_poste'            => $pc->num_poste,
            'processeur'           => $pc->processeur,
            'ram'                  => $pc->ram,
            'disque_dur'           => $pc->disque_dur,
            'systeme_exploitation' => $pc->systeme_exploitation,
            'etat'                 => $pc->etat,
            'created_at'           => $pc->created_at,
            'salle'                => $pc->salle ? [
                'id'         => $pc->salle->id,
                'nom_salle'  => $pc->salle->nom_salle,
                'code_salle' => $pc->salle->code_salle,
            ] : null,
            'affectations'         => $affectations->values(),
            'pannes'               => $pannes,
        ]);
    }

    public function salle(int $id): JsonResponse
    {
        $salle = Salle::with([
            'pcs.affectations.etudiant.niveau',
        ])->withCount('pcs')->findOrFail($id);

        // Collect all affectations across all PCs in this salle
        $allAffectations = collect();
        foreach ($salle->pcs as $pc) {
            foreach ($pc->affectations as $a) {
                $allAffectations->push([
                    'id'          => $a->id,
                    'pc_id'       => $pc->id,
                    'num_poste'   => $pc->num_poste,
                    'date'        => $a->date?->format('Y-m-d'),
                    'heure_debut' => $a->heure_debut,
                    'heure_fin'   => $a->heure_fin,
                    'etudiant'    => $a->etudiant ? [
                        'id'     => $a->etudiant->id,
                        'nom'    => $a->etudiant->nom,
                        'prenom' => $a->etudiant->prenom,
                        'niveau' => $a->etudiant->niveau ? [
                            'filiere'  => $a->etudiant->niveau->filiere,
                            'semestre' => $a->etudiant->niveau->semestre,
                        ] : null,
                    ] : null,
                ]);
            }
        }

        // Unique students assigned to this salle
        $etudiants = $allAffectations
            ->filter(fn($a) => $a['etudiant'] !== null)
            ->unique(fn($a) => $a['etudiant']['id'])
            ->map(fn($a) => $a['etudiant'])
            ->values();

        // Unique niveaux
        $niveaux = $etudiants
            ->filter(fn($e) => $e['niveau'] !== null)
            ->map(fn($e) => $e['niveau']['filiere'] . ' — ' . $e['niveau']['semestre'])
            ->unique()
            ->values();

        // Horaires sorted by date then heure_debut
        $horaires = $allAffectations
            ->sortBy(['date', 'heure_debut'])
            ->values();

        return response()->json([
            'id'           => $salle->id,
            'nom_salle'    => $salle->nom_salle,
            'code_salle'   => $salle->code_salle,
            'capacite'     => $salle->capacite,
            'nb_postes'    => $salle->nb_postes,
            'pcs_count'    => $salle->pcs_count,
            'created_at'   => $salle->created_at,
            'etudiants'    => $etudiants,
            'niveaux'      => $niveaux,
            'horaires'     => $horaires,
        ]);
    }
}
