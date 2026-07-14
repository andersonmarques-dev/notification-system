<?php

namespace Tests\Feature;

use App\Mail\OrderConfirmedMail;
use App\Mail\PasswordResetMail;
use App\Mail\UserRegisteredMail;
use Tests\TestCase;

class MailableCompilationTest extends TestCase
{
    public function test_order_confirmed_mailable_compiles_and_renders()
    {
        $payload = [
            'nome' => 'Alice',
            'numero_pedido' => '12345'
        ];
        
        $mailable = new OrderConfirmedMail($payload);
        $mailable->build();

        $this->assertEquals('Seu pedido foi confirmado', $mailable->subject);
        $this->assertEquals('emails.order_confirmed', $mailable->view);
    }

    public function test_password_reset_mailable_compiles_and_renders()
    {
        $payload = [
            'token' => 'some-reset-token'
        ];
        
        $mailable = new PasswordResetMail($payload);
        $mailable->build();

        $this->assertEquals('Recuperação de Senha', $mailable->subject);
        $this->assertEquals('emails.password_reset', $mailable->view);
    }

    public function test_user_registered_mailable_compiles_and_renders()
    {
        $payload = [
            'name' => 'Bob'
        ];
        
        $mailable = new UserRegisteredMail($payload);
        $mailable->build();

        $this->assertEquals('Bem-vindo ao nosso sistema!', $mailable->subject);
        $this->assertEquals('emails.user_registered', $mailable->view);
    }
}
