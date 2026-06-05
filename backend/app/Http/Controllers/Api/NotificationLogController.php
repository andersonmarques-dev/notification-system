<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNotificationLogRequest;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationLogController extends Controller
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Resolve o dono dos dados independente da origem da requisição.
     * - Acesso via Painel React (Sanctum session): $request->user() é um User → retorna o Tenant atrelado.
     * - Acesso M2M via Token:                      $request->user() já é o Tenant → retorna direto.
     */
    private function resolveTenant(Request $request)
    {
        $entity = $request->user();
        $tenant = $entity instanceof User ? $entity->tenant : $entity;

        if (! $tenant) {
            abort(403, 'Acesso negado: O usuário autenticado é órfão e não possui uma empresa (Tenant) vinculada.');
        }

        return $tenant;
    }

    public function index(Request $request): JsonResponse
    {
        $tenant = $this->resolveTenant($request);

        $logs = $tenant->notificationLogs()
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($logs, 200);
    }

    public function store(StoreNotificationLogRequest $request): JsonResponse
    {
        $tenant = $this->resolveTenant($request);

        $data = $request->validated();
        $data['tenant_id'] = $tenant->id;

        $log = $this->notificationService->processNewNotification($data);

        return response()->json([
            'message' => 'Evento recebido com sucesso e enfileirado.',
            'log_id'  => $log->id,
        ], 202);
    }
}
