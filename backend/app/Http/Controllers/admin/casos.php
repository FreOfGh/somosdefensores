<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ayuda_humanitaria;
use App\Mail\agregar_caso;
use App\Models\pasantia;
use App\Models\User;
use Illuminate\Support\Str;
use Ramsey\Uuid\Uuid;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use App\Support\CatalogoResolver;
use Symfony\Component\HttpFoundation\StreamedResponse;
class casos extends Controller
{

        public function listar_todas_las_pasantias(){
            $pasantias = pasantia::all();
            return response()->json($pasantias);
        }
        // listar las pasantias con determinado estado, por ejemplo "pendiente de revisión", "en proceso de validación", "rechazado", "aprobado", "esperando desembolso", "desembolsado", "en proceso de cierre", se debe lsitar de acuerdo al estado que se le pase por parametro
        public function listar_pasantias_por_estado($estado){
            $pasantias = pasantia::where('estado', $estado)->get();
            return response()->json($pasantias);
        }

        public function listar_todas_las_ayudas_humanitarias(){
            $ayudas_humanitarias = ayuda_humanitaria::all();
            return response()->json($ayudas_humanitarias);
        }
        // listar las ayudas humanitarias con determinado estado, por ejemplo "pendiente de revisión", "en proceso de validación", "rechazado", "aprobado", "esperando desembolso", "desembolsado", "en proceso de cierre"
        public function listar_ayudas_humanitarias_por_estado($estado){
            $ayudas_humanitarias = ayuda_humanitaria::where('estado', $estado)->get();
            return response()->json($ayudas_humanitarias);
        }

        public function agregar_caso_pasantia(Request $request){
            return $this->crearCasoIndividual($request, pasantia::class, true);
        }
        public function agregar_caso_ayuda_humanitaria(Request $request){
            return $this->crearCasoIndividual($request, ayuda_humanitaria::class, false);
        }

