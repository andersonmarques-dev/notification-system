<?php

namespace App\Jobs;

use App\Mail\DynamicNotificationMail;
use App\Models\NotificationLog;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public NotificationLog $log;

    /**
     * Create a new job instance.
     */
    public function __construct(NotificationLog $log)
    {
        $this->log = $log;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $mailable = new DynamicNotificationMail($this->log);
            Mail::to($this->log->recipient)->send($mailable);

            $this->log->update(['status' => 'sent']);
        } catch (\Throwable $e) {
            $this->log->update([
                'status' => 'failed',
                'error_message' => $e->getMessage()
            ]);
        }
    }
}
