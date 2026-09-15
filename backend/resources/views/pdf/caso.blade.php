<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1f2937; line-height: 1.45; }
        .header { background-color: #92212a; color: #ffffff; padding: 18px 24px; border-bottom: 4px solid #ed5a0b; }
        .header h1 { font-size: 18px; margin-bottom: 4px; }
        .header p { font-size: 11px; color: #f3d9d9; }
        .meta { padding: 12px 24px; background-color: #f5f5f5; border-bottom: 1px solid #e5e7eb; font-size: 10px; color: #4b5563; }
        .contenido { padding: 18px 24px; }
        .seccion { margin-bottom: 18px; page-break-inside: avoid; }
        .seccion h2 { background-color: #92212a; color: #ffffff; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; padding: 6px 10px; margin-bottom: 8px; }
        table.campos { width: 100%; border-collapse: collapse; }
        table.campos td { vertical-align: top; padding: 5px 8px; border-bottom: 1px solid #e5e7eb; }
        table.campos td.etiqueta { width: 32%; font-size: 9px; font-weight: bold; text-transform: uppercase; color: #6b7280; }
        table.campos td.valor { width: 68%; white-space: pre-wrap; }
        .documento { padding: 4px 8px; border-bottom: 1px solid #e5e7eb; font-size: 10px; }
        .conversacion { border-left: 3px solid #ed5a0b; background-color: #f9fafb; padding: 8px 10px; margin-bottom: 8px; }
        .conversacion .autor { font-weight: bold; font-size: 10px; }
        .conversacion .decision { font-size: 10px; margin: 2px 0; }
        .conversacion .texto { margin-top: 4px; white-space: pre-wrap; }
        .conversacion .respuesta-revisor { margin-top: 6px; padding-top: 6px; border-top: 1px dashed #d1d5db; }
        .vacio { color: #9ca3af; font-style: italic; }
        .footer { position: fixed; bottom: 12px; left: 24px; right: 24px; text-align: center; font-size: 8px; color: #9ca3af; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Reporte del caso</h1>
        <p>{{ $tituloTipo }} &mdash; {{ $nombreCaso }}</p>
    </div>

    <div class="meta">
        Generado el {{ $generadoEn }} &nbsp;|&nbsp; Estado: <strong>{{ $estado }}</strong>
        @if($incluirConversaciones) &nbsp;|&nbsp; Incluye conversaciones de validación @endif
    </div>

    <div class="contenido">
        @foreach($secciones as $seccion)
            <div class="seccion">
                <h2>{{ $seccion['titulo'] }}</h2>
                <table class="campos">
                    @foreach($seccion['campos'] as $campo)
                        <tr>
                            <td class="etiqueta">{{ $campo['etiqueta'] }}</td>
                            <td class="valor">{{ $campo['valor'] !== '' ? $campo['valor'] : 'Sin registrar' }}</td>
                        </tr>
                    @endforeach
                </table>
            </div>
        @endforeach

        <div class="seccion">
            <h2>Documentos adjuntos</h2>
            @forelse($documentos as $documento)
                <div class="documento">{{ $documento }}</div>
            @empty
                <p class="vacio">No hay documentos adjuntos.</p>
            @endforelse
        </div>

        @if($incluirConversaciones)
            <div class="seccion">
                <h2>Conversaciones de validación</h2>
                @forelse($conversaciones as $conversacion)
                    <div class="conversacion">
                        <p class="autor">{{ $conversacion['autor'] }}</p>
                        <p class="decision">Respuesta: <strong>{{ $conversacion['decision'] }}</strong> &mdash; {{ $conversacion['fecha'] }}</p>
                        @if($conversacion['comentarios'])
                            <p class="texto">{{ $conversacion['comentarios'] }}</p>
                        @endif
                        @if($conversacion['respuesta_revisor'])
                            <p class="respuesta-revisor"><strong>Respuesta del equipo revisor:</strong><br>{{ $conversacion['respuesta_revisor'] }}</p>
                        @endif
                    </div>
                @empty
                    <p class="vacio">No hay conversaciones de validación registradas.</p>
                @endforelse
            </div>
        @endif
    </div>

    <div class="footer">Reporte generado por el sistema de gestión de casos &mdash; Somos Defensores</div>
</body>
</html>
