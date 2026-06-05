<?php

namespace App\Models;

// Remove: use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable; // Importação correta
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Str;

class Tenant extends Authenticatable
{
    use HasApiTokens, HasUuids;

    protected $fillable = ['name', 'is_active', 'webhook_secret'];

    protected static function booted(): void
    {
        static::creating(function ($tenant) {
            if (empty($tenant->webhook_secret)) {
                $tenant->webhook_secret = Str::random(32);
            }
        });
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function notificationLogs()
    {
        return $this->hasMany(NotificationLog::class);
    }
}
