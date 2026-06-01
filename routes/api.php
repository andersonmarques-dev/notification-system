<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\NotificationController;

Route::post('/notifications', [NotificationController::class, 'store']);
