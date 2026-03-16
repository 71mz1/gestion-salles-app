<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSallesTable extends Migration
{
    public function up()
    {
        Schema::create('salles', function (Blueprint $table) {
            $table->id();
            $table->string('nom_salle');
            $table->string('code_salle')->unique();
            $table->integer('capacite')->default(0);
            $table->integer('nb_postes')->default(0);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('salles');
    }
}
