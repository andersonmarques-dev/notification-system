<?php

namespace App\Jobs;

use App\Mail\DynamicNotificationMail;
use App\Models\NotificationLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class SendNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public NotificationLog $log;

    public int $tries = 3;

    public array $backoff = [10, 30];

    public function __construct(NotificationLog $log)
    {
        $this->log = $log;
    }

    public function handle(): void
    {
        Mail::to($this->log->recipient)->send(new DynamicNotificationMail($this->log));

        $this->log->update(['status' => 'sent']);
        $this->dispatchWebhook('success', 'E-mail enviado com sucesso.');
    }

    public function failed(Throwable $exception): void
    {
        $this->log->update([
            'status' => 'failed',
            'error_message' => $exception->getMessage()
        ]);

        $this->dispatchWebhook('failed', $exception->getMessage());
    }

    protected function dispatchWebhook(string $status, string $message): void
    {
        if (!$this->log->webhook_url) {
            return;
        }

        try {
            $this->log->loadMissing('tenant');
            $secret = $this->log->tenant?->webhook_secret;

            if (!$secret) {
                return;
            }

            $jsonPayload = json_encode([
                'log_id'     => $this->log->id,
                'status'     => $status,
                'event_type' => $this->log->event_type,
                'message'    => $message,
                'timestamp'  => now()->toIso8601String(),
            ], JSON_THROW_ON_ERROR);

            $signature = 'sha256=' . hash_hmac('sha256', $jsonPayload, $secret);

            Http::timeout(5)
                ->withHeaders(['X-Signature' => $signature])
                ->withBody($jsonPayload, 'application/json')
                ->post($this->log->webhook_url);
        } catch (Throwable $e) {
            Log::warning('Webhook dispatch failed', [
                'log_id' => $this->log->id,
                'error'  => $e->getMessage(),
            ]);
        }
    }
}