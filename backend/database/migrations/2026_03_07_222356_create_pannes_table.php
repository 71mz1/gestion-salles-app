<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePannesTable extends Migration
{
    public function up()
    {
        Schema::create('pannes', function (Blueprint $table) {
            $table->id();
            $table->text('descr_panne');
            $table->string('photo')->nullable();
            $table->date('date_panne');
            $table->enum('statue', ['en_attente', 'en_cours', 'resolue'])->default('en_attente');
            $table->text('descr_reparation')->nullable();
            $table->date('date_reparation')->nullable();
            $table->string('photo_reparation')->nullable();
            $table->foreignId('pc_id')->constrained('pcs')->cascadeOnDelete();
            $table->foreignId('prof_id')->constrained('professeurs')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('pannes');
    }
}
