<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>@yield('title', 'Somos Defensores')</title>
</head>
<body style="margin:0; padding:0; background-color:#f3f4f6; font-family:Arial, Helvetica, sans-serif; color:#27313d;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background-color:#f3f4f6;">
        <tr>
            <td align="center" style="padding:32px 16px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%; max-width:600px; background-color:#ffffff;">
                    <tr>
                        <td align="center" style="padding:28px 32px 24px; border-bottom:4px solid #ed5a0b;">
                            <img src="{{ asset('images/logo-somos-defensores.png') }}" alt="Programa Somos Defensores" width="220" style="display:block; width:100%; max-width:220px; height:auto; border:0;">
                        </td>
                    </tr>
                    @hasSection('heading')
                        <tr>
                            <td style="padding:26px 32px; background-color:#92212a; color:#ffffff;">
                                <h1 style="margin:0; font-size:24px; line-height:32px; font-weight:700;">@yield('heading')</h1>
                            </td>
                        </tr>
                    @endif
                    <tr>
                        <td style="padding:32px; font-size:16px; line-height:24px; color:#27313d;">
                            @yield('content')
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 32px; background-color:#f7f7f5; border-top:1px solid #deded8; font-size:12px; line-height:18px; color:#5c646b; text-align:center;">
                            <p style="margin:0 0 6px; font-weight:700; color:#92212a;">Programa Somos Defensores</p>
                            <p style="margin:0;">Este es un mensaje autom&aacute;tico. Por favor, no responda directamente a este correo.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>