<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePostesTable extends Migration
{
    public function up()
    {
        Schema::create('pcs', function (Blueprint $table) {
            $table->id();
            $table->string('num_poste');
            $table->foreignId('salle_id')->constrained('salles')->cascadeOnDelete();
            $table->string('processeur')->nullable();
            $table->string('ram')->nullable();
            $table->string('disque_dur')->nullable();
            $table->string('systeme_exploitation')->nullable();
            $table->enum('etat', ['fonctionnel', 'en_panne', 'en_maintenance'])->default('fonctionnel');
            $table->timestamps();
            $table->unique(['num_poste', 'salle_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('pcs');
    }
}
