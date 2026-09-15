<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\ayuda_humanitaria;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        Role::firstOrCreate(['name' => 'revisor', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'validador', 'guard_name' => 'web']);

        $revisor = User::firstOrCreate(
            ['email' => 'sitorress@unal.edu.co'],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Simón Torres',
                'password' => Hash::make('password'),
            ]
        );

        $revisor->syncRoles(['revisor']);

        ayuda_humanitaria::updateOrCreate(
            ['numero_identificacion' => 'PRUEBA-MANUAL-001'],
            [
                'id' => (string) Str::uuid(),
                'nombre_victima' => 'Caso de prueba',
                'apellido_victima' => 'Manual',
                'correo_victima' => 'caso.prueba@example.test',
                'numero_whatsapp' => '3000000000',
                'tipo_documento' => 'CC',
                'estado' => 'pendiente de revisión',
                'token' => 'prueba-manual-001-token-000000',
                'fecha_remision' => now()->toDateString(),
                'edad' => 30,
                'genero' => 'no_responde',
                'grupo_etnico' => 'no_responde',
                'nombre_organizacion' => 'Organización de prueba',
                'organizacion_remite' => 'Equipo de documentación',
                'persona_organizacion_nombre' => 'Usuario de prueba',
                'persona_organizacion_correo' => 'equipo@example.test',
                'persona_organizacion_celular' => '3000000001',
                'motivo_solicitud' => 'Registro de prueba para documentar la gestión administrativa.',
                'fecha_lugar_descripcion_caso' => 'Caso creado por el seeder para validar el flujo de revisión.',
                'riesgo_motivos_amenaza' => 'No aplica. Información ficticia para pruebas.',
                'seguimiento' => 'Caso de prueba para el manual de usuario.',
                'documentos_adjuntos' => [],
            ]
        );
    }
}
