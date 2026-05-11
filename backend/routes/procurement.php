<?php

 
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/profile/update', [UserController::class, 'updateProfile']);
});
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    

     

    //  Purchase Request Management  

    // Approval Workflow 

    // Vendor Management 

    // Invoice Management 
 
});