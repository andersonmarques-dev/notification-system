<div style="font-family: sans-serif; padding: 20px;">
    <h2>Olá, {{ $payload['nome'] ?? 'Cliente' }}!</h2>
    <p>O seu pedido <strong>#{{ $payload['numero_pedido'] ?? '0000' }}</strong> foi confirmado com sucesso e já está sendo preparado para envio.</p>
    <p>Obrigado por comprar conosco!</p>
</div>