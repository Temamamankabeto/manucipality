<?php

use App\Http\Controllers\Api\AnalyticsReportController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\BillController;
use App\Http\Controllers\Api\CashShiftController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DiningTableController;
use App\Http\Controllers\Api\InventoryItemController;
use App\Http\Controllers\Api\InventoryTransactionController;
use App\Http\Controllers\Api\MenuCategoryController;
use App\Http\Controllers\Api\MenuItemController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\PurchaseOrderController;
use App\Http\Controllers\Api\RecipeController;
use App\Http\Controllers\Api\RefundRequestController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\StockReceivingController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WaiterOrderController;
use Illuminate\Support\Facades\Route;


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/profile/update', [UserController::class, 'updateProfile']);
});
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    

     

    Route::get('/audit-logs', [AuditLogController::class, 'index']);
    Route::get('/audit-logs/{id}', [AuditLogController::class, 'show']);

     
 

    // Roles
    Route::get('/roles', [RoleController::class, 'index']);
    Route::get('/role-permissions', [RoleController::class, 'permissions']);
    Route::get('/roles/{id}/permissions', [RoleController::class, 'rolePermissions']);
    Route::post('/roles', [RoleController::class, 'store']);
    Route::put('/roles/{id}', [RoleController::class, 'update']);
    Route::post('/roles/{id}/permissions', [RoleController::class, 'assignPermissions']);

    // Users
    Route::get('/users/roles-lite', [UserController::class, 'rolesLite']);
    Route::get('/users/waiters-lite', [UserController::class, 'waitersLite']);
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::patch('/users/{id}/toggle', [UserController::class, 'toggle']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::post('/users/{id}/reset-password', [UserController::class, 'resetPassword']);
    Route::post('/users/{id}/roles', [UserController::class, 'assignRole']);

    // Permissions
    Route::get('/permissions', [PermissionController::class, 'index']);
    Route::post('/permissions', [PermissionController::class, 'store']);
    Route::put('/permissions/{id}', [PermissionController::class, 'update']);
    Route::delete('/permissions/{id}', [PermissionController::class, 'destroy']);
 
});