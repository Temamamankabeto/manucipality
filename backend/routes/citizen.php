<?php

use App\Http\Controllers\Api\CitizenController;
use App\Http\Controllers\Api\CitizenDocumentController;
use App\Http\Controllers\Api\CitizenNotificationController;
use App\Http\Controllers\Api\CitizenProfileController;
use App\Http\Controllers\Api\CitizenReportController;
use App\Http\Controllers\Api\CitizenWorkflowController;
use App\Http\Controllers\Api\HouseholdController;
use App\Http\Controllers\Api\HouseholdMemberController;
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

    Route::get('/citizen-dashboard/metrics', [CitizenReportController::class, 'metrics']);

    Route::prefix('citizen-reports')->group(function () {
        Route::get('/gender-distribution', [CitizenReportController::class, 'gender']);
        Route::get('/age-distribution', [CitizenReportController::class, 'age']);
        Route::get('/households', [CitizenReportController::class, 'households']);
        Route::get('/registration-trends', [CitizenReportController::class, 'trends']);
        Route::get('/suspended', [CitizenReportController::class, 'suspended']);
    });

    Route::prefix('notifications')->group(function () {
        Route::get('/', [CitizenNotificationController::class, 'index']);
        Route::get('/unread-count', [CitizenNotificationController::class, 'unreadCount']);
        Route::patch('/mark-all-read', [CitizenNotificationController::class, 'markAllAsRead']);
        Route::patch('/{notification}/read', [CitizenNotificationController::class, 'markAsRead']);
        Route::delete('/{notification}', [CitizenNotificationController::class, 'destroy']);
    });

    Route::prefix('households')->group(function () {
        Route::get('/', [HouseholdController::class, 'index']);
        Route::post('/', [HouseholdController::class, 'store']);
        Route::get('/{household}', [HouseholdController::class, 'show']);
        Route::put('/{household}', [HouseholdController::class, 'update']);
        Route::delete('/{household}', [HouseholdController::class, 'destroy']);
        Route::post('/{household}/members', [HouseholdMemberController::class, 'store']);
        Route::put('/{household}/members/{member}', [HouseholdMemberController::class, 'update']);
        Route::delete('/{household}/members/{member}', [HouseholdMemberController::class, 'destroy']);
    });

    Route::prefix('citizens')->group(function () {
        Route::get('/workflow/pending', [CitizenWorkflowController::class, 'pending']);
        Route::get('/duplicates', [CitizenWorkflowController::class, 'duplicates']);
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

        Route::get('/{citizen}/profile', [CitizenProfileController::class, 'show']);
        Route::get('/{citizen}/workflow', [CitizenWorkflowController::class, 'workflow']);
        Route::patch('/{citizen}/start-review', [CitizenWorkflowController::class, 'startReview']);
        Route::patch('/{citizen}/documents/verify', [CitizenWorkflowController::class, 'verifyDocuments']);
        Route::patch('/{citizen}/woreda-verify', [CitizenWorkflowController::class, 'woredaVerify']);
        Route::patch('/{citizen}/subcity-approve', [CitizenWorkflowController::class, 'subcityApprove']);
        Route::patch('/{citizen}/generate-id', [CitizenWorkflowController::class, 'generateId']);
        Route::patch('/{citizen}/activate', [CitizenWorkflowController::class, 'activate']);
        Route::patch('/{citizen}/reject', [CitizenWorkflowController::class, 'reject']);
        Route::patch('/{citizen}/flag', [CitizenWorkflowController::class, 'flag']);
        Route::patch('/{citizen}/suspend', [CitizenWorkflowController::class, 'suspend']);

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
