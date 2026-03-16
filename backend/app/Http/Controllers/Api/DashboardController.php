<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Panne;
use App\Models\Pc;
use App\Models\Salle;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $totalSalles      = Salle::count();
        $totalPcs         = Pc::count();
        $fonctionnels     = Pc::where('etat', 'fonctionnel')->count();
        $enPanne          = Pc::where('etat', 'en_panne')->count();
        $enMaintenance    = Pc::where('etat', 'en_maintenance')->count();
        $pannesEnAttente  = Panne::where('statue', 'en_attente')->count();
        $pannesEnCours    = Panne::where('statue', 'en_cours')->count();
        $pannesResolues   = Panne::where('statue', 'resolue')->count();

        $recentPannes = Panne::with(['pc.salle', 'professeur'])
            ->orderByDesc('date_panne')
            ->limit(5)
            ->get()
            ->map(fn($p) => [
                'id'          => $p->id,
                'descr_panne' => $p->descr_panne,
                'statue'      => $p->statue,
                'date_panne'  => $p->date_panne,
                'pc'          => $p->pc ? [
                    'num_poste'  => $p->pc->num_poste,
                    'code_salle' => $p->pc->salle->code_salle ?? null,
                ] : null,
            ]);

        return response()->json([
            'salles'           => $totalSalles,
            'pcs_total'        => $totalPcs,
            'pcs_fonctionnels' => $fonctionnels,
            'pcs_en_panne'     => $enPanne,
            'pcs_maintenance'  => $enMaintenance,
            'pannes_en_attente'=> $pannesEnAttente,
            'pannes_en_cours'  => $pannesEnCours,
            'pannes_resolues'  => $pannesResolues,
            'recent_pannes'    => $recentPannes,
        ]);
    }
}
