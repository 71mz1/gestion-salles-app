<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Affectation extends Model
{
    use HasFactory;

    protected $fillable = ['pc_id', 'etudiant_id', 'date', 'heure_debut', 'heure_fin'];

    protected $casts = ['date' => 'date'];

    public function pc()
    {
        return $this->belongsTo(Pc::class, 'pc_id');
    }

    public function etudiant()
    {
        return $this->belongsTo(Etudiant::class);
    }
}
