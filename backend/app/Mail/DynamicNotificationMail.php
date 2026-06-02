<?php

namespace App\Mail;

use App\Models\NotificationLog;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class DynamicNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public NotificationLog $log;

    public function __construct(NotificationLog $log)
    {
        $this->log = $log;
    }

    public function build()
    {
        $mail = $this->subject($this->log->subject ?? 'Notificação');

        if ($this->log->content_type === 'text') {
            return $mail->text('emails.text_layout')->with(['body' => $this->log->body]);
        }

        return $mail->view('emails.master_layout')->with(['body' => $this->log->body]);
    }
}