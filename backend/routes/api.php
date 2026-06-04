<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\NotificationLogController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/notifications', [NotificationLogController::class, 'index']);
    Route::post('/notifications', [NotificationLogController::class, 'store']);
});
