<?php

namespace Tests\Feature;

use App\Jobs\SendNotificationJob;
use App\Models\NotificationLog;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_notifications()
    {
        $response = $this->getJson('/api/notifications');
        $response->assertStatus(401);

        $response = $this->postJson('/api/notifications', []);
        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_list_only_their_tenant_notifications()
    {
        $tenant1 = Tenant::factory()->create();
        $user1 = User::factory()->create(['tenant_id' => $tenant1->id]);

        $tenant2 = Tenant::factory()->create();

        // Create log for tenant 1
        NotificationLog::factory()->create([
            'tenant_id' => $tenant1->id,
            'recipient' => 'tenant1@example.com',
            'subject' => 'Subject 1',
            'body' => 'Body 1',
            'content_type' => 'text',
        ]);

        // Create log for tenant 2
        NotificationLog::factory()->create([
            'tenant_id' => $tenant2->id,
            'recipient' => 'tenant2@example.com',
            'subject' => 'Subject 2',
            'body' => 'Body 2',
            'content_type' => 'text',
        ]);

        $response = $this->actingAs($user1, 'sanctum')->getJson('/api/notifications');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.recipient', 'tenant1@example.com');
    }

    public function test_authenticated_user_can_create_notification_successfully()
    {
        Queue::fake();

        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        $payload = [
            'recipient' => 'receiver@example.com',
            'subject' => 'Welcome Notification',
            'body' => 'Hello user, welcome to our platform!',
            'content_type' => 'text',
            'event_type' => 'user_onboarding',
            'webhook_url' => 'https://example.com/webhook',
        ];

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/notifications', $payload);

        $response->assertStatus(202)
            ->assertJsonStructure([
                'message',
                'log_id'
            ]);

        $this->assertDatabaseHas('notification_logs', [
            'tenant_id' => $tenant->id,
            'recipient' => 'receiver@example.com',
            'subject' => 'Welcome Notification',
            'status' => 'pending'
        ]);

        Queue::assertPushed(SendNotificationJob::class, function ($job) use ($tenant) {
            return $job->log->recipient === 'receiver@example.com' && $job->log->tenant_id === $tenant->id;
        });
    }

    public function test_create_notification_validation_fails()
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        $payload = [
            'recipient' => 'invalid-email',
            'subject' => '',
            'body' => '',
            'content_type' => 'invalid_type',
        ];

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/notifications', $payload);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'error' => [
                    'code',
                    'message',
                    'details'
                ]
            ]);
    }
}
