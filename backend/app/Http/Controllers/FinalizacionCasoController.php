<?php

namespace App\Http\Controllers;

use App\Mail\InvitacionFinalizacionCaso;
use App\Models\ayuda_humanitaria;
use App\Models\FinalizacionCasoToken;
use App\Models\pasantia;
use App\Models\ProteccionColectiva;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class FinalizacionCasoController extends Controller
{
    public function crear(Request $request, string $tipoCaso, string $casoId)
    {
        $caso = $this->buscarCaso($tipoCaso, $casoId);

        if (!$caso) {
            return response()->json(['message' => 'Caso no encontrado.'], 404);
        }

        if ($caso->estado !== 'aprobado') {
            return response()->json(['message' => 'Solo se puede finalizar un caso aprobado.'], 422);
        }

        $seguimientoRespondido = \App\Models\SeguimientoCasoToken::where('tipo_caso', $tipoCaso)
            ->where('caso_id', $casoId)
            ->whereNotNull('respuesta')
            ->exists();

        if (! $seguimientoRespondido) {
            return response()->json(['message' => 'El formulario de seguimiento debe ser respondido antes de finalizar el caso.'], 422);
        }

        $correoRepresentante = $caso->correo_victima ?? $caso->correo_electronico;
        $correosRevisores = \App\Models\User::query()
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
            FinalizacionCasoToken::where('tipo_caso', $tipoCaso)
                ->where('caso_id', $casoId)
                ->whereNull('used_at')
                ->update(['used_at' => now()]);

            return $correos->map(function (string $correo) use ($tipoCaso, $casoId) {
                $token = Str::random(64);
                $invitacion = FinalizacionCasoToken::create([
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
            $url = rtrim(config('app.frontend_url', 'http://localhost:3000'), '/') . '/finalizacion/' . $datosInvitacion['token'];
            Mail::to($datosInvitacion['invitacion']->correo_destinatario)
                ->send(new InvitacionFinalizacionCaso($url, $datosInvitacion['invitacion']->expires_at));
        }

        $urlFinalizacion = rtrim(config('app.frontend_url', 'http://localhost:3000'), '/') . '/finalizacion/' . $invitaciones->first()['token'];

        return response()->json([
            'message' => 'Las invitaciones de finalización fueron enviadas.',
            'destinatarios' => $correos->count(),
            'expires_at' => $invitaciones->first()['invitacion']->expires_at,
            'url' => $urlFinalizacion,
        ], 201);
    }

    public function enlace(string $tipoCaso, string $casoId)
    {
        $caso = $this->buscarCaso($tipoCaso, $casoId);

        if (!$caso) {
            return response()->json(['message' => 'Caso no encontrado.'], 404);
        }

        if ($caso->estado !== 'aprobado') {
            return response()->json(['message' => 'Solo se puede generar el enlace de finalización para un caso aprobado.'], 422);
        }

        $token = Str::random(64);
        $invitacion = FinalizacionCasoToken::create([
            'tipo_caso' => $tipoCaso,
            'caso_id' => $casoId,
            'correo_destinatario' => $caso->correo_victima ?? $caso->correo_electronico,
            'token_hash' => hash('sha256', $token),
            'expires_at' => now()->addDays(7),
        ]);

        return response()->json([
            'url' => rtrim(config('app.frontend_url', 'http://localhost:3000'), '/') . '/finalizacion/' . $token,
            'expires_at' => $invitacion->expires_at,
        ], 201);
    }

    public function respuestas(string $tipoCaso, string $casoId)
    {
        return response()->json(
            FinalizacionCasoToken::where('tipo_caso', $tipoCaso)
                ->where('caso_id', $casoId)
                ->whereNotNull('respuesta')
                ->latest('used_at')
                ->get(['id', 'correo_destinatario', 'used_at', 'respuesta'])
        );
    }

    public function validar(string $token)
    {
        $invitacion = $this->buscarInvitacionValida($token);
        $invitacion = $this->buscarInvitacionValida($token);

        if (!$invitacion) {
            return response()->json(['message' => 'El enlace no es valido, ya fue utilizado o expiro.'], 404);
        }

        $caso = $this->buscarCaso($invitacion->tipo_caso, $invitacion->caso_id);
        if (! $caso || $caso->estado !== 'aprobado') {
            return response()->json(['message' => 'El caso ya no está disponible para finalizar.'], 404);
        }

        return response()->json([
            'valido' => true,
            'expires_at' => $invitacion->expires_at,
        ]);
    }

    public function finalizar(Request $request, string $token)
    {
        $data = $request->validate([
            'respuesta' => ['required', 'string', 'max:5000'],
        ]);

        $finalizado = DB::transaction(function () use ($token, $data) {
            $invitacion = FinalizacionCasoToken::where('token_hash', hash('sha256', $token))
                ->whereNull('used_at')
                ->where('expires_at', '>', now())
                ->lockForUpdate()
                ->first();

            if (!$invitacion) {
                return false;
            }

            $caso = $this->buscarCaso($invitacion->tipo_caso, $invitacion->caso_id);

            if (!$caso || $caso->estado !== 'aprobado') {
                return false;
            }

            $caso->estado = 'finalizado';
            $caso->save();

            $invitacion->update([
                'used_at' => now(),
                'respuesta' => $data['respuesta'],
            ]);
            FinalizacionCasoToken::where('tipo_caso', $invitacion->tipo_caso)
                ->where('caso_id', $invitacion->caso_id)
                ->whereNull('used_at')
                ->update(['used_at' => now()]);

            return true;
        });

        if (!$finalizado) {
            return response()->json(['message' => 'El enlace no es valido, ya fue utilizado o expiro.'], 422);
        }

        return response()->json(['message' => 'El caso fue finalizado correctamente.']);
    }

    private function buscarInvitacionValida(string $token): ?FinalizacionCasoToken
    {
        return FinalizacionCasoToken::where('token_hash', hash('sha256', $token))
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