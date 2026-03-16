<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Etudiant extends Model
{
    use HasFactory;

    protected $fillable = ['nom', 'prenom', 'niveau_id'];

    public function niveau()
    {
        return $this->belongsTo(Niveau::class);
    }

    public function affectations()
    {
        return $this->hasMany(Affectation::class);
    }
}
