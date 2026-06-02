<?php

namespace App\Jobs;

use App\Mail\OrderConfirmedMail;
use App\Mail\PasswordResetMail;
use App\Mail\UserRegisteredMail;
use Exception;
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
        try{
            $mailable = match($this->log->event_type) {
                'usuario_cadastrado' => new UserRegisteredMail($this->log->payload),
                'pedido_confirmado' => new OrderConfirmedMail($this->log->payload),
                'senha_recuperada' => new PasswordResetMail($this->log->payload),
                default => throw new Exception("Tipo de Evento Desconhecido: {$this->log->event_type}"),
            };

            Mail::to($this->log->recipient)->send($mailable);

            $this->log->update([
                'status' => 'sent',
            ]);

        } catch (Exception $e) {
            $this->log->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
