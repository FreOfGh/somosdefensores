<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1f2937; line-height: 1.5; }

        .header { background-color: #92212a; color: #ffffff; padding: 16px 24px; border-bottom: 5px solid #ed5a0b; }
        .header table { width: 100%; }
        .header .logo { width: 56px; }
        .header .logo img { width: 48px; height: 48px; }
        .header h1 { font-size: 17px; }
        .header p { font-size: 10.5px; color: #f6dede; margin-top: 2px; }
        .header .estado { text-align: right; }
        .header .estado span { display: inline-block; padding: 4px 10px; background-color: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.5); border-radius: 3px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.4px; }

        .meta { padding: 8px 24px; background-color: #f5f5f5; border-bottom: 1px solid #e5e7eb; font-size: 9.5px; color: #4b5563; }

        .contenido { padding: 16px 24px; }
        .seccion { margin-bottom: 14px; page-break-inside: avoid; }
        .seccion h2 { background-color: #f3e4e5; color: #92212a; border-left: 4px solid #92212a; font-size: 10.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.4px; padding: 5px 10px; margin-bottom: 6px; }

        .grid { width: 100%; }
        .grid .celda { width: 50%; display: inline-block; vertical-align: top; padding: 3px 10px 3px 0; }
        .grid .celda.ancha { width: 100%; }
        .campo .etiqueta { font-size: 8.5px; font-weight: bold; text-transform: uppercase; color: #92212a; letter-spacing: 0.3px; }
        .campo .valor { font-size: 10.5px; white-space: pre-wrap; margin-top: 1px; }

        .documento { padding: 3px 10px; border-bottom: 1px solid #e5e7eb; font-size: 10px; }
        .conversacion { border-left: 3px solid #ed5a0b; background-color: #f9fafb; padding: 8px 10px; margin-bottom: 8px; }
        .conversacion .autor { font-weight: bold; font-size: 10px; }
        .conversacion .decision { font-size: 10px; margin: 2px 0; }
        .conversacion .texto { margin-top: 4px; white-space: pre-wrap; }
        .conversacion .respuesta-revisor { margin-top: 6px; padding-top: 6px; border-top: 1px dashed #d1d5db; }

        .vacio { color: #9ca3af; font-style: italic; }
        .mapa { text-align: center; }
        .mapa img { max-width: 100%; max-height: 320px; border: 1px solid #e5e7eb; }
        .footer { position: fixed; bottom: 12px; left: 24px; right: 24px; text-align: center; font-size: 8px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 4px; }
    </style>
</head>
<body>
    <div class="header">
        <table>
            <tr>
                @if(is_file($logoPath))
                    <td class="logo"><img src="{{ $logoPath }}" alt="Somos Defensores"></td>
                @endif
                <td>
                    <h1>Reporte del caso &mdash; {{ $tituloTipo }}</h1>
                    <p>{{ $nombreCaso }}</p>
                </td>
                <td class="estado"><span>{{ $estado }}</span></td>
            </tr>
        </table>
    </div>

    <div class="meta">
        Generado el {{ $generadoEn }}
        @if($incluirConversaciones) &nbsp;|&nbsp; Incluye conversaciones de validación @endif
    </div>

    <div class="contenido">
        @foreach($secciones as $seccion)
            <div class="seccion">
                <h2>{{ $seccion['titulo'] }}</h2>
                <div class="grid">
                    @foreach($seccion['campos'] as $campo)
                        <div class="celda {{ strlen($campo['valor']) > 80 || str_contains($campo['valor'], "\n") ? 'ancha' : '' }}">
                            <div class="campo">
                                <div class="etiqueta">{{ $campo['etiqueta'] }}</div>
                                <div class="valor">{{ $campo['valor'] !== '' ? $campo['valor'] : 'Sin registrar' }}</div>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        @endforeach

        @if($imagenMapa)
            <div class="seccion">
                <h2>Ubicación en el mapa</h2>
                <div class="mapa"><img src="{{ $imagenMapa }}" alt="Mapa de ubicación del caso"></div>
            </div>
        @endif

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