        private function crearCasoIndividual(Request $request, string $modelo, bool $esPasantia)
        {
            $agresiones = json_decode($request->input('agresiones', '[]'), true);
            $request->merge(['agresiones' => is_array($agresiones) ? $agresiones : null]);
            $this->normalizarCatalogosIndividual($request);

            $reglas = [
                'fecha_remision' => ['required', 'date'],
                'nombre_apellidos' => ['required', 'string', 'max:255'],
                'tipo_documento' => ['required', 'uuid', 'exists:catalogo_tipos_documento,id'],
                'cedula' => ['required', 'regex:/^\d+$/', 'max:20', 'unique:' . (new $modelo)->getTable() . ',numero_identificacion'],
                'edad' => ['required', 'integer', 'min:0', 'max:100'],
                'genero' => ['required', 'uuid', 'exists:catalogo_generos,id'],
                'telefono' => ['required', 'regex:/^\d+$/', 'max:20'],
                'correo' => ['required', 'email', 'max:255'],
                'procedencia_departamento' => ['required', 'uuid', 'exists:catalogo_departamentos,id'],
                'procedencia_municipio' => ['required', 'uuid', 'exists:catalogo_municipios,id'],
                'procedencia_vereda_comunidad' => ['nullable', 'string', 'max:255'],
                'procedencia_resguardo' => ['nullable', 'string', 'max:255'],
                'residencia_departamento' => ['required', 'uuid', 'exists:catalogo_departamentos,id'],
                'residencia_municipio' => ['required', 'uuid', 'exists:catalogo_municipios,id'],
                'residencia_vereda_comunidad' => ['nullable', 'string', 'max:255'],
                'residencia_resguardo' => ['nullable', 'string', 'max:255'],
                'agresiones' => ['required', 'array', 'min:1'],
                'agresiones.*.fecha_ocurrencia' => ['required', 'date'],
                'agresiones.*.departamento' => ['required', 'uuid', 'exists:catalogo_departamentos,id'],
                'agresiones.*.municipio' => ['required', 'uuid', 'exists:catalogo_municipios,id'],
                'agresiones.*.vereda_comunidad' => ['nullable', 'string', 'max:255'],
                'agresiones.*.resguardo' => ['nullable', 'string', 'max:255'],
                'agresiones.*.modalidad' => ['required', 'uuid', 'exists:catalogo_modalidades_agresion,id'],
                'agresiones.*.descripcion' => ['required', 'string'],
                'agresiones.*.motivos' => ['required', 'string'],
                'agresiones.*.presunto_responsable' => ['required', 'string'],
                'agresiones.*.presunto_responsable_descripcion' => ['nullable', 'string'],
                'grupo_etnico' => ['nullable', 'uuid', 'exists:catalogo_grupos_poblacionales,id'],
                'tiene_discapacidad' => ['nullable', 'uuid', 'exists:catalogo_respuestas_binarias,id'],
                'cual_discapacidad' => ['nullable', 'string'],
                'tiene_condicion_salud' => ['nullable', 'uuid', 'exists:catalogo_respuestas_binarias,id'],
                'cual_condicion_salud' => ['nullable', 'string'],
                'nombre_organizacion' => ['required', 'string', 'max:255'],
                'tipo_liderazgo' => ['required', 'uuid', 'exists:catalogo_tipo_liderazgo,id'],
                'tipo_liderazgo_otro' => ['nullable', 'string', 'max:255'],
                'organizacion_remite' => ['required', 'string', 'max:255'],
                'persona_organizacion_nombre' => ['nullable', 'string', 'max:255'],
                'persona_organizacion_correo' => ['nullable', 'email', 'max:255'],
                'persona_organizacion_celular' => ['nullable', 'string', 'max:50'],
                'estado_civil' => ['nullable', 'uuid', 'exists:catalogo_estados_civiles,id'],
                'otra_composicion_familiar' => ['nullable', 'string'],
                'tiene_hijos' => ['nullable', 'uuid', 'exists:catalogo_respuestas_binarias,id'],
                'numero_hijos' => ['nullable', 'integer', 'min:0', 'max:99'],
                'edades_hijos' => ['nullable', 'json'],
                'personas_conviven' => ['nullable', 'json'],
                'total_grupo_familiar' => ['nullable', 'integer', 'min:0', 'max:999'],
                'certificacion_cuenta_bancaria' => ['required', 'file', 'max:10240'],
                'documento_identidad' => ['required', 'file', 'max:10240'],
                'carta_organizacion' => ['required', 'file', 'max:10240'],
                'evidencias_soportes.*' => ['file', 'max:10240'],
                'denuncias_organismos_estado.*' => ['file', 'max:10240'],
                'otros_documentos.*' => ['file', 'max:10240'],
            ];

            if ($esPasantia) {
                $reglas['tipo_pasantia'] = ['required', 'uuid', 'exists:catalogo_tipo_pasantia,id'];

                if (($request->input('tipo_pasantia') ?? '') !== 'internacional') {
                    $reglas['carta_aceptacion_pasantia'] = [
                        'required',
                        'file',
                        'max:10240',
                    ];
                }
            }

            if (($request->input('tipo_liderazgo') ?? '') === 'otro') {
                $reglas['tipo_liderazgo_otro'] = ['required', 'string', 'max:255'];
            }

            $datos = $request->validate($reglas);
            [$nombre, $apellido] = array_pad(preg_split('/\s+/', trim($datos['nombre_apellidos']), 2), 2, '');
            $id = Uuid::uuid4()->toString();
            $documentos = $this->guardarDocumentos($request, $esPasantia ? 'pasantia' : 'ayuda_humanitaria', $id);

            $campos = Arr::only($datos, [
                'fecha_remision', 'edad', 'genero', 'grupo_etnico', 'tiene_discapacidad',
                'cual_discapacidad', 'tiene_condicion_salud', 'cual_condicion_salud',
                'tipo_documento',
                'procedencia_departamento', 'procedencia_municipio',
                'procedencia_vereda_comunidad', 'procedencia_resguardo',
                'residencia_departamento', 'residencia_municipio',
                'residencia_vereda_comunidad', 'residencia_resguardo',
                'nombre_organizacion', 'tipo_liderazgo', 'tipo_liderazgo_otro', 'organizacion_remite',
                'persona_organizacion_nombre', 'persona_organizacion_correo',
                'persona_organizacion_celular', 'agresiones', 'tipo_pasantia',
                'estado_civil', 'otra_composicion_familiar', 'tiene_hijos', 'numero_hijos',
                'edades_hijos', 'personas_conviven',
                'total_grupo_familiar', 'fecha_lugar_descripcion_caso',
                'riesgo_motivos_amenaza',
            ]);

            foreach (['edades_hijos', 'personas_conviven'] as $campoJson) {
                if (isset($campos[$campoJson]) && is_string($campos[$campoJson])) {
                    $campos[$campoJson] = json_decode($campos[$campoJson], true);
                }
            }

            $caso = $modelo::create(array_merge($campos, [
                'id' => $id,
                'nombre_victima' => $nombre,
                'apellido_victima' => $apellido,
                'numero_identificacion' => $datos['cedula'],
                'correo_victima' => $datos['correo'],
                'numero_whatsapp' => $datos['telefono'],
                'estado' => 'pendiente de revisión',
                'token' => Str::random(32),
                'documentos_adjuntos' => $documentos,
            ]));

            $this->notificarRevisores($esPasantia ? 'pasantía' : 'ayuda humanitaria');

            return response()->json($caso, 201);
        }

