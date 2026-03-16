<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Panne extends Model
{
    use HasFactory;

    protected $fillable = [
        'descr_panne', 'photo', 'date_panne', 'statue',
        'descr_reparation', 'date_reparation', 'photo_reparation',
        'pc_id', 'prof_id',
    ];

    protected $casts = [
        'date_panne'      => 'date',
        'date_reparation' => 'date',
    ];

    public function pc()
    {
        return $this->belongsTo(Pc::class, 'pc_id');
    }

    public function professeur()
    {
        return $this->belongsTo(Professeur::class, 'prof_id');
    }
}
