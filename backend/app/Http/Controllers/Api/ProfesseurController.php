<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Professeur;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProfesseurController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Professeur::all()->map(fn($p) => $this->format($p)));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nom'     => 'required|string|max:100',
            'prenom'  => 'required|string|max:100',
            'email'   => 'required|email|unique:professeurs,email',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $prof = Professeur::create($data);

        return response()->json($this->format($prof), 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json($this->format(Professeur::findOrFail($id)));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $prof = Professeur::findOrFail($id);

        $data = $request->validate([
            'nom'     => 'sometimes|string|max:100',
            'prenom'  => 'sometimes|string|max:100',
            'email'   => 'sometimes|email|unique:professeurs,email,' . $id,
            'user_id' => 'nullable|exists:users,id',
        ]);

        $prof->update($data);

        return response()->json($this->format($prof));
    }

    public function destroy(int $id): JsonResponse
    {
        Professeur::findOrFail($id)->delete();

        return response()->json(['message' => 'Professeur supprimé.']);
    }

    public function importCsv(Request $request): JsonResponse
    {
        $request->validate(['file' => 'required|file|mimes:csv,txt|max:2048']);

        $path = $request->file('file')->getRealPath();
        $handle = fopen($path, 'r');

        // Skip header row
        fgetcsv($handle);

        $created = 0;
        $errors = [];
        $row = 1;

        while (($line = fgetcsv($handle)) !== false) {
            $row++;
            if (count($line) < 3) {
                $errors[] = "Ligne $row : format invalide (nom, prenom, email requis)";
                continue;
            }

            [$nom, $prenom, $email] = array_map('trim', $line);

            $validator = Validator::make(
                ['nom' => $nom, 'prenom' => $prenom, 'email' => $email],
                [
                    'nom'    => 'required|string|max:100',
                    'prenom' => 'required|string|max:100',
                    'email'  => 'required|email|unique:professeurs,email',
                ]
            );

            if ($validator->fails()) {
                $errors[] = "Ligne $row ($email) : " . implode(', ', $validator->errors()->all());
                continue;
            }

            Professeur::create(['nom' => $nom, 'prenom' => $prenom, 'email' => $email]);
            $created++;
        }

        fclose($handle);

        return response()->json(['created' => $created, 'errors' => $errors]);
    }

    private function format(Professeur $prof): array
    {
        return [
            'id'         => $prof->id,
            'nom'        => $prof->nom,
            'prenom'     => $prof->prenom,
            'email'      => $prof->email,
            'user_id'    => $prof->user_id,
            'created_at' => $prof->created_at,
        ];
    }
}
