<?php

use App\Http\Controllers\Api\CitizenController;
use App\Http\Controllers\Api\CitizenDocumentController;
use App\Http\Controllers\Api\OfficeController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('offices')->group(function () {
        Route::get('/tree', [OfficeController::class, 'tree']);
        Route::get('/', [OfficeController::class, 'index']);
        Route::post('/', [OfficeController::class, 'store']);
        Route::get('/{office}', [OfficeController::class, 'show']);
        Route::put('/{office}', [OfficeController::class, 'update']);
        Route::patch('/{office}/toggle', [OfficeController::class, 'toggle']);
        Route::delete('/{office}', [OfficeController::class, 'destroy']);
    });

    Route::prefix('citizens')->group(function () {
        Route::get('/search/filter', [CitizenController::class, 'index']);
        Route::post('/validate-duplicate', [CitizenController::class, 'validateDuplicate']);
        Route::get('/check-national-id/{nationalId}', [CitizenController::class, 'checkNationalId']);
        Route::get('/check-phone/{phone}', [CitizenController::class, 'checkPhone']);

        Route::get('/', [CitizenController::class, 'index']);
        Route::post('/', [CitizenController::class, 'store']);
        Route::get('/{citizen}', [CitizenController::class, 'show']);
        Route::put('/{citizen}', [CitizenController::class, 'update']);
        Route::delete('/{citizen}', [CitizenController::class, 'destroy']);
        Route::patch('/{citizen}/submit', [CitizenController::class, 'submit']);

        Route::post('/{citizen}/photo', [CitizenController::class, 'uploadPhoto']);
        Route::delete('/{citizen}/photo', [CitizenController::class, 'removePhoto']);

        Route::prefix('{citizen}/documents')->group(function () {
            Route::get('/', [CitizenDocumentController::class, 'index']);
            Route::post('/', [CitizenDocumentController::class, 'store']);
            Route::get('/{document}', [CitizenDocumentController::class, 'show']);
            Route::get('/{document}/download', [CitizenDocumentController::class, 'download']);
            Route::put('/{document}', [CitizenDocumentController::class, 'update']);
            Route::delete('/{document}', [CitizenDocumentController::class, 'destroy']);
        });
    });
});
