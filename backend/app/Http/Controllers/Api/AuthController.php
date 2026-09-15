<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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

        $user = User::query()->where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'Credenciales invalidas.',
            ]);
        }

        if (! $user->hasAnyRole(['revisor', 'equipo revision de casos'])) {
            throw ValidationException::withMessages([
                'email' => 'Solo los usuarios con rol revisor pueden iniciar sesión.',
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