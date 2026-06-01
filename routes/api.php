<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\NotificationLogController;

Route::get('/notifications', [NotificationLogController::class, 'index']);
Route::post('/notifications', [NotificationLogController::class, 'store']);
