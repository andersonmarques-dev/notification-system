<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNotificationLogRequest;
use App\Models\NotificationLog;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;

class NotificationLogController extends Controller
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function index(): JsonResponse
    {
        $logs = request()->user()->notificationLogs()->orderBy('created_at', 'desc')->paginate(15);
        return response()->json($logs, 200);
    }

    public function store(StoreNotificationLogRequest $request): JsonResponse
    {

        $data = $request->validated();
        $data['tenant_id'] = $request->user()->id();
        $log = $this->notificationService->processNewNotification($data);

        return response()->json([
            'message' => 'Evento recebido com sucesso e enfileirado.',
            'log_id' => $log->id
        ], 202);
    }
}
