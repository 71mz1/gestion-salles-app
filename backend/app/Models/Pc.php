<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Pc extends Model
{
    use HasFactory;

    protected $table = 'pcs';

    protected $fillable = [
        'num_poste', 'salle_id', 'processeur', 'ram',
        'disque_dur', 'systeme_exploitation', 'etat',
    ];

    public function salle()
    {
        return $this->belongsTo(Salle::class);
    }

    public function pannes()
    {
        return $this->hasMany(Panne::class, 'pc_id');
    }

    public function affectations()
    {
        return $this->hasMany(Affectation::class, 'pc_id');
    }
}