        private function normalizarCatalogosIndividual(Request $request): void
        {
            $campos = [
                'tipo_documento' => 'catalogo_tipos_documento',
                'genero' => 'catalogo_generos',
                'grupo_etnico' => 'catalogo_grupos_poblacionales',
                'tiene_discapacidad' => 'catalogo_respuestas_binarias',
                'tiene_condicion_salud' => 'catalogo_respuestas_binarias',
                'procedencia_departamento' => 'catalogo_departamentos',
                'procedencia_municipio' => 'catalogo_municipios',
                'residencia_departamento' => 'catalogo_departamentos',
                'residencia_municipio' => 'catalogo_municipios',
                'tipo_liderazgo' => 'catalogo_tipo_liderazgo',
                'estado_civil' => 'catalogo_estados_civiles',
                'tiene_hijos' => 'catalogo_respuestas_binarias',
                'tipo_pasantia' => 'catalogo_tipo_pasantia',
            ];

            foreach ($campos as $campo => $tabla) {
                $valor = $request->input($campo);
                if (!$valor || preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', (string) $valor)) {
                    continue;
                }

                $consulta = DB::table($tabla)->whereRaw('LOWER(nombre) = LOWER(?)', [$valor]);
                if ($tabla !== 'catalogo_municipios') {
                    $consulta->orWhereRaw('LOWER(codigo) = LOWER(?)', [$valor]);
                }
                $id = $consulta->value('id');
                if ($id) {
                    $request->merge([$campo => $id]);
                }
            }

            $agresiones = $request->input('agresiones');
            if (!is_array($agresiones)) {
                return;
            }

            $agresiones = array_map(function (array $agresion): array {
                foreach (['departamento' => 'catalogo_departamentos', 'municipio' => 'catalogo_municipios', 'modalidad' => 'catalogo_modalidades_agresion'] as $campo => $tabla) {
                    $valor = $agresion[$campo] ?? null;
                    if (!$valor || preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', (string) $valor)) {
                        continue;
                    }
                    $consulta = DB::table($tabla)->whereRaw('LOWER(nombre) = LOWER(?)', [$valor]);
                    if ($tabla !== 'catalogo_municipios') {
                        $consulta->orWhereRaw('LOWER(codigo) = LOWER(?)', [$valor]);
                    }
                    $id = $consulta->value('id');
                    if ($id) $agresion[$campo] = $id;
                }
                return $agresion;
            }, $agresiones);

            $request->merge(['agresiones' => $agresiones]);
        }

