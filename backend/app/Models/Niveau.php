<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Niveau extends Model
{
    use HasFactory;

    protected $fillable = ['semestre', 'filiere'];

    public function etudiants()
    {
        return $this->hasMany(Etudiant::class);
    }
}
