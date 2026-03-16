<?php

namespace Database\Seeders;

use App\Models\Panne;
use App\Models\Pc;
use App\Models\Professeur;
use App\Models\Salle;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Users
        $admin = User::updateOrCreate(
            ['email' => 'admin@encgo.ac.ma'],
            [
                'nom'      => 'Alami',
                'prenom'   => 'Youssef',
                'password' => Hash::make('password'),
                'role'     => 'administrateur',
            ]
        );

        $profUser = User::updateOrCreate(
            ['email' => 'prof@encgo.ac.ma'],
            [
                'nom'      => 'Benali',
                'prenom'   => 'Fatima',
                'password' => Hash::make('password'),
                'role'     => 'professeur',
            ]
        );

        User::updateOrCreate(
            ['email' => 'tech@encgo.ac.ma'],
            [
                'nom'      => 'Chraibi',
                'prenom'   => 'Omar',
                'password' => Hash::make('password'),
                'role'     => 'technicien',
            ]
        );

        // Professeur profile (linked to user)
        $prof = Professeur::updateOrCreate(
            ['email' => 'prof@encgo.ac.ma'],
            [
                'nom'     => 'Benali',
                'prenom'  => 'Fatima',
                'user_id' => $profUser->id,
            ]
        );

        // Salles (new schema)
        $salle1 = Salle::updateOrCreate(
            ['code_salle' => 'SI-01'],
            [
                'nom_salle' => 'Salle Informatique 1',
                'capacite'  => 30,
                'nb_postes' => 30,
            ]
        );

        $salle2 = Salle::updateOrCreate(
            ['code_salle' => 'SI-02'],
            [
                'nom_salle' => 'Salle Informatique 2',
                'capacite'  => 25,
                'nb_postes' => 25,
            ]
        );

        // PCs (new schema/table)
        $pc1 = Pc::updateOrCreate(
            ['num_poste' => 'PC-01', 'salle_id' => $salle1->id],
            [
                'etat'                 => 'fonctionnel',
                'processeur'           => 'Intel Core i5-10500',
                'ram'                  => '8 Go',
                'disque_dur'           => 'SSD 256 Go',
                'systeme_exploitation' => 'Windows 10 Pro',
            ]
        );

        $pc2 = Pc::updateOrCreate(
            ['num_poste' => 'PC-02', 'salle_id' => $salle1->id],
            [
                'etat'                 => 'en_panne',
                'processeur'           => 'Intel Core i7-9700',
                'ram'                  => '16 Go',
                'disque_dur'           => 'HDD 500 Go',
                'systeme_exploitation' => 'Windows 10 Pro',
            ]
        );

        // Pannes (new schema)
        Panne::updateOrCreate(
            ['pc_id' => $pc2->id, 'prof_id' => $prof->id, 'descr_panne' => "Écran ne s\'allume pas"],
            [
                'date_panne' => now()->toDateString(),
                'statue'     => 'en_cours',
                'photo'      => null,
            ]
        );

        Panne::updateOrCreate(
            ['pc_id' => $pc1->id, 'prof_id' => $prof->id, 'descr_panne' => 'Clavier défectueux'],
            [
                'date_panne'       => now()->subDays(1)->toDateString(),
                'statue'           => 'resolue',
                'descr_reparation' => 'Clavier remplacé.',
                'date_reparation'  => now()->toDateString(),
                'photo'            => null,
                'photo_reparation' => null,
            ]
        );
    }
}
