<?php

namespace App\Http\Controllers\anon;

use App\Http\Controllers\Controller;
use App\Models\ProteccionColectiva;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ProteccionColectivaController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => ProteccionColectiva::latest()->get(),
        ]);
    }

    public function show(string $id)
    {
        $solicitud = ProteccionColectiva::find($id);

        if (! $solicitud) {
            return response()->json(['success' => false, 'message' => 'Solicitud no encontrada.'], 404);
        }

        return response()->json(['success' => true, 'data' => $solicitud]);
    }

    public function store(Request $request)
    {
        $datos = $request->validate($this->reglasFormulario());
        $solicitud = ProteccionColectiva::create($this->construirDatosCaso($datos));

        $correosRevisores = User::query()
            ->whereHas('roles', fn ($query) => $query->whereIn('name', ['revisor', 'equipo revision de casos']))
            ->pluck('email')
            ->unique()
            ->values()
            ->all();
        if ($correosRevisores) {
            Mail::raw('Se registró una nueva solicitud de protección colectiva.', function ($mensaje) use ($correosRevisores) {
                $mensaje->to($correosRevisores)->subject('Nueva solicitud de protección colectiva');
            });
        }

        return response()->json([
            'success' => true,
            'message' => 'Solicitud de protección colectiva creada correctamente.',
            'data' => $solicitud,
        ], 201);
    }

    public function update(Request $request, string $id)
    {
        $solicitud = ProteccionColectiva::find($id);

        if (! $solicitud) {
            return response()->json(['success' => false, 'message' => 'Solicitud no encontrada.'], 404);
        }

        if (in_array($solicitud->estado, ['aprobado', 'rechazado'], true)) {
            return response()->json(['success' => false, 'message' => 'No se puede modificar un caso aprobado o rechazado.'], 422);
        }

        $datos = $request->validate([
            'fecha_remision_caso' => ['sometimes', 'nullable', 'date'],
            'tiene_personeria_juridica' => ['sometimes', 'nullable', 'boolean'],
            'rut' => ['sometimes', 'nullable', 'string', 'max:100'],
            'nombre_organizacion' => ['sometimes', 'string', 'max:255'],
            'representante_legal' => ['sometimes', 'nullable', 'string'],
            'cc_representante' => ['sometimes', 'nullable', 'string', 'max:100'],
            'telefono' => ['sometimes', 'nullable', 'string', 'max:50'],
            'correo_electronico' => ['sometimes', 'nullable', 'email', 'max:255'],
            'departamento_municipio_vereda' => ['sometimes', 'nullable', 'string'],
            'descripcion_organizacion' => ['sometimes', 'nullable', 'string'],
            'trabajos_realizados' => ['sometimes', 'nullable', 'string'],
            'riesgos_seguridad_agresiones' => ['sometimes', 'nullable', 'string'],
            'medidas_proteccion_colectiva' => ['sometimes', 'nullable', 'string'],
            'justificacion_medidas' => ['sometimes', 'nullable', 'string'],
            'representante_nombre' => ['sometimes', 'nullable', 'string', 'max:255'],
            'representante_apellido' => ['sometimes', 'nullable', 'string', 'max:255'],
            'representante_tipo' => ['sometimes', 'nullable', 'string', 'max:100'],
            'cedula' => ['sometimes', 'nullable', 'string', 'max:100'],
            'correo' => ['sometimes', 'nullable', 'email', 'max:255'],
            'departamento' => ['sometimes', 'nullable', 'string', 'max:255'],
            'municipio' => ['sometimes', 'nullable', 'string', 'max:255'],
            'vereda' => ['sometimes', 'nullable', 'string', 'max:255'],
            'estructura_organizacion' => ['sometimes', 'nullable', 'string'],
            'reivindicaciones' => ['sometimes', 'nullable', 'string'],
            'derechos_defiende' => ['sometimes', 'nullable', 'string'],
            'trabajos_realiza' => ['sometimes', 'nullable', 'string'],
            'riesgos_seguridad' => ['sometimes', 'nullable', 'string'],
            'incidentes' => ['sometimes', 'nullable', 'string'],
            'afectacion_trabajo' => ['sometimes', 'nullable', 'string'],
            'actores_riesgo' => ['sometimes', 'nullable', 'string'],
            'medidas_proteccion' => ['sometimes', 'nullable', 'string'],
            'informacion_adicional' => ['sometimes', 'nullable', 'string'],
        ]);

        $solicitud->update($datos);

        return response()->json([
            'success' => true,
            'message' => 'Solicitud actualizada correctamente.',
            'data' => $solicitud->fresh(),
        ]);
    }

    public function cambiarEstado(Request $request, string $id)
    {
        $solicitud = ProteccionColectiva::find($id);

        if (! $solicitud) {
            return response()->json(['success' => false, 'message' => 'Solicitud no encontrada.'], 404);
        }

        $solicitud->update($request->validate(['estado' => ['required', 'string', 'max:255']]));

        return response()->json(['success' => true, 'data' => $solicitud]);
    }

    public function destroy(string $id)
    {
        $solicitud = ProteccionColectiva::find($id);

        if (! $solicitud) {
            return response()->json(['success' => false, 'message' => 'Solicitud no encontrada.'], 404);
        }

        $solicitud->delete();

        return response()->json(['success' => true, 'message' => 'Solicitud eliminada correctamente.']);
    }

    public function consultarPorToken(string $token)
    {
        $solicitud = ProteccionColectiva::where('token', $token)->first();

        return $solicitud
            ? response()->json(['success' => true, 'data' => $solicitud])
            : response()->json(['success' => false, 'message' => 'Solicitud no encontrada.'], 404);
    }

    private function reglasFormulario(): array
    {
        return [
            'fecha_remision_caso' => ['required', 'date'],
            'tiene_personeria_juridica' => ['required', 'boolean'],
            'rut' => ['nullable', 'string', 'max:100'],
            'nombre_organizacion' => ['required', 'string', 'max:255'],
            'representante_nombre' => ['required', 'string', 'max:255'],
            'representante_apellido' => ['required', 'string', 'max:255'],
            'representante_tipo' => ['nullable', 'string', 'max:100'],
            'cedula' => ['required', 'string', 'max:100'],
            'telefono' => ['required', 'string', 'max:50'],
            'correo' => ['required', 'email', 'max:255'],
            'departamento' => ['required', 'string', 'max:255'],
            'municipio' => ['required', 'string', 'max:255'],
            'vereda' => ['nullable', 'string', 'max:255'],
            'descripcion_organizacion' => ['required', 'string'],
            'estructura_organizacion' => ['nullable', 'string'],
            'reivindicaciones' => ['nullable', 'string'],
            'derechos_defiende' => ['nullable', 'string'],
            'trabajos_realiza' => ['required', 'string'],
            'riesgos_seguridad' => ['required', 'string'],
            'incidentes' => ['nullable', 'string'],
            'afectacion_trabajo' => ['nullable', 'string'],
            'actores_riesgo' => ['nullable', 'string'],
            'medidas_proteccion' => ['required', 'string'],
            'justificacion_medidas' => ['required', 'string'],
            'informacion_adicional' => ['nullable', 'string'],
        ];
    }

    private function construirDatosCaso(array $datos): array
    {
        return array_merge($datos, [
            'representante_legal' => trim($datos['representante_nombre'].' '.$datos['representante_apellido']),
            'cc_representante' => $datos['cedula'],
            'correo_electronico' => $datos['correo'],
            'departamento_municipio_vereda' => implode(', ', array_filter([
                $datos['departamento'], $datos['municipio'], $datos['vereda'],
            ])),
            'trabajos_realizados' => $datos['trabajos_realiza'],
            'riesgos_seguridad_agresiones' => $datos['riesgos_seguridad'],
            'medidas_proteccion_colectiva' => $datos['medidas_proteccion'],
            'estado' => 'pendiente de revisión',
        ]);
    }
}