        private function notificarRevisores(string $tipoCaso): void
        {
            $correos = User::query()
                ->whereHas('roles', fn ($query) => $query->whereIn('name', ['revisor', 'equipo revision de casos']))
                ->pluck('email')
                ->unique()
                ->values()
                ->all();

            if ($correos) {
                Mail::raw('Se registró un nuevo caso de '.$tipoCaso.'.', function ($mensaje) use ($correos, $tipoCaso) {
                    $mensaje->to($correos)->subject('Nuevo caso de '.$tipoCaso);
                });
            }
        }

        private function guardarDocumentos(Request $request, string $tipoCaso, string $casoId): array
        {
            $documentos = [];
            foreach (['certificacion_cuenta_bancaria', 'documento_identidad', 'carta_organizacion', 'carta_aceptacion_pasantia'] as $campo) {
                if ($request->hasFile($campo)) {
                    $documentos[$campo] = $request->file($campo)->store("casos/{$tipoCaso}/{$casoId}", 'public');
                }
            }

            foreach (['evidencias_soportes', 'denuncias_organismos_estado', 'otros_documentos'] as $campo) {
                if ($request->hasFile($campo)) {
                    $documentos[$campo] = array_map(
                        fn ($archivo) => $archivo->store("casos/{$tipoCaso}/{$casoId}", 'public'),
                        $request->file($campo)
                    );
                }
            }

            return $documentos;
        }

        public function actualizar_estado_pasantia(Request $request, $id){
            return response()->json(['message' => 'El estado debe cambiarse mediante el flujo de validación.'], 422);
        }
        public function actualizar_estado_ayuda_humanitaria(Request $request, $id){
            return response()->json(['message' => 'El estado debe cambiarse mediante el flujo de validación.'], 422);
        }

        public function obtener_ayuda_humanitaria($id){
            $caso = ayuda_humanitaria::find($id);
            return $caso ? response()->json($caso) : response()->json(['message' => 'Ayuda humanitaria no encontrada'], 404);
        }

        public function actualizar_ayuda_humanitaria(Request $request, $id){
            $caso = ayuda_humanitaria::find($id);
            if (!$caso) return response()->json(['message' => 'Ayuda humanitaria no encontrada'], 404);
            if ($caso->estado === 'finalizado') {
                return response()->json(['message' => 'No se puede modificar un caso finalizado.'], 422);
            }
            if (in_array($caso->estado, ['aprobado', 'rechazado'], true)) {
                $permitidos = array_intersect_key($request->only($caso->getFillable()), array_flip(['seguimiento', 'documentos_adjuntos']));
                if (empty($permitidos)) {
                    return response()->json(['message' => 'En un caso aprobado o rechazado solo se puede modificar el seguimiento.'], 422);
                }
                $caso->update($permitidos);
                return response()->json($caso->fresh());
            }
            $caso->update(Arr::except($request->only($caso->getFillable()), ['id', 'token', 'estado']));
            return response()->json($caso->fresh());
        }

        public function obtener_pasantia($id){
            $caso = pasantia::find($id);
            return $caso ? response()->json($caso) : response()->json(['message' => 'Pasantía no encontrada'], 404);
        }

        public function actualizar_pasantia(Request $request, $id){
            $caso = pasantia::find($id);
            if (!$caso) return response()->json(['message' => 'Pasantía no encontrada'], 404);
            if ($caso->estado === 'finalizado') {
                return response()->json(['message' => 'No se puede modificar un caso finalizado.'], 422);
            }
            if (in_array($caso->estado, ['aprobado', 'rechazado'], true)) {
                $permitidos = array_intersect_key($request->only($caso->getFillable()), array_flip(['seguimiento', 'documentos_adjuntos']));
                if (empty($permitidos)) {
                    return response()->json(['message' => 'En un caso aprobado o rechazado solo se puede modificar el seguimiento.'], 422);
                }
                $caso->update($permitidos);
                return response()->json($caso->fresh());
            }
            $caso->update(Arr::except($request->only($caso->getFillable()), ['id', 'token', 'estado']));
            return response()->json($caso->fresh());
        }

