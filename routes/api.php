<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\NotificationLogController;

Route::post('/notifications', [NotificationLogController::class, 'store']);
