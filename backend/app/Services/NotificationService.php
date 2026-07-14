<?php

namespace App\Services;

use App\Jobs\SendNotificationJob;
use App\Models\NotificationLog;

class NotificationService
{

    public function processNewNotification(array $data): NotificationLog
    {
        try {
            $log = NotificationLog::create($data);

            SendNotificationJob::dispatch($log);
        } catch (\Exception $e) {
            throw new \RuntimeException('Erro ao processar a notificação: ' . $e->getMessage(), 0, $e);
        }

        return $log;
    }
}