        public function eliminar_pasantia($id){
            $pasantia = pasantia::find($id);
            if(!$pasantia){
                return response()->json(['message' => 'Pasantía no encontrada'], 404);
                }
            $pasantia->delete();
            return response()->json(['message' => 'Pasantía eliminada exitosamente']);
        }

        private const CAMPOS_OCULTOS_EXPORTACION = ['token', 'documentos_adjuntos', 'deleted_at', 'concepto_equipo_proteccion'];

        private const ETIQUETAS_EXPORTACION = [
            'id' => 'ID', 'created_at' => 'Fecha de registro', 'updated_at' => 'Última actualización',
            'nombre_victima' => 'Nombres', 'apellido_victima' => 'Apellidos', 'tipo_documento' => 'Tipo de documento',
            'numero_identificacion' => 'Número de identificación', 'edad' => 'Edad', 'genero' => 'Género',
            'correo_victima' => 'Correo electrónico', 'numero_whatsapp' => 'Teléfono', 'estado' => 'Estado',
            'grupo_etnico' => 'Grupo étnico', 'tiene_discapacidad' => 'Condición de discapacidad',
            'cual_discapacidad' => '¿Cuál discapacidad?', 'tiene_condicion_salud' => 'Condición especial en salud',
            'cual_condicion_salud' => '¿Cuál condición de salud?', 'estado_civil' => 'Estado civil',
            'otra_composicion_familiar' => 'Otro estado civil', 'tiene_hijos' => '¿Tiene hijos/as?',
            'numero_hijos' => 'Número de hijos/as', 'edades_hijos' => 'Edades de los hijos/as',
            'personas_conviven' => 'Personas que viven con el solicitante', 'total_grupo_familiar' => 'Total grupo familiar',
            'nombre_organizacion' => 'Organización a la cual pertenece', 'organizacion_remite' => 'Organización que remite',
            'persona_organizacion_nombre' => 'Persona que remite (nombre)', 'persona_organizacion_correo' => 'Persona que remite (correo)',
            'persona_organizacion_celular' => 'Persona que remite (celular)', 'motivo_solicitud' => 'Motivo de solicitud',
            'tipo_pasantia' => 'Tipo de pasantía', 'fecha_remision' => 'Fecha de remisión',
            'fecha_lugar_descripcion_caso' => 'Descripción del caso', 'riesgo_motivos_amenaza' => 'Riesgos y amenazas',
            'seguimiento' => 'Seguimiento', 'pago_unico' => 'Pago único', 'primer_pago' => 'Primer pago',
            'segundo_pago' => 'Segundo pago', 'tercer_pago' => 'Tercer pago',
            'procedencia_departamento' => 'Procedencia: departamento', 'procedencia_municipio' => 'Procedencia: municipio',
            'procedencia_vereda_comunidad' => 'Procedencia: vereda/comunidad', 'procedencia_resguardo' => 'Procedencia: consejo comunitario',
            'residencia_departamento' => 'Residencia: departamento', 'residencia_municipio' => 'Residencia: municipio',
            'residencia_vereda_comunidad' => 'Residencia: vereda/comunidad', 'residencia_resguardo' => 'Residencia: consejo comunitario',
            'nombre_organizacion_colectiva' => 'Organización', 'representante_nombre' => 'Representante (nombre)',
            'representante_apellido' => 'Representante (apellido)', 'correo_electronico' => 'Correo',
        ];

        private function modeloPorTipo(string $tipoCaso)
        {
            return match ($tipoCaso) {
                'ayuda_humanitaria' => new ayuda_humanitaria(),
                'pasantia' => new pasantia(),
                'proteccion_colectiva' => new \App\Models\ProteccionColectiva(),
                default => null,
            };
        }

