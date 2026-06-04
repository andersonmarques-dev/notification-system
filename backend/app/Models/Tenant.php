<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Laravel\Sanctum\HasApiTokens;

class Tenant extends Model
{
    use HasApiTokens, HasUuids;

    protected $fillable = ['name', 'is_active'];

    public function notificationLogs()
    {
        return $this->hasMany(NotificationLog::class);
    }
}
