<?php

namespace Database\Factories;

use App\Models\NotificationLog;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NotificationLog>
 */
class NotificationLogFactory extends Factory
{
    protected $model = NotificationLog::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'event_type' => fake()->randomElement(['order_placed', 'password_reset', 'user_welcome']),
            'recipient' => "afomoliveira@gmail.com",
            'subject' => fake()->sentence(),
            'body' => fake()->paragraph(),
            'content_type' => fake()->randomElement(['html', 'text']),
            'status' => 'pending',
            'webhook_url' => "https://webhook.site/c3d1eb2c-855d-47c9-9fff-7158f7cf5863",
        ];
    }
}