        public function camposExportacion($tipoCaso){
            $modelo = $this->modeloPorTipo($tipoCaso);
            if (!$modelo) return response()->json(['message' => 'Tipo de caso no válido'], 400);

            $campos = collect($modelo->getFillable())
                ->reject(fn ($campo) => in_array($campo, self::CAMPOS_OCULTOS_EXPORTACION, true))
                ->map(fn ($campo) => ['campo' => $campo, 'etiqueta' => self::ETIQUETAS_EXPORTACION[$campo] ?? ucfirst(str_replace('_', ' ', $campo))])
                ->values()
                ->all();

            return response()->json($campos);
        }

        public function exportarCsv(Request $request, $tipoCaso){
            $modelo = $this->modeloPorTipo($tipoCaso);
            if (!$modelo) return response()->json(['message' => 'Tipo de caso no válido'], 400);

            $camposPermitidos = collect($modelo->getFillable())->reject(fn ($campo) => in_array($campo, self::CAMPOS_OCULTOS_EXPORTACION, true))->values();
            $camposSeleccionados = collect($request->input('campos', []))->filter(fn ($campo) => $camposPermitidos->contains($campo))->values();
            if ($camposSeleccionados->isEmpty()) $camposSeleccionados = $camposPermitidos;

            $query = $modelo->newQuery();
            if ($request->filled('fecha_inicio')) $query->whereDate('created_at', '>=', $request->input('fecha_inicio'));
            if ($request->filled('fecha_fin')) $query->whereDate('created_at', '<=', $request->input('fecha_fin'));

            $encabezados = $camposSeleccionados->map(fn ($campo) => self::ETIQUETAS_EXPORTACION[$campo] ?? ucfirst(str_replace('_', ' ', $campo)))->all();
            $nombreArchivo = 'casos_' . $tipoCaso . '_' . now()->format('Ymd_His') . '.csv';

            return new StreamedResponse(function () use ($query, $camposSeleccionados, $encabezados) {
                $salida = fopen('php://output', 'w');
                fwrite($salida, "\xEF\xBB\xBF");
                fputcsv($salida, $encabezados, ';');
                $query->orderBy('created_at')->chunk(200, function ($casos) use ($salida, $camposSeleccionados) {
                    foreach ($casos as $caso) {
                        fputcsv($salida, $camposSeleccionados->map(function ($campo) use ($caso) {
                            $valor = $caso->{$campo};
                            if ($campo === 'agresiones' && is_array($valor)) {
                                $valor = array_map([CatalogoResolver::class, 'resolverAgresion'], $valor);
                            } else {
                                $valor = CatalogoResolver::resolver($campo, $valor);
                            }
                            if (is_array($valor)) return json_encode($valor, JSON_UNESCAPED_UNICODE);
                            if ($valor instanceof \DateTimeInterface) return $valor->format('Y-m-d H:i');
                            return $valor ?? '';
                        })->all(), ';');
                    }
                });
                fclose($salida);
            }, 200, [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => 'attachment; filename="' . $nombreArchivo . '"',
            ]);
        }

        private const CAMPOS_GRAFICABLES = [
            'estado', 'tipo_documento', 'genero', 'grupo_etnico', 'tiene_discapacidad',
            'tiene_condicion_salud', 'estado_civil', 'tiene_hijos', 'edad', 'numero_hijos',
            'total_grupo_familiar', 'procedencia_departamento', 'procedencia_municipio',
            'residencia_departamento', 'residencia_municipio', 'nombre_organizacion',
            'organizacion_remite', 'tipo_pasantia', 'pago_unico', 'primer_pago',
            'segundo_pago', 'tercer_pago', 'created_at',
        ];

