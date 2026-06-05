<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\NotificationLogController;
use App\Http\Controllers\Api\AuthController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/notifications', [NotificationLogController::class, 'index']);
    Route::post('/notifications', [NotificationLogController::class, 'store']);
});
