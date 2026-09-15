@extends('emails.layouts.somos-defensores')

@section('title', 'Validación de caso')
@section('heading', 'Solicitud de validación de caso')

@section('content')
	<p style="margin:0 0 20px;">Tienes una solicitud de validación para un caso de <strong>{{ str_replace('_', ' ', $tipoCaso) }}</strong>.</p>

	@if ($respuestaRevisor)
		<div style="margin:0 0 24px; padding:16px; background-color:#f7f7f5; border-left:4px solid #ed5a0b;">
			<p style="margin:0 0 8px; font-weight:700; color:#000000;">Respuesta del equipo revisor</p>
			<p style="margin:0; white-space:pre-line; color:#000000;">{{ $respuestaRevisor }}</p>
		</div>
	@endif

	<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px;">
		<tr>
			<td style="background-color:#92212a;">
				<a href="{{ $url }}" style="display:inline-block; padding:13px 22px; color:#ffffff; font-size:16px; font-weight:700; text-decoration:none;">Abrir caso para validación</a>
			</td>
		</tr>
	</table>
	<p style="margin:0; font-size:14px; line-height:21px; color:#000000;">Este enlace es personal, de un solo uso y vence en siete días.</p>
@endsection