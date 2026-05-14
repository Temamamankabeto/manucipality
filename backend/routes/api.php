<?php

use Illuminate\Support\Facades\Route;

Route::get('/ping', function () {
    return response()->json([
        'success' => true,
        'message' => 'API is working',
        'time' => now(),
    ]);
});

require __DIR__ . '/auth.php';
require __DIR__ . '/user.php';
require __DIR__ . '/location.php';
require __DIR__ . '/asset.php';
require __DIR__ . '/citizen.php';
require __DIR__ . '/property.php';
require __DIR__ . '/procurement.php';
