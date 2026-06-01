<?php

namespace App\Services;

use App\Jobs\SendNotificationJob;
use App\Models\NotificationLog;

class NotificationService
{

    public function processNewNotification(array $data): NotificationLog {
        $log = NotificationLog::create([
            'event_type' => $data['event_type'],
            'recipient' => $data['recipient'],
            'payload' => $data['payload'],
            'status' => 'pending',
        ]);

        SendNotificationJob::dispatch($log);

        return $log;
    }
}
