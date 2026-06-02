<?php

namespace App\Services;

use App\Jobs\SendNotificationJob;
use App\Models\NotificationLog;

class NotificationService
{

    public function processNewNotification(array $data): NotificationLog
    {
        $log = NotificationLog::create($data);

        SendNotificationJob::dispatch($log);

        return $log;
    }
}
