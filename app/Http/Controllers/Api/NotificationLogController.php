<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNotificationLogRequest;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;

class NotificationLogController extends Controller
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function store(StoreNotificationLogRequest $request): JsonResponse
    {
        $log = $this->notificationService->processNewNotification($request->validated());

        return response()->json([
            'message' => 'Evento recebido com sucesso e enfileirado.',
            'log_id' => $log->id
        ], 202);
    }
}
