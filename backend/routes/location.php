<?php

use App\Http\Controllers\Api\LocationController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/locations/tree', [LocationController::class, 'tree']);

    Route::prefix('cities')->group(function () {
        Route::get('/', [LocationController::class, 'cities']);
        Route::post('/', [LocationController::class, 'storeCity']);
        Route::get('/{city}/subcities', [LocationController::class, 'citySubcities']);
        Route::get('/{city}', [LocationController::class, 'city']);
        Route::put('/{city}', [LocationController::class, 'updateCity']);
        Route::patch('/{city}/toggle', [LocationController::class, 'toggleCity']);
        Route::delete('/{city}', [LocationController::class, 'destroyCity']);
    });

    Route::prefix('subcities')->group(function () {
        Route::get('/', [LocationController::class, 'subcities']);
        Route::post('/', [LocationController::class, 'storeSubcity']);
        Route::get('/{subcity}/woredas', [LocationController::class, 'subcityWoredas']);
        Route::get('/{subcity}', [LocationController::class, 'subcity']);
        Route::put('/{subcity}', [LocationController::class, 'updateSubcity']);
        Route::patch('/{subcity}/toggle', [LocationController::class, 'toggleSubcity']);
        Route::delete('/{subcity}', [LocationController::class, 'destroySubcity']);
    });

    Route::prefix('woredas')->group(function () {
        Route::get('/', [LocationController::class, 'woredas']);
        Route::post('/', [LocationController::class, 'storeWoreda']);
        Route::get('/{woreda}/zones', [LocationController::class, 'woredaZones']);
        Route::get('/{woreda}', [LocationController::class, 'woreda']);
        Route::put('/{woreda}', [LocationController::class, 'updateWoreda']);
        Route::patch('/{woreda}/toggle', [LocationController::class, 'toggleWoreda']);
        Route::delete('/{woreda}', [LocationController::class, 'destroyWoreda']);
    });

    Route::prefix('zones')->group(function () {
        Route::get('/', [LocationController::class, 'zones']);
        Route::post('/', [LocationController::class, 'storeZone']);
        Route::get('/{zone}', [LocationController::class, 'zone']);
        Route::put('/{zone}', [LocationController::class, 'updateZone']);
        Route::patch('/{zone}/toggle', [LocationController::class, 'toggleZone']);
        Route::delete('/{zone}', [LocationController::class, 'destroyZone']);
    });
});