        public function camposGraficos($tipoCaso){
            $modelo = $this->modeloPorTipo($tipoCaso);
            if (!$modelo) return response()->json(['message' => 'Tipo de caso no válido'], 400);

            $campos = collect(self::CAMPOS_GRAFICABLES)
                ->filter(fn ($campo) => in_array($campo, $modelo->getFillable(), true) || $campo === 'created_at')
                ->map(fn ($campo) => ['campo' => $campo, 'etiqueta' => self::ETIQUETAS_EXPORTACION[$campo] ?? ucfirst(str_replace('_', ' ', $campo))])
                ->values()
                ->all();

            return response()->json($campos);
        }

        private const MAX_CAMPOS_CRUCE = 3;
        private const MAX_FILTROS = 5;

        public function valoresCampo(Request $request, $tipoCaso){
            $modelo = $this->modeloPorTipo($tipoCaso);
            if (!$modelo) return response()->json(['message' => 'Tipo de caso no válido'], 400);

            $permitidos = collect(self::CAMPOS_GRAFICABLES)->filter(fn ($campo) => in_array($campo, $modelo->getFillable(), true) || $campo === 'created_at')->values();
            $campo = $request->input('campo');
            if (!$campo || !$permitidos->contains($campo) || $campo === 'created_at') {
                return response()->json(['message' => 'Campo no válido.'], 422);
            }

            $valores = $modelo->newQuery()
                ->whereNotNull($campo)
                ->where($campo, '!=', '')
                ->distinct()
                ->orderBy($campo)
                ->limit(200)
                ->pluck($campo)
                ->values();

            $opciones = $valores
                ->map(fn ($valor) => ['valor' => $valor, 'etiqueta' => CatalogoResolver::resolver($campo, $valor)])
                ->sortBy('etiqueta')
                ->values()
                ->all();

            return response()->json($opciones);
        }

        public function datosGrafico(Request $request, $tipoCaso){
            $modelo = $this->modeloPorTipo($tipoCaso);
            if (!$modelo) return response()->json(['message' => 'Tipo de caso no válido'], 400);

            $permitidos = collect(self::CAMPOS_GRAFICABLES)->filter(fn ($campo) => in_array($campo, $modelo->getFillable(), true) || $campo === 'created_at')->values();
            $campo = $request->input('campo');

            $cruces = collect(explode(',', (string) $request->input('cruce', '')))
                ->map(fn ($valor) => trim($valor))
                ->filter(fn ($valor) => $valor !== '' && $valor !== $campo && $permitidos->contains($valor))
                ->unique()
                ->values()
                ->take(self::MAX_CAMPOS_CRUCE);

            if (!$campo || !$permitidos->contains($campo)) {
                return response()->json(['message' => 'Campo no válido para graficar.'], 422);
            }

            $filtros = collect(json_decode((string) $request->input('filtros', '[]'), true) ?: [])
                ->filter(fn ($filtro) => is_array($filtro) && !empty($filtro['campo']) && isset($filtro['valor']) && $filtro['valor'] !== '' && $permitidos->contains($filtro['campo']) && $filtro['campo'] !== 'created_at')
                ->take(self::MAX_FILTROS);

            $query = $modelo->newQuery();
            if ($request->filled('fecha_inicio')) $query->whereDate('created_at', '>=', $request->input('fecha_inicio'));
            if ($request->filled('fecha_fin')) $query->whereDate('created_at', '<=', $request->input('fecha_fin'));
            foreach ($filtros as $filtro) {
                $query->where($filtro['campo'], $filtro['valor']);
            }

            $expresion = fn (string $columna) => $columna === 'created_at'
                ? "to_char(created_at, 'YYYY-MM')"
                : "coalesce(nullif({$columna}::text, ''), 'Sin registrar')";

            if ($cruces->isNotEmpty()) {
                $columnasCruce = $cruces->values()->map(fn ($campoDeSerie, $indice) => $expresion($campoDeSerie) . " as cruce{$indice}")->implode(', ');
                $gruposPorPosicion = implode(', ', range(1, $cruces->count() + 1));

                $filas = $query->selectRaw($expresion($campo) . ' as categoria, ' . $columnasCruce . ', count(*) as total')
                    ->groupByRaw($gruposPorPosicion)
                    ->orderBy('categoria')
                    ->get();

                $cruceCampos = $cruces->values()->all();
                $filas = $filas->map(function ($fila) use ($campo, $cruceCampos) {
                    $fila->categoria = CatalogoResolver::resolver($campo, $fila->categoria);
                    $fila->serie = collect($cruceCampos)
                        ->map(fn ($campoDeSerie, $indice) => CatalogoResolver::resolver($campoDeSerie, $fila->{"cruce{$indice}"}))
                        ->implode(' / ');
                    return $fila;
                });

                $series = $filas->pluck('serie')->unique()->values()->all();
                $datos = $filas->groupBy('categoria')->map(fn ($grupo, $categoria) => array_merge(
                    ['categoria' => $categoria],
                    collect($series)->mapWithKeys(fn ($serie) => [$serie => (int) $grupo->filter(fn ($fila) => $fila->serie === $serie)->sum('total')])->all()
                ))->values()->all();

                return response()->json(['datos' => $datos, 'series' => $series]);
            }

            $datos = $query->selectRaw($expresion($campo) . ' as categoria, count(*) as total')
                ->groupByRaw('1')
                ->orderByDesc('total')
                ->limit(30)
                ->get()
                ->map(fn ($fila) => ['categoria' => CatalogoResolver::resolver($campo, $fila->categoria), 'total' => (int) $fila->total])
                ->groupBy('categoria')
                ->map(fn ($grupo, $categoria) => ['categoria' => $categoria, 'total' => (int) $grupo->sum('total')])
                ->sortByDesc('total')
                ->values()
                ->all();

            return response()->json(['datos' => $datos, 'series' => ['total']]);
        }

