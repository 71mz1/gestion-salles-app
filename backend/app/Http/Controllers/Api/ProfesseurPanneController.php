<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Panne;
use App\Models\Pc;
use App\Models\Professeur;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfesseurPanneController extends Controller
{
    /**
     * Resolve the Professeur record linked to the authenticated user.
     * Returns 403 if the user has no associated professeur profile.
     */
    private function resolveProf(Request $request): Professeur|JsonResponse
    {
        $user = $request->attributes->get('auth_user');
        $prof = Professeur::where('user_id', $user->id)->first();

        if (!$prof) {
            return response()->json(['message' => 'Aucun profil professeur lié à ce compte.'], 403);
        }

        return $prof;
    }

    /**
     * GET /api/professeur/pannes
     * Historique des pannes déclarées par le professeur connecté.
     */
    public function index(Request $request): JsonResponse
    {
        $prof = $this->resolveProf($request);
        if ($prof instanceof JsonResponse) return $prof;

        $pannes = Panne::with(['pc.salle'])
            ->where('prof_id', $prof->id)
            ->orderByDesc('date_panne')
            ->get()
            ->map(fn($p) => $this->format($p));

        return response()->json($pannes);
    }

    /**
     * POST /api/professeur/pannes
     * Déclarer une nouvelle panne.
     */
    public function store(Request $request): JsonResponse
    {
        $prof = $this->resolveProf($request);
        if ($prof instanceof JsonResponse) return $prof;

        $data = $request->validate([
            'pc_id'       => 'required|exists:pcs,id',
            'descr_panne' => 'required|string|max:2000',
            'date_panne'  => 'required|date',
            'photo'       => 'nullable|string',
        ]);

        $panne = Panne::create([
            'pc_id'       => $data['pc_id'],
            'prof_id'     => $prof->id,
            'descr_panne' => $data['descr_panne'],
            'date_panne'  => $data['date_panne'],
            'photo'       => $data['photo'] ?? null,
            'statue'      => 'en_attente',
        ]);

        Pc::findOrFail($data['pc_id'])->update(['etat' => 'en_panne']);

        return response()->json($this->format($panne->load('pc.salle')), 201);
    }

    /**
     * GET /api/professeur/pcs
     * Liste tous les PCs disponibles (pour le formulaire de déclaration).
     */
    public function listPcs(): JsonResponse
    {
        $pcs = Pc::with('salle')->get()->map(fn($pc) => [
            'id'        => $pc->id,
            'num_poste' => $pc->num_poste,
            'etat'      => $pc->etat,
            'salle'     => $pc->salle ? [
                'id'         => $pc->salle->id,
                'code_salle' => $pc->salle->code_salle,
                'nom_salle'  => $pc->salle->nom_salle,
            ] : null,
        ]);

        return response()->json($pcs);
    }

    /**
     * GET /api/professeur/pcs/{id}/etat
     * Consulter l'état d'un PC spécifique.
     */
    public function etatPc(int $id): JsonResponse
    {
        $pc = Pc::with(['salle', 'pannes' => fn($q) => $q->latest()->limit(3)])->findOrFail($id);

        return response()->json([
            'id'                   => $pc->id,
            'num_poste'            => $pc->num_poste,
            'etat'                 => $pc->etat,
            'processeur'           => $pc->processeur,
            'ram'                  => $pc->ram,
            'disque_dur'           => $pc->disque_dur,
            'systeme_exploitation' => $pc->systeme_exploitation,
            'salle'                => $pc->salle ? [
                'id'         => $pc->salle->id,
                'code_salle' => $pc->salle->code_salle,
                'nom_salle'  => $pc->salle->nom_salle,
            ] : null,
            'pannes_recentes' => $pc->pannes->map(fn($p) => [
                'id'          => $p->id,
                'descr_panne' => $p->descr_panne,
                'statue'      => $p->statue,
                'date_panne'  => $p->date_panne,
            ]),
        ]);
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
            'pc'               => $panne->pc ? [
                'id'        => $panne->pc->id,
                'num_poste' => $panne->pc->num_poste,
                'etat'      => $panne->pc->etat,
                'salle'     => $panne->pc->salle ? [
                    'code_salle' => $panne->pc->salle->code_salle,
                    'nom_salle'  => $panne->pc->salle->nom_salle,
                ] : null,
            ] : null,
            'created_at' => $panne->created_at,
        ];
    }
}
