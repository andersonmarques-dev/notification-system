<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
}
