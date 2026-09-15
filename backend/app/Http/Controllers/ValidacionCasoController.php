<?php

namespace App\Http\Controllers;

use App\Mail\InvitacionValidacionCaso;
use App\Models\ayuda_humanitaria;
use App\Models\pasantia;
use App\Models\ProteccionColectiva;
use App\Models\User;
use App\Models\ValidacionCasoInvitacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\URL;

class ValidacionCasoController extends Controller
{
    public function iniciar(Request $request, string $tipoCaso, string $casoId)
    {
        $caso = $this->buscarCaso($tipoCaso, $casoId);
        if (! $caso) return response()->json(['message' => 'Caso no encontrado.'], 404);
        if ($caso->estado !== 'pendiente de revisión') return response()->json(['message' => 'El caso solo puede iniciar validación desde pendiente de revisión.'], 422);

        $validadores = User::query()
            ->whereHas('roles', fn ($query) => $query->where('name', 'validador'))
            ->orderBy('name')
            ->limit(5)
            ->get();
        if ($validadores->isEmpty()) return response()->json(['message' => 'No hay validadores registrados.'], 422);

        $caso->update(['estado' => 'en proceso de validación']);
        foreach ($validadores as $validador) $this->crearInvitacion($tipoCaso, $caso->id, $validador);

        return response()->json(['message' => 'Validación iniciada y enlaces enviados.', 'validadores_notificados' => $validadores->count()]);
    }

    public function mostrar(string $token)
    {
        $invitacion = $this->buscarInvitacion($token);
        if (! $invitacion) return response()->json(['message' => 'El enlace no es válido o expiró.'], 404);
        $caso = $this->buscarCaso($invitacion->tipo_caso, $invitacion->caso_id);
        if (! $caso) return response()->json(['message' => 'Caso no encontrado.'], 404);

        $hilo = ValidacionCasoInvitacion::with('validador:id,name,email')
            ->where('tipo_caso', $invitacion->tipo_caso)
            ->where('caso_id', $invitacion->caso_id)
            ->whereNotNull('responded_at')
            ->orderBy('responded_at')
            ->get(['id', 'validador_id', 'decision', 'comentarios', 'respuesta_revisor', 'responded_at']);

        return response()->json([
            'caso' => $caso,
            'tipo_caso' => $invitacion->tipo_caso,
            'respondido' => (bool) $invitacion->responded_at,
            'respuesta_revisor' => $invitacion->respuesta_revisor,
            'documentos' => $this->documentosConUrl($caso, $token),
            'hilo' => $hilo,
        ]);
    }

    public function documento(Request $request, string $token, string $documento)
    {
        $invitacion = $this->buscarInvitacion($token);
        if (! $invitacion) abort(404);
        $caso = $this->buscarCaso($invitacion->tipo_caso, $invitacion->caso_id);
        $encontrado = collect($this->documentos($caso))->firstWhere('id', $documento);
        if (! $encontrado || ! Storage::disk('public')->exists($encontrado['path'])) abort(404);

        return $this->respuestaDocumento($encontrado, $request->boolean('descargar'));
    }

    public function documentoAdministrativo(Request $request, string $tipoCaso, string $casoId, string $documento)
    {
        $caso = $this->buscarCaso($tipoCaso, $casoId);
        if (! $caso) abort(404);
        $encontrado = collect($this->documentos($caso))->firstWhere('id', $documento);
        if (! $encontrado || ! Storage::disk('public')->exists($encontrado['path'])) abort(404);

        return $this->respuestaDocumento($encontrado, $request->boolean('descargar'));
    }

    private function respuestaDocumento(array $documento, bool $descargar)
    {
        $nombreArchivo = $documento['nombre'].'.'.pathinfo($documento['path'], PATHINFO_EXTENSION);

        return Storage::disk('public')->response($documento['path'], $descargar ? $nombreArchivo : null, [
            'Content-Disposition' => $descargar ? 'attachment; filename="'.$nombreArchivo.'"' : 'inline',
            'Cache-Control' => 'private, no-store',
        ]);
    }