        public function eliminar_ayuda_humanitaria($id){
            $ayuda_humanitaria = ayuda_humanitaria::find($id);
            if(!$ayuda_humanitaria){
                return response()->json(['message' => 'Ayuda humanitaria no encontrada'], 404);            }
            $ayuda_humanitaria->delete();
            return response()->json(['message' => 'Ayuda humanitaria eliminada exitosamente']);
        }

        public function obtener_pasantia_por_id($id){
            $pasantia = pasantia::find($id);
            if(!$pasantia){
                return response()->json(['message' => 'Pasantía no encontrada'], 404);
            }
            return response()->json($pasantia);
        }
        
        public function obtener_ayuda_humanitaria_por_id($id){
            $ayuda_humanitaria = ayuda_humanitaria::find($id);
            if(!$ayuda_humanitaria){
                return response()->json(['message' => 'Ayuda humanitaria no encontrada'], 404);
            }
            return response()->json($ayuda_humanitaria);
        }

        public function validar_token_pasantia($token){
            $pasantia = pasantia::where('token', $token)->first();
            if(!$pasantia){
                return response()->json(['message' => 'Token de pasantía no válido'], 404);
            }
            return response()->json($pasantia);
        }
        public function validar_token_ayuda_humanitaria($token){
            $ayuda_humanitaria = ayuda_humanitaria::where('token', $token)->first();
            if(!$ayuda_humanitaria){
                return response()->json(['message' => 'Token de ayuda humanitaria no válido'],404);
            }
            return response()->json($ayuda_humanitaria);
        }

        public function obtener_caso_por_token($token, $tipo_caso){
            if($tipo_caso === 'pasantia'){
                $pasantia = pasantia::where('token', $token)->first();
                if(!$pasantia){
                    return response()->json(['message' => 'Token de pasantía no válido'], 404);
                }
                return response()->json($pasantia);
            } elseif($tipo_caso === 'ayuda_humanitaria'){
                $ayuda_humanitaria = ayuda_humanitaria::where('token', $token)->first();
                if(!$ayuda_humanitaria){
                    return response()->json(['message' => 'Token de ayuda humanitaria no válido'], 404);
                }
                return response()->json($ayuda_humanitaria);
            } else {
                return response()->json(['message' => 'Tipo de caso no válido'], 400);
            }
        }



}
