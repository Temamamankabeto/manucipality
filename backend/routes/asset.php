<?php

use App\Http\Controllers\Api\Asset\UserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Asset\AssetTypeController;
use App\Http\Controllers\Api\Asset\AssetGroupController;
use App\Http\Controllers\Api\Asset\AssetSubgroupController;
use App\Http\Controllers\Api\Asset\AssetController;


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/profile/update', [UserController::class, 'updateProfile']);
});
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {

    //  Asset Registration 
    // Asset Categories 
    // Asset Tracking 
   Route::get('/asset-types', [AssetTypeController::class, 'index']);

Route::post('/asset-types', [AssetTypeController::class, 'store']);

Route::get('/asset-types/{id}', [AssetTypeController::class, 'show']);

Route::put('/asset-types/{id}', [AssetTypeController::class, 'update']);

Route::delete('/asset-types/{id}', [AssetTypeController::class, 'destroy']);

// AssetGroupController
Route::get('/asset-groups', [AssetGroupController::class, 'index']);
Route::post('/asset-groups', [AssetGroupController::class, 'store']);
Route::get('/asset-groups/{id}', [AssetGroupController::class, 'show']);
Route::put('/asset-groups/{id}', [AssetGroupController::class, 'update']);
Route::delete('/asset-groups/{id}', [AssetGroupController::class, 'destroy']);

// AssetSubgroupController
Route::get('/asset-subgroups', [AssetSubgroupController::class, 'index']);
Route::post('/asset-subgroups', [AssetSubgroupController::class, 'store']);
Route::get('/asset-subgroups/{id}', [AssetSubgroupController::class, 'show']);
Route::put('/asset-subgroups/{id}', [AssetSubgroupController::class, 'update']);
Route::delete('/asset-subgroups/{id}', [AssetSubgroupController::class, 'destroy']);

// AssetController
 
Route::get('/assets', [AssetController::class, 'index']);
Route::post('/assets', [AssetController::class, 'store']);
Route::get('/assets/{id}', [AssetController::class, 'show']);
Route::put('/assets/{id}', [AssetController::class, 'update']);
Route::delete('/assets/{id}', [AssetController::class, 'destroy']);
    // Maintenance Management 

    // Asset Depreciation 

    // Asset Disposal 
 
});