    public function documentosAdministrativos(string $tipoCaso, string $casoId)
    {
        $caso = $this->buscarCaso($tipoCaso, $casoId);
        if (! $caso) return response()->json(['message' => 'Caso no encontrado.'], 404);

        return response()->json([
            'zip_url' => URL::temporarySignedRoute('admin.case.documents-zip', now()->addMinutes(10), [
                'tipoCaso' => $tipoCaso,
                'casoId' => $casoId,
            ]),
            'categorias' => $this->categoriasDocumentos($tipoCaso),
            'documentos' => array_map(fn ($documento) => [
                'id' => $documento['id'],
                'nombre' => $documento['nombre'],
                'url' => URL::temporarySignedRoute('admin.case.document-preview', now()->addMinutes(10), [
                    'tipoCaso' => $tipoCaso,
                    'casoId' => $casoId,
                    'documento' => $documento['id'],
                ]),
                'url_descarga' => URL::temporarySignedRoute('admin.case.document-preview', now()->addMinutes(10), [
                    'tipoCaso' => $tipoCaso,
                    'casoId' => $casoId,
                    'documento' => $documento['id'],
                    'descargar' => 1,
                ]),
            ], $this->documentos($caso)),
        ]);
    }

    public function agregarDocumentoAdministrativo(Request $request, string $tipoCaso, string $casoId)
    {
        $caso = $this->buscarCaso($tipoCaso, $casoId);
        if (! $caso) return response()->json(['message' => 'Caso no encontrado.'], 404);
        if (in_array($caso->estado, ['aprobado', 'rechazado'], true)) {
            return response()->json(['message' => 'No se pueden agregar documentos a un caso con decisión definitiva.'], 422);
        }

        $datos = $request->validate([
            'categoria' => ['required', 'string', 'in:' . implode(',', array_keys($this->categoriasDocumentos($tipoCaso)))],
            'archivo' => ['required', 'file', 'max:10240'],
        ]);

        $categoria = $datos['categoria'];
        $esMultiple = $this->categoriasDocumentos($tipoCaso)[$categoria] === 'multiple';
        $adjuntos = $caso->documentos_adjuntos ?? [];

        if (! $esMultiple && ! empty($adjuntos[$categoria])) {
            return response()->json(['message' => 'Esta categoría ya tiene un documento. Use la opción de resubir.'], 422);
        }

        $nuevaRuta = $request->file('archivo')->store("casos/{$tipoCaso}/{$casoId}", 'public');

        if ($esMultiple) {
            $adjuntos[$categoria] = array_values([...(array) ($adjuntos[$categoria] ?? []), $nuevaRuta]);
        } else {
            $adjuntos[$categoria] = $nuevaRuta;
        }

        $caso->update(['documentos_adjuntos' => $adjuntos]);
        return response()->json(['message' => 'Documento agregado correctamente.'], 201);
    }

    public function documentosZipAdministrativo(string $tipoCaso, string $casoId)
    {
        $caso = $this->buscarCaso($tipoCaso, $casoId);
        if (! $caso) abort(404);

        $documentos = collect($this->documentos($caso))
            ->filter(fn ($documento) => Storage::disk('public')->exists($documento['path']));
        if ($documentos->isEmpty()) abort(404);

        $rutaZip = tempnam(sys_get_temp_dir(), 'docs_');
        $zip = new \ZipArchive();
        $zip->open($rutaZip, \ZipArchive::OVERWRITE);
        $usados = [];

        foreach ($documentos as $documento) {
            $nombre = basename($documento['path']);
            if (isset($usados[$nombre])) {
                $nombre = pathinfo($nombre, PATHINFO_FILENAME).'_'.$documento['id'].'.'.pathinfo($nombre, PATHINFO_EXTENSION);
            }
            $usados[$nombre] = true;
            $zip->addFromString($nombre, Storage::disk('public')->get($documento['path']));
        }
        $zip->close();

        return response()->download($rutaZip, 'documentos_caso.zip', [
            'Content-Type' => 'application/zip',
        ])->deleteFileAfterSend(true);
    }

