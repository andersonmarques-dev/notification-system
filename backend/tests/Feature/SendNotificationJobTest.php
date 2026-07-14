<?php

namespace Tests\Feature;

use App\Jobs\SendNotificationJob;
use App\Mail\DynamicNotificationMail;
use App\Models\NotificationLog;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class SendNotificationJobTest extends TestCase
{
    use RefreshDatabase;

    public function test_job_sends_email_and_updates_status_to_sent()
    {
        Mail::fake();
        Http::fake();

        $tenant = Tenant::factory()->create();
        $log = NotificationLog::factory()->create([
            'tenant_id' => $tenant->id,
            'recipient' => 'client@example.com',
            'subject' => 'Hello',
            'body' => 'Welcome message',
            'content_type' => 'text',
            'webhook_url' => null,
        ]);

        $job = new SendNotificationJob($log);
        $job->handle();

        Mail::assertSent(DynamicNotificationMail::class, function ($mail) use ($log) {
            return $mail->hasTo('client@example.com') && $mail->log->id === $log->id;
        });

        $this->assertEquals('sent', $log->fresh()->status);
    }

    public function test_job_dispatches_webhook_with_proper_signature()
    {
        Mail::fake();
        Http::fake();

        $tenant = Tenant::factory()->create([
            'webhook_secret' => 'super-secret-key'
        ]);
        $log = NotificationLog::factory()->create([
            'tenant_id' => $tenant->id,
            'recipient' => 'client@example.com',
            'subject' => 'Hello',
            'body' => 'Welcome message',
            'content_type' => 'text',
            'webhook_url' => 'https://my-webhook.com/endpoint',
        ]);

        $job = new SendNotificationJob($log);
        $job->handle();

        Http::assertSent(function ($request) use ($log, $tenant) {
            $this->assertEquals('https://my-webhook.com/endpoint', $request->url());
            $this->assertTrue($request->hasHeader('X-Signature'));
            
            $signature = $request->header('X-Signature')[0];
            $body = $request->body();
            
            $expectedSignature = 'sha256=' . hash_hmac('sha256', $body, $tenant->webhook_secret);
            $this->assertEquals($expectedSignature, $signature);

            $payload = json_decode($body, true);
            $this->assertEquals($log->id, $payload['log_id']);
            $this->assertEquals('success', $payload['status']);
            return true;
        });
    }

    public function test_job_failed_updates_status_and_sends_failure_webhook()
    {
        Http::fake();

        $tenant = Tenant::factory()->create([
            'webhook_secret' => 'super-secret-key'
        ]);
        $log = NotificationLog::factory()->create([
            'tenant_id' => $tenant->id,
            'recipient' => 'client@example.com',
            'subject' => 'Hello',
            'body' => 'Welcome message',
            'content_type' => 'text',
            'webhook_url' => 'https://my-webhook.com/endpoint',
        ]);

        $job = new SendNotificationJob($log);
        $job->failed(new \Exception('SMTP Connection timeout'));

        $this->assertEquals('failed', $log->fresh()->status);
        $this->assertEquals('SMTP Connection timeout', $log->fresh()->error_message);

        Http::assertSent(function ($request) use ($log) {
            $payload = json_decode($request->body(), true);
            $this->assertEquals('failed', $payload['status']);
            $this->assertEquals('SMTP Connection timeout', $payload['message']);
            return true;
        });
    }
}
