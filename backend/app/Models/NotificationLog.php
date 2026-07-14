<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Tenant;
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
        'status',
        'error_message',
        'webhook_url',
        'tenant_id'
    ];

    protected static function booted()
    {
        $sanitizeHtml = function ($model) {
            if ($model->content_type === 'html' && !empty($model->body)) {
                $model->body = clean($model->body);
            }
        };

        static::creating($sanitizeHtml);
        static::updating($sanitizeHtml);
    }
    
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