    public function reemplazarDocumentoAdministrativo(Request $request, string $tipoCaso, string $casoId, string $documento)
    {
        $caso = $this->buscarCaso($tipoCaso, $casoId);
        if (! $caso) return response()->json(['message' => 'Caso no encontrado.'], 404);
        if (in_array($caso->estado, ['aprobado', 'rechazado'], true)) {
            return response()->json(['message' => 'No se pueden modificar los documentos de un caso con decisión definitiva.'], 422);
        }

        $request->validate(['archivo' => ['required', 'file', 'max:10240']]);

        $adjuntos = $caso->documentos_adjuntos ?? [];
        $actualizado = false;

        foreach ($adjuntos as $campo => $valor) {
            $esArreglo = is_array($valor);
            $rutas = $esArreglo ? $valor : [$valor];

            foreach ($rutas as $indice => $path) {
                if (sha1($campo.'|'.$indice.'|'.$path) !== $documento) continue;

                if (Storage::disk('public')->exists($path)) Storage::disk('public')->delete($path);
                $nuevaRuta = $request->file('archivo')->store(dirname($path), 'public');

                if ($esArreglo) $adjuntos[$campo][$indice] = $nuevaRuta;
                else $adjuntos[$campo] = $nuevaRuta;

                $actualizado = true;
                break 2;
            }
        }

        if (! $actualizado) return response()->json(['message' => 'Documento no encontrado.'], 404);

        $caso->update(['documentos_adjuntos' => $adjuntos]);
        return response()->json(['message' => 'Documento reemplazado correctamente.']);
    }

    public function responder(Request $request, string $token)
    {
        $invitacion = $this->buscarInvitacion($token);
        if (! $invitacion || $invitacion->responded_at) return response()->json(['message' => 'El enlace no es válido, ya fue respondido o expiró.'], 422);
        $datos = $request->validate(['decision' => ['required', 'in:aprobado,rechazado,aclaracion'], 'comentarios' => ['nullable', 'string', 'max:5000']]);

        $invitacion->update(['decision' => $datos['decision'], 'comentarios' => $datos['comentarios'] ?? null, 'responded_at' => now()]);
        $revisores = User::role('revisor')->pluck('email')->all();
        if ($revisores) Mail::raw('Un validador respondió un caso de '.$invitacion->tipo_caso.'.', fn ($mail) => $mail->to($revisores)->subject('Respuesta de validación de caso'));

        $votos = $this->recalcularEstadoPorVotos($invitacion->tipo_caso, $invitacion->caso_id);

        return response()->json(['message' => 'Respuesta de validación registrada y revisores notificados.', 'votos' => $votos]);
    }

    private function recalcularEstadoPorVotos(string $tipoCaso, string $casoId): array
    {
        $caso = $this->buscarCaso($tipoCaso, $casoId);
        if (! $caso || $caso->estado !== 'en proceso de validación') {
            return ['aprobado' => 0, 'rechazado' => 0, 'aclaracion' => 0, 'pendientes' => 0, 'total' => 0];
        }

        $invitaciones = ValidacionCasoInvitacion::where('tipo_caso', $tipoCaso)
            ->where('caso_id', $casoId)
            ->get();

        // Un voto por validador: la respuesta más reciente
        $porValidador = $invitaciones->groupBy('validador_id')->map(fn ($grupo) => $grupo->sortByDesc('responded_at')->first());
        $respondidos = $porValidador->filter(fn ($inv) => $inv->responded_at !== null);

        $resumen = [
            'aprobado' => $respondidos->where('decision', 'aprobado')->count(),
            'rechazado' => $respondidos->where('decision', 'rechazado')->count(),
            'aclaracion' => $respondidos->where('decision', 'aclaracion')->count(),
            'pendientes' => $porValidador->count() - $respondidos->count(),
            'total' => $porValidador->count(),
        ];

        if ($resumen['pendientes'] === 0 && $resumen['total'] > 0) {
            if ($resumen['aprobado'] === $resumen['total']) {
                $caso->update(['estado' => 'aprobado']);
                $resumen['estado_resultante'] = 'aprobado';
            } elseif ($resumen['rechazado'] === $resumen['total']) {
                $caso->update(['estado' => 'rechazado']);
                $resumen['estado_resultante'] = 'rechazado';
            } else {
                $resumen['estado_resultante'] = 'en proceso de validación';
            }
        } else {
            $resumen['estado_resultante'] = 'en proceso de validación';
        }

        return $resumen;
    }

