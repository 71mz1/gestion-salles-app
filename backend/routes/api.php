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


Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);
    
    // 1. مسارات مشتركة للعرض (تمنع خطأ 403 للأدوار الثلاثة)
    Route::middleware('role:administrateur,technicien,professeur')->group(function () {
        Route::get('/pcs', [PcController::class, 'index']);
        Route::get('/pcs/{id}', [PcController::class, 'show']);
        Route::get('/salles', [SalleController::class, 'index']);
        Route::get('/salles/{id}', [SalleController::class, 'show']);
    });

    // 2. مسارات البروفيسور (إصلاح خطأ 405)
    Route::middleware('role:professeur')->group(function () {
        // يجب تعريف GET و POST معاً لنفس المسار إذا كان الـ Frontend يحتاجهما
        Route::get('/professeur/pannes', [ProfesseurPanneController::class, 'index']); 
        Route::post('/professeur/pannes', [ProfesseurPanneController::class, 'store']);
        Route::get('/professeur/pcs', [ProfesseurPanneController::class, 'listPcs']);
    });

    // 3. مسارات التقني والأدمن (إدارة الأعطال)
    Route::middleware('role:technicien,administrateur')->group(function () {
        Route::apiResource('pannes', PanneController::class);
    });

    // 4. مسارات الأدمن فقط (التحكم الكامل)
    Route::middleware('role:administrateur')->group(function () {
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
        
        // عمليات الكتابة للأجهزة والقاعات
        Route::post('/pcs', [PcController::class, 'store']);
        Route::put('/pcs/{id}', [PcController::class, 'update']);
        Route::delete('/pcs/{id}', [PcController::class, 'destroy']);

        Route::post('/salles', [SalleController::class, 'store']);
        Route::put('/salles/{id}', [SalleController::class, 'update']);
        Route::delete('/salles/{id}', [SalleController::class, 'destroy']);

        Route::apiResource('users', UserController::class);
        Route::apiResource('niveaux', NiveauController::class);
        Route::apiResource('etudiants', EtudiantController::class);
        Route::apiResource('affectations', AffectationController::class);
    });
});