<?php

namespace App\Http\Controllers\admin\ajustes;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
class usuarios extends Controller
{
    public function crear_usuario(Request $request){
        $datos = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'rol' => ['required', 'in:validador,revisor'],
        ]);

        if ($datos['rol'] === 'validador' && User::query()
            ->whereHas('roles', fn ($query) => $query->where('name', 'validador'))
            ->count() >= 5) {
            return response()->json(['message' => 'Solo se permiten cinco usuarios con el rol de validador.'], 422);
        }

        Role::firstOrCreate(['name' => $datos['rol'], 'guard_name' => 'web']);
        $usuario = User::create([
            'name' => $datos['name'],
            'email' => $datos['email'],
            'password' => $datos['password'],
        ]);
        $usuario->assignRole($datos['rol']);

        return response()->json($usuario->load('roles'), 201);
    }
    public function obtener_correo_rol(Request $Request){
        $rol = $Request->input('rol');
        $usuarios = User::role($rol)->get();
        return response()->json($usuarios->pluck('email'));
    }

    public function listar_usuarios(Request $request)
    {
        $datos = $request->validate([
            'rol' => ['nullable', 'in:validador,revisor'],
        ]);

        $usuarios = User::query()
            ->with('roles:id,name')
            ->when($datos['rol'] ?? null, fn ($query, $rol) => $query->role($rol))
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'created_at']);

        return response()->json($usuarios);
    }

    public function actualizar_contrasena(Request $request, User $usuario)
    {
        $datos = $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $usuario->update(['password' => $datos['password']]);
        $usuario->tokens()->delete();

        return response()->json(['message' => 'Contraseña actualizada correctamente.']);
    }

    public function eliminar_usuario(User $usuario)
    {
        $usuario->delete();

        return response()->json(['message' => 'Usuario eliminado correctamente.']);
    }

}
