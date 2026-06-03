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
            $lines = preg_split("/\r\n|\n|\r/", $this->log->body);
            $htmlBody = '';

            foreach ($lines as $line) {
                $line = trim($line);
                if (!empty($line)) {
                    $htmlBody .= "<p style=\"margin-top: 0; margin-bottom: 16px;\">{$line}</p>";
                }
            }

            return $mail
                ->view('emails.master_layout')
                ->text('emails.text_layout')
                ->with([
                    'body'     => $htmlBody,
                    'textBody' => $this->log->body
                ]);
        }
        return $mail
            ->view('emails.master_layout')
            ->text('emails.text_layout')
            ->with([
                'body'     => $this->log->body,
                'textBody' => strip_tags($this->log->body)
            ]);
    }
}
