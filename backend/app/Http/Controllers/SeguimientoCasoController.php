<?php

namespace App\Http\Controllers;

use App\Mail\InvitacionSeguimientoCaso;
use App\Models\ayuda_humanitaria;
use App\Models\pasantia;
use App\Models\ProteccionColectiva;
use App\Models\SeguimientoCasoToken;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class SeguimientoCasoController extends Controller
{
    public function crear(Request $request, string $tipoCaso, string $casoId)
    {
        $caso = $this->buscarCaso($tipoCaso, $casoId);

        if (!$caso) {
            return response()->json(['message' => 'Caso no encontrado.'], 404);
        }

        if ($caso->estado !== 'aprobado') {
            return response()->json(['message' => 'Solo se puede enviar el seguimiento de un caso aprobado.'], 422);
        }

        $correoRepresentante = $caso->correo_victima ?? $caso->correo_electronico;
        $correosRevisores = User::query()
            ->whereHas('roles', fn ($query) => $query->whereIn('name', ['revisor', 'equipo revision de casos']))
            ->pluck('email')
            ->all();
        $correos = collect([$correoRepresentante, ...$correosRevisores])
            ->filter()
            ->unique()
            ->values();

        if ($correos->isEmpty()) {
            return response()->json(['message' => 'El caso no tiene un correo destinatario.'], 422);
        }

        $invitaciones = DB::transaction(function () use ($tipoCaso, $casoId, $correos) {
            SeguimientoCasoToken::where('tipo_caso', $tipoCaso)
                ->where('caso_id', $casoId)
                ->whereNull('used_at')
                ->update(['used_at' => now()]);

            return $correos->map(function (string $correo) use ($tipoCaso, $casoId) {
                $token = Str::random(64);
                $invitacion = SeguimientoCasoToken::create([
                    'tipo_caso' => $tipoCaso,
                    'caso_id' => $casoId,
                    'correo_destinatario' => $correo,
                    'token_hash' => hash('sha256', $token),
                    'expires_at' => now()->addDays(7),
                ]);

                return compact('token', 'invitacion');
            });
        });

        foreach ($invitaciones as $datosInvitacion) {
            $url = rtrim(config('app.frontend_url', 'http://localhost:3000'), '/') . '/seguimiento/' . $datosInvitacion['token'];
            Mail::to($datosInvitacion['invitacion']->correo_destinatario)
                ->send(new InvitacionSeguimientoCaso($url, $datosInvitacion['invitacion']->expires_at));
        }

        return response()->json([
            'message' => 'Las invitaciones de seguimiento fueron enviadas.',
            'destinatarios' => $correos->count(),
            'expires_at' => $invitaciones->first()['invitacion']->expires_at,
            'url' => rtrim(config('app.frontend_url', 'http://localhost:3000'), '/') . '/seguimiento/' . $invitaciones->first()['token'],
        ], 201);
    }

    public function enlace(string $tipoCaso, string $casoId)
    {
        $caso = $this->buscarCaso($tipoCaso, $casoId);

        if (!$caso) {
            return response()->json(['message' => 'Caso no encontrado.'], 404);
        }

        if ($caso->estado !== 'aprobado') {
            return response()->json(['message' => 'Solo se puede generar el enlace de seguimiento para un caso aprobado.'], 422);
        }

        $token = Str::random(64);
        $invitacion = SeguimientoCasoToken::create([
            'tipo_caso' => $tipoCaso,
            'caso_id' => $casoId,
            'correo_destinatario' => $caso->correo_victima ?? $caso->correo_electronico,
            'token_hash' => hash('sha256', $token),
            'expires_at' => now()->addDays(7),
        ]);

        return response()->json([
            'url' => rtrim(config('app.frontend_url', 'http://localhost:3000'), '/') . '/seguimiento/' . $token,
            'expires_at' => $invitacion->expires_at,
        ], 201);
    }

    public function validar(string $token)
    {
        $invitacion = $this->buscarInvitacionValida($token);

        if (!$invitacion) {
            return response()->json(['message' => 'El enlace no es válido, ya fue utilizado o expiró.'], 404);
        }

        $caso = $this->buscarCaso($invitacion->tipo_caso, $invitacion->caso_id);
        if (! $caso) {
            return response()->json(['message' => 'El caso ya no está disponible para seguimiento.'], 404);
        }

        return response()->json([
            'valido' => true,
            'expires_at' => $invitacion->expires_at,
        ]);
    }

    public function responder(Request $request, string $token)
    {
        $datos = $request->validate([
            'situacion_actual' => ['required', 'string', 'max:5000'],
            'apoyo_recibido' => ['nullable', 'string', 'max:100'],
            'descripcion_apoyo' => ['nullable', 'string', 'max:5000'],
            'situacion_seguridad' => ['nullable', 'string', 'max:100'],
            'comentarios' => ['nullable', 'string', 'max:5000'],
        ]);

        $respondido = DB::transaction(function () use ($token, $datos) {
            $invitacion = SeguimientoCasoToken::where('token_hash', hash('sha256', $token))
                ->whereNull('used_at')
                ->where('expires_at', '>', now())
                ->lockForUpdate()
                ->first();

            if (!$invitacion) {
                return false;
            }

            $invitacion->update([
                'used_at' => now(),
                'respuesta' => $datos,
            ]);

            SeguimientoCasoToken::where('tipo_caso', $invitacion->tipo_caso)
                ->where('caso_id', $invitacion->caso_id)
                ->whereNull('used_at')
                ->update(['used_at' => now()]);

            return true;
        });

        if (!$respondido) {
            return response()->json(['message' => 'El enlace no es válido, ya fue utilizado o expiró.'], 422);
        }

        return response()->json(['message' => 'El seguimiento fue registrado correctamente.']);
    }

    public function respuestas(string $tipoCaso, string $casoId)
    {
        return response()->json(
            SeguimientoCasoToken::where('tipo_caso', $tipoCaso)
                ->where('caso_id', $casoId)
                ->whereNotNull('respuesta')
                ->latest('used_at')
                ->get(['id', 'correo_destinatario', 'used_at', 'respuesta'])
        );
    }

    private function buscarInvitacionValida(string $token): ?SeguimientoCasoToken
    {
        return SeguimientoCasoToken::where('token_hash', hash('sha256', $token))
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->first();
    }

    private function buscarCaso(string $tipoCaso, string $casoId): ayuda_humanitaria|pasantia|ProteccionColectiva|null
    {
        return match ($tipoCaso) {
            'ayuda_humanitaria' => ayuda_humanitaria::find($casoId),
            'pasantia' => pasantia::find($casoId),
            'proteccion_colectiva' => ProteccionColectiva::find($casoId),
            default => null,
        };
    }
}
