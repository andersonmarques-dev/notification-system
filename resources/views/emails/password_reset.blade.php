<div style="font-family: sans-serif; padding: 20px;">
    <h2>Olá, {{ $payload['nome'] ?? 'Usuário' }}!</h2>
    <p>Recebemos uma solicitação para redefinir a sua senha.</p>
    <p>Seu código de recuperação é: <strong style="font-size: 24px; color: #1D9E75;">{{ $payload['codigo'] ?? '123456' }}</strong></p>
    <p>Se você não fez essa solicitação, ignore este e-mail.</p>
</div>