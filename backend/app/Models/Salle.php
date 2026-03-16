<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Salle extends Model
{
    use HasFactory;

    protected $fillable = ['nom_salle', 'code_salle', 'capacite', 'nb_postes'];

    public function pcs()
    {
        return $this->hasMany(Pc::class);
    }
}
