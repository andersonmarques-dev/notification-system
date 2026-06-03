<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Notificação</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f0f4ff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">

    {{-- Wrapper externo --}}
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background-color: #f0f4ff; width: 100%; padding: 40px 0;">
        <tr>
            <td align="center">

                {{-- Container principal --}}
                <table width="600" cellpadding="0" cellspacing="0" border="0"
                    style="max-width: 600px; width: 100%;">

                    {{-- ── Header ── --}}
                    <tr>
                        <td style="
                            background: linear-gradient(135deg, #4F46E5 0%, #6366F1 60%, #818CF8 100%);
                            border-radius: 12px 12px 0 0;
                            padding: 32px 40px 28px;
                        ">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td>
                                        {{-- Logotipo textual --}}
                                        <div style="
                                            display: inline-block;
                                            background: rgba(255,255,255,0.15);
                                            border: 1px solid rgba(255,255,255,0.25);
                                            border-radius: 8px;
                                            padding: 6px 14px;
                                            font-size: 13px;
                                            font-weight: 700;
                                            letter-spacing: 0.12em;
                                            text-transform: uppercase;
                                            color: #ffffff;
                                        ">✦ Notify</div>
                                    </td>
                                    <td align="right">
                                        {{-- Indicador de status --}}
                                        <span style="
                                            font-size: 11px;
                                            color: rgba(255,255,255,0.7);
                                            letter-spacing: 0.05em;
                                            text-transform: uppercase;
                                        ">mensagem automática</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- ── Barra decorativa ── --}}
                    <tr>
                        <td style="
                            background: linear-gradient(90deg, #4F46E5, #818CF8, #C7D2FE);
                            height: 3px;
                            font-size: 0;
                            line-height: 0;
                        ">&nbsp;</td>
                    </tr>

                    {{-- ── Corpo ── --}}
                    <tr>
                        <td style="
                            background-color: #ffffff;
                            padding: 40px 40px 32px;
                        ">
                            {{-- Conteúdo dinâmico --}}
                            <div style="
                                font-size: 15px;
                                line-height: 1.75;
                                color: #374151;
                            ">
                                {!! $textBody !!}
                            </div>
                        </td>
                    </tr>

                    {{-- ── Divisor ── --}}
                    <tr>
                        <td style="background-color: #ffffff; padding: 0 40px;">
                            <div style="border-top: 1px solid #E5E7EB; font-size: 0; line-height: 0;">&nbsp;</div>
                        </td>
                    </tr>

                    {{-- ── Footer ── --}}
                    <tr>
                        <td style="
                            background-color: #ffffff;
                            border-radius: 0 0 12px 12px;
                            padding: 24px 40px 32px;
                        ">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td>
                                        <p style="
                                            margin: 0 0 4px;
                                            font-size: 13px;
                                            font-weight: 600;
                                            color: #4F46E5;
                                            letter-spacing: 0.03em;
                                        ">✦ Notify</p>
                                        <p style="
                                            margin: 0;
                                            font-size: 11px;
                                            color: #9CA3AF;
                                            letter-spacing: 0.02em;
                                        ">Este é um e-mail automático. Por favor, não responda.</p>
                                    </td>
                                    <td align="right" valign="middle">
                                        <span style="
                                            display: inline-block;
                                            background: #EEF2FF;
                                            color: #6366F1;
                                            font-size: 10px;
                                            font-weight: 600;
                                            letter-spacing: 0.08em;
                                            text-transform: uppercase;
                                            padding: 4px 10px;
                                            border-radius: 20px;
                                        ">sistema de notificações</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- ── Espaço abaixo do card ── --}}
                    <tr>
                        <td style="padding: 24px 0;">
                            <p style="
                                margin: 0;
                                font-size: 11px;
                                color: #9CA3AF;
                                text-align: center;
                                letter-spacing: 0.02em;
                            ">Você está recebendo este e-mail pois está cadastrado em nossa plataforma.</p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

</body>
</html>