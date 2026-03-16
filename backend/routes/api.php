<?php

use App\Http\Controllers\Api\AffectationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EtudiantController;
use App\Http\Controllers\Api\NiveauController;
use App\Http\Controllers\Api\PanneController;
use App\Http\Controllers\Api\PcController;
use App\Http\Controllers\Api\ProfesseurPanneController;
use App\Http\Controllers\Api\SalleController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// Public
Route::post('/auth/login',  [AuthController::class, 'login']);

// Public
Route::apiResource('niveaux', NiveauController::class);
Route::apiResource('etudiants', EtudiantController::class);
Route::post('/etudiants/import-csv', [EtudiantController::class, 'importCsv']);
Route::apiResource('affectations', AffectationController::class)->except(['update', 'show']);

// Authenticated
Route::middleware('auth')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Salles
    Route::apiResource('salles', SalleController::class);

    // PCs / Postes
    Route::apiResource('pcs', PcController::class);

    // Pannes
    Route::apiResource('pannes', PanneController::class);

    // Users
    Route::apiResource('users', UserController::class);

    // Espace Professeur
    Route::get('/professeur/pannes',          [ProfesseurPanneController::class, 'index']);
    Route::post('/professeur/pannes',         [ProfesseurPanneController::class, 'store']);
    Route::get('/professeur/pcs',             [ProfesseurPanneController::class, 'listPcs']);
    Route::get('/professeur/pcs/{id}/etat',   [ProfesseurPanneController::class, 'etatPc']);
});
