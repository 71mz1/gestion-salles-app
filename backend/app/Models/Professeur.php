<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Professeur extends Model
{
    use HasFactory;

    protected $fillable = ['nom', 'prenom', 'email', 'user_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function pannes()
    {
        return $this->hasMany(Panne::class, 'prof_id');
    }
}
