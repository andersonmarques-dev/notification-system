<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\NotificationLogController;

Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    Route::get('/notifications', [NotificationLogController::class, 'index']);
    Route::post('/notifications', [NotificationLogController::class, 'store']);
});
