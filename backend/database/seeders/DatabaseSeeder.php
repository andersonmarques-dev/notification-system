<?php

namespace Database\Seeders;

use App\Models\NotificationLog;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $tenant = $user->tenant;

        NotificationLog::factory()->count(15)->create([
            'tenant_id' => $tenant->id,
        ]);
    }
}
