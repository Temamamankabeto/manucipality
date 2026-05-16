<?php

use App\Http\Controllers\Api\CitizenPropertyController;
use App\Http\Controllers\Api\PropertyCategoryController;
use App\Http\Controllers\Api\PropertyController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/profile/update', [UserController::class, 'updateProfile']);
});

Route::middleware('auth:sanctum')->prefix('admin')->group(function () {

    Route::get('/property-categories', [PropertyCategoryController::class, 'index']);
    Route::post('/property-categories', [PropertyCategoryController::class, 'store']);

    Route::get('/properties', [PropertyController::class, 'index']);
    Route::post('/properties', [PropertyController::class, 'store']);
    Route::get('/properties/{property}', [PropertyController::class, 'show']);
    Route::put('/properties/{property}', [PropertyController::class, 'update']);
    Route::delete('/properties/{property}', [PropertyController::class, 'destroy']);

    Route::get('/citizen-properties', [CitizenPropertyController::class, 'index']);
    Route::post('/citizen-properties', [CitizenPropertyController::class, 'store']);
    Route::delete('/citizen-properties/{citizenProperty}', [CitizenPropertyController::class, 'destroy']);
});