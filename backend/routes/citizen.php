<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CitizenController;
use App\Http\Controllers\Api\CitizenDocumentController;
use App\Http\Controllers\Api\NotificationController;



//AUTHENTICATED ROUTES
Route::middleware('auth:sanctum')->group(function () {

//    PROFILE MANAGEMENT

    Route::post(
        '/profile/update',
        [UserController::class, 'updateProfile']
    );

    Route::prefix('citizens')->group(function () {


        Route::post('/',[CitizenController::class, 'store']);

        Route::get('/',[CitizenController::class, 'index']);

        Route::get('/{citizen}',[CitizenController::class, 'show']);

        Route::put('/{citizen}',[CitizenController::class, 'update']);

        Route::delete('/{citizen}',[CitizenController::class, 'destroy']);

       
        Route::patch('/{citizen}/activate',[CitizenController::class, 'activate']);

        Route::patch('/{citizen}/deactivate',[CitizenController::class, 'deactivate']);

        

        Route::get('/search/filter',[CitizenController::class, 'search']);

        Route::post('/validate-duplicate',[CitizenController::class, 'validateDuplicate']);

        Route::get('/check-national-id/{nationalId}',[CitizenController::class, 'checkNationalId']);

        Route::get('/check-phone/{phone}',[CitizenController::class, 'checkPhone']);

        

        Route::post('/{citizen}/photo',[CitizenController::class, 'uploadPhoto']);

        Route::delete('/{citizen}/photo',[CitizenController::class, 'removePhoto']);


        Route::prefix('{citizen}/documents')->group(function () {

            Route::get('/',[CitizenDocumentController::class, 'index']);

            Route::post('/',[CitizenDocumentController::class, 'store']);

            Route::get('/{document}',[CitizenDocumentController::class, 'show']);

            Route::get(
                '/{document}/download',
                [CitizenDocumentController::class, 'download']
            );

            Route::put(
                '/{document}',
                [CitizenDocumentController::class, 'update']
            );

            Route::delete(
                '/{document}',
                [CitizenDocumentController::class, 'destroy']
            );
        });
    });

    /*
    |--------------------------------------------------------------------------
    | NOTIFICATION SYSTEM
    |--------------------------------------------------------------------------
    */

    Route::prefix('notifications')->group(function () {

        Route::get(
            '/',
            [NotificationController::class, 'index']
        );

        Route::get(
            '/unread-count',
            [NotificationController::class, 'unreadCount']
        );

        Route::patch(
            '/{notification}/read',
            [NotificationController::class, 'markAsRead']
        );

        Route::patch(
            '/mark-all-read',
            [NotificationController::class, 'markAllAsRead']
        );

        Route::delete(
            '/{notification}',
            [NotificationController::class, 'destroy']
        );

        /*
        |--------------------------------------------------------------------------
        | SEND NOTIFICATIONS
        |--------------------------------------------------------------------------
        */

        Route::post(
            '/send-sms',
            [NotificationController::class, 'sendSms']
        );

        Route::post(
            '/send-email',
            [NotificationController::class, 'sendEmail']
        );

        Route::post(
            '/send-alert',
            [NotificationController::class, 'sendAlert']
        );

        Route::post(
            '/broadcast',
            [NotificationController::class, 'broadcast']
        );
    });
});