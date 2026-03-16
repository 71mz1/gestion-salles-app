<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = ['nom', 'prenom', 'email', 'password', 'role'];

    protected $hidden = ['password'];

    public function professeur()
    {
        return $this->hasOne(Professeur::class);
    }

    public function isAdministrateur(): bool { return $this->role === 'administrateur'; }
    public function isTechnicien(): bool      { return $this->role === 'technicien'; }
    public function isProfesseur(): bool      { return $this->role === 'professeur'; }
}
