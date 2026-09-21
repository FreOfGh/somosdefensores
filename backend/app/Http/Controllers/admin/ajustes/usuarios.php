<?php

namespace App\Http\Controllers\admin\ajustes;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
class usuarios extends Controller
{
    private const CATALOG_TABLES = [
        'catalogo_tipos_documento', 'catalogo_generos', 'catalogo_grupos_poblacionales',
        'catalogo_tipo_liderazgo', 'catalogo_modalidades_agresion', 'catalogo_estados_civiles',
        'catalogo_parentescos', 'catalogo_tipo_pasantia', 'catalogo_tipo_representante',
        'catalogo_respuestas_binarias',
    ];

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

    public function editar_usuario(Request $request, User $usuario)
    {
        $datos = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $usuario->id],
            'rol' => ['required', 'in:validador,revisor'],
        ]);

        $usuario->update(['name' => $datos['name'], 'email' => $datos['email']]);
        $usuario->syncRoles([$datos['rol']]);

        return response()->json($usuario->load('roles'));
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
            ->where('email', '!=', config('auth.super_user.email'))
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

    public function eliminar_usuario(Request $request, User $usuario)
    {
        if ($usuario->email === config('auth.super_user.email') || $usuario->is($request->user())) {
            return response()->json(['message' => 'La cuenta superusuario no puede eliminarse desde este módulo.'], 422);
        }

        $datos = $request->validate(['email_confirmation' => ['required', 'email']]);

        if (strcasecmp($datos['email_confirmation'], $usuario->email) !== 0) {
            return response()->json(['message' => 'Debe copiar exactamente el correo asociado al usuario.'], 422);
        }

        $usuario->delete();

        return response()->json(['message' => 'Usuario eliminado correctamente.']);
    }

    public function cambiarMiContrasena(Request $request)
    {
        $datos = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $usuario = $request->user();

        if (! Hash::check($datos['current_password'], $usuario->password)) {
            return response()->json(['message' => 'La contraseña actual no es correcta.'], 422);
        }

        $usuario->update(['password' => $datos['password']]);
        $usuario->tokens()->delete();

        return response()->json(['message' => 'Tu contraseña fue actualizada correctamente. Inicia sesión nuevamente.']);
    }

    public function agregarCatalogo(Request $request)
    {
        $datos = $request->validate([
            'catalogo' => ['required', 'string', 'in:' . implode(',', self::CATALOG_TABLES)],
            'codigo' => ['required', 'string', 'max:100'],
            'nombre' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
        ]);

        $duplicado = DB::table($datos['catalogo'])
            ->whereRaw('LOWER(codigo) = LOWER(?)', [$datos['codigo']])
            ->exists();

        if ($duplicado) {
            return response()->json(['message' => 'Ya existe una opción con ese código en el catálogo.'], 422);
        }

        $id = (string) Str::uuid();
        DB::table($datos['catalogo'])->insert([
            'id' => $id,
            'codigo' => $datos['codigo'],
            'nombre' => $datos['nombre'],
            'descripcion' => $datos['descripcion'] ?? null,
            'activo' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Opción agregada al catálogo.', 'id' => $id], 201);
    }

    public function listarCatalogo(Request $request)
    {
        $datos = $request->validate(['catalogo' => ['required', 'string', 'in:' . implode(',', self::CATALOG_TABLES)]]);

        return response()->json(DB::table($datos['catalogo'])->orderBy('nombre')->get(['id', 'codigo', 'nombre', 'descripcion', 'activo']));
    }

    public function editarCatalogo(Request $request, string $id)
    {
        $datos = $request->validate([
            'catalogo' => ['required', 'string', 'in:' . implode(',', self::CATALOG_TABLES)],
            'codigo' => ['required', 'string', 'max:100'],
            'nombre' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'activo' => ['required', 'boolean'],
        ]);

        $query = DB::table($datos['catalogo'])->where('id', $id);
        if (!$query->exists()) return response()->json(['message' => 'Opción no encontrada.'], 404);

        $duplicado = DB::table($datos['catalogo'])->where('id', '!=', $id)->whereRaw('LOWER(codigo) = LOWER(?)', [$datos['codigo']])->exists();
        if ($duplicado) return response()->json(['message' => 'Ya existe otra opción con ese código.'], 422);

        DB::table($datos['catalogo'])->where('id', $id)->update([
            'codigo' => $datos['codigo'], 'nombre' => $datos['nombre'],
            'descripcion' => $datos['descripcion'] ?? null, 'activo' => $datos['activo'], 'updated_at' => now(),
        ]);
        return response()->json(['message' => 'Opción actualizada correctamente.']);
    }

    public function eliminarCatalogo(Request $request, string $id)
    {
        $datos = $request->validate(['catalogo' => ['required', 'string', 'in:' . implode(',', self::CATALOG_TABLES)]]);
        $eliminado = DB::table($datos['catalogo'])->where('id', $id)->delete();
        return $eliminado ? response()->json(['message' => 'Opción eliminada correctamente.']) : response()->json(['message' => 'Opción no encontrada.'], 404);
    }

}
