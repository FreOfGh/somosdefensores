@extends('emails.layouts.somos-defensores')

@section('title', 'Formulario de seguimiento de caso')
@section('heading', 'Formulario de seguimiento de caso')

@section('content')
    <p style="margin:0 0 20px;">Se ha habilitado un formulario de seguimiento para su caso. El enlace es personal y solo puede utilizarse una vez.</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px;">
        <tr>
            <td style="background-color:#92212a;">
                <a href="{{ $url }}" style="display:inline-block; padding:13px 22px; color:#ffffff; font-size:16px; font-weight:700; text-decoration:none;">Completar seguimiento</a>
            </td>
        </tr>
    </table>
    <p style="margin:0; font-size:14px; line-height:21px; color:#5c646b;">El enlace vence el {{ $expiresAt->format('d/m/Y \a \l\a\s H:i') }}. Si no solicit&oacute; este formulario, puede ignorar este mensaje.</p>
@endsection
