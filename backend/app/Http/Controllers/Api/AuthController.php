<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:255'],
        ]);

        $superEmail = config('auth.super_user.email');
        $superPassword = config('auth.super_user.password');
        $esSuperUsuario = $superEmail && hash_equals(strtolower($superEmail), strtolower($credentials['email']));

        if ($esSuperUsuario && $superPassword && hash_equals($superPassword, $credentials['password'])) {
            Role::firstOrCreate(['name' => 'super usuario', 'guard_name' => 'web']);
            $user = User::query()->firstOrNew(['email' => $superEmail]);
            $user->name = $user->name ?: 'Superusuario';
            $user->password = $superPassword;
            $user->save();
            $user->syncRoles(['super usuario']);
        } else {
            $user = User::query()->where('email', $credentials['email'])->first();
        }

        if (! $esSuperUsuario && (! $user || ! Hash::check($credentials['password'], $user->password))) {
            throw ValidationException::withMessages([
                'email' => 'Credenciales invalidas.',
            ]);
        }

        if (! $user->hasAnyRole(['revisor', 'equipo revision de casos', 'super usuario'])) {
            throw ValidationException::withMessages([
                'email' => 'El usuario no tiene permisos para iniciar sesión.',
            ]);
        }

        $tokenName = $credentials['device_name'] ?? ($request->userAgent() ?: 'api');

        return response()->json([
            'token_type' => 'Bearer',
            'token' => $user->createToken($tokenName)->plainTextToken,
            'user' => $user->load('roles', 'permissions'),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()->load('roles', 'permissions'),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Sesion cerrada correctamente.',
        ]);
    }
}