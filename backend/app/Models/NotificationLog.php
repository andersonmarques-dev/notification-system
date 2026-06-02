<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Override;

class NotificationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_type',
        'recipient',
        'subject',
        'body',
        'content_type',
        'payload',
        'status',
        'error_message',
    ];
    protected $casts = [
        'payload' => 'array',
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if ($model->content_type === 'html' && !empty($model->body)) {
                $model->body = clean($model->body);
            }
        });
    }
}
