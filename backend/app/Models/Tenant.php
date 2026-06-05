<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Str;

class Tenant extends Model
{
    use HasApiTokens, HasUuids;

    protected $fillable = ['name', 'is_active', 'webhook_secret '];

    protected static function booted(): void
    {
        static::creating(function ($tenant) {
            if (empty($tenant->webhook_secret)) {
                $tenant->webhook_secret = Str::random(32);
            }
        });
    }
    public function notificationLogs()
    {
        return $this->hasMany(NotificationLog::class);
    }
}
