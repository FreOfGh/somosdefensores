@extends('emails.layouts.somos-defensores')

@section('title', $nombreDesembolso . ' desembolso realizado')
@section('heading', $nombreDesembolso . ' desembolso realizado')

@section('content')
    <p style="margin:0 0 24px;">Se informa que se ha realizado el <strong>{{ strtolower($nombreDesembolso) }} desembolso</strong> correspondiente al caso registrado en el sistema.</p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px; background-color:#f7f7f5; border-left:4px solid #ed5a0b;">
        <tr>
            <td align="center" style="padding:20px;">
                <p style="margin:0 0 8px; font-size:12px; line-height:18px; font-weight:700; color:#6b7075;">NUMERO DE CEDULA</p>
                <p style="margin:0; font-size:22px; line-height:28px; font-weight:700; color:#92212a;">{{ $cedula }}</p>
            </td>
        </tr>
    </table>

    <p style="margin:0 0 16px;">Este corresponde al <strong>{{ strtolower($nombreDesembolso) }} desembolso</strong> asociado al caso.</p>
    <p style="margin:0 0 28px;">El desembolso ha sido registrado correctamente en el sistema.</p>
    <p style="margin:0;">Atentamente,<br><strong>Programa Somos Defensores</strong></p>
@endsection