    public function historial(string $tipoCaso, string $casoId)
    {
        return response()->json(ValidacionCasoInvitacion::with('validador:id,name,email')
            ->where('tipo_caso', $tipoCaso)->where('caso_id', $casoId)->latest()->get());
    }

    public function exportarPdf(Request $request, string $tipoCaso, string $casoId)
    {
        $caso = $this->buscarCaso($tipoCaso, $casoId);
        if (! $caso) return response()->json(['message' => 'Caso no encontrado.'], 404);

        $incluirConversaciones = $request->boolean('conversaciones');

        $ocultos = ['id', 'token', 'documentos_adjuntos', 'created_at', 'updated_at', 'deleted_at', 'concepto_equipo_proteccion'];
        $atributos = collect($caso->getAttributes())->except($ocultos)->all();

        $secciones = [
            ['titulo' => 'Información del caso', 'campos' => $atributos],
        ];

        $seccionesPdf = [
            [
                'titulo' => $secciones[0]['titulo'],
                'campos' => collect($secciones[0]['campos'])->map(fn ($valor, $campo) => [
                    'etiqueta' => str_replace('_', ' ', $campo),
                    'valor' => is_array($valor) ? json_encode($valor, JSON_UNESCAPED_UNICODE) : (string) ($valor ?? ''),
                ])->values()->all(),
            ],
        ];

        $documentos = collect($this->documentos($caso))->map(fn ($documento) => str_replace('_', ' ', $documento['nombre']) . ' — ' . basename($documento['path']))->all();

        $conversaciones = [];
        if ($incluirConversaciones) {
            $conversaciones = ValidacionCasoInvitacion::with('validador:id,name,email')
                ->where('tipo_caso', $tipoCaso)->where('caso_id', $casoId)->latest()->get()
                ->map(fn ($invitacion) => [
                    'autor' => $invitacion->validador ? $invitacion->validador->name . ' (' . $invitacion->validador->email . ')' : 'Validador',
                    'decision' => $invitacion->decision === 'aclaracion' ? 'Solicita aclaración' : ($invitacion->decision ?? 'Pendiente'),
                    'fecha' => $invitacion->responded_at ? $invitacion->responded_at->format('d/m/Y H:i') : 'Sin responder',
                    'comentarios' => $invitacion->comentarios,
                    'respuesta_revisor' => $invitacion->respuesta_revisor,
                ])->all();
        }

        $nombreCaso = trim(($caso->nombre_victima ?? '') . ' ' . ($caso->apellido_victima ?? '')) ?: ($caso->nombre_organizacion ?? 'Caso');
        $tituloTipo = match ($tipoCaso) {
            'ayuda_humanitaria' => 'Ayuda humanitaria',
            'pasantia' => 'Pasantía',
            'proteccion_colectiva' => 'Protección colectiva',
            default => 'Caso',
        };

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.caso', [
            'tituloTipo' => $tituloTipo,
            'nombreCaso' => $nombreCaso,
            'estado' => $caso->estado,
            'generadoEn' => now()->format('d/m/Y H:i'),
            'secciones' => $seccionesPdf,
            'documentos' => $documentos,
            'incluirConversaciones' => $incluirConversaciones,
            'conversaciones' => $conversaciones,
        ])->setPaper('a4');

        $nombreArchivo = 'caso_' . \Illuminate\Support\Str::slug($nombreCaso ?: $casoId) . '.pdf';

        return $pdf->download($nombreArchivo);
    }

    public function responderValidador(Request $request, string $invitacionId)
    {
        $invitacion = ValidacionCasoInvitacion::with('validador')->find($invitacionId);
        if (! $invitacion || ! $invitacion->responded_at) return response()->json(['message' => 'Respuesta de validador no encontrada.'], 404);
        $datos = $request->validate(['respuesta_revisor' => ['required', 'string', 'max:5000']]);

        // La respuesta del revisor es general: se propaga a todas las invitaciones del caso
        ValidacionCasoInvitacion::where('tipo_caso', $invitacion->tipo_caso)
            ->where('caso_id', $invitacion->caso_id)
            ->update(['respuesta_revisor' => $datos['respuesta_revisor']]);

        // Se notifica con un nuevo enlace a todos los validadores que ya respondieron en el caso
        $validadores = User::whereIn('id',
            ValidacionCasoInvitacion::where('tipo_caso', $invitacion->tipo_caso)
                ->where('caso_id', $invitacion->caso_id)
                ->whereNotNull('responded_at')
                ->pluck('validador_id')
        )->get()->unique('id');

        $nueva = null;
        foreach ($validadores as $validador) {
            $creada = $this->crearInvitacion($invitacion->tipo_caso, $invitacion->caso_id, $validador, $datos['respuesta_revisor']);
            if ($validador->id === $invitacion->validador_id) $nueva = $creada;
        }

        return response()->json(['message' => 'Respuesta enviada a todos los validadores del caso.', 'invitacion_id' => $nueva?->id], 201);
    }

    public function decisionFinal(Request $request, string $tipoCaso, string $casoId)
    {
        $caso = $this->buscarCaso($tipoCaso, $casoId);
        if (! $caso) return response()->json(['message' => 'Caso no encontrado.'], 404);
        if ($caso->estado !== 'en proceso de validación') return response()->json(['message' => 'La decisión definitiva solo procede durante la validación.'], 422);
        $datos = $request->validate(['estado' => ['required', 'in:aprobado,rechazado']]);
        $caso->update(['estado' => $datos['estado']]);

        return response()->json(['message' => 'Decisión definitiva registrada.', 'caso' => $caso->fresh()]);
    }

    private function crearInvitacion(string $tipoCaso, string $casoId, User $validador, ?string $respuestaRevisor = null): ValidacionCasoInvitacion
    {
        $token = Str::random(64);
        $invitacion = ValidacionCasoInvitacion::create(['tipo_caso' => $tipoCaso, 'caso_id' => $casoId, 'validador_id' => $validador->id, 'token_hash' => hash('sha256', $token), 'expires_at' => now()->addDays(7), 'respuesta_revisor' => $respuestaRevisor]);
        $url = rtrim(config('app.frontend_url'), '/').'/validacion/'.$token;
        Mail::to($validador->email)->send(new InvitacionValidacionCaso($url, $tipoCaso, $respuestaRevisor));
        return $invitacion;
    }

    private function buscarInvitacion(string $token): ?ValidacionCasoInvitacion
    {
        return ValidacionCasoInvitacion::where('token_hash', hash('sha256', $token))->where('expires_at', '>', now())->first();
    }

    private function buscarCaso(string $tipoCaso, string $casoId): ayuda_humanitaria|pasantia|ProteccionColectiva|null
    {
        return match ($tipoCaso) { 'ayuda_humanitaria' => ayuda_humanitaria::find($casoId), 'pasantia' => pasantia::find($casoId), 'proteccion_colectiva' => ProteccionColectiva::find($casoId), default => null };
    }

    private function documentos($caso): array
    {
        $adjuntos = $caso->documentos_adjuntos ?? [];
        $documentos = [];
        foreach ($adjuntos as $campo => $valor) foreach ((array) $valor as $indice => $path) $documentos[] = ['id' => sha1($campo.'|'.$indice.'|'.$path), 'nombre' => $campo, 'path' => $path];
        return $documentos;
    }

    private function categoriasDocumentos(string $tipoCaso): array
    {
        return match ($tipoCaso) {
            'ayuda_humanitaria', 'pasantia' => [
                'certificacion_cuenta_bancaria' => 'individual',
                'documento_identidad' => 'individual',
                'carta_organizacion' => 'individual',
                'carta_aceptacion_pasantia' => 'individual',
                'evidencias_soportes' => 'multiple',
                'denuncias_organismos_estado' => 'multiple',
                'otros_documentos' => 'multiple',
            ],
            default => ['documentos_adjuntos' => 'multiple'],
        };
    }

    private function documentosConUrl($caso, string $token): array
    {
        return array_map(fn ($documento) => [
            'id' => $documento['id'],
            'nombre' => $documento['nombre'],
            'url' => url('/api/publico/validacion/'.$token.'/documentos/'.$documento['id']),
            'url_descarga' => url('/api/publico/validacion/'.$token.'/documentos/'.$documento['id'].'?descargar=1'),
        ], $this->documentos($caso));
    }
}