<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class AyudaHumanitariaSubmissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_an_humanitarian_aid_case_from_the_public_form(): void
    {
        $response = $this->post('/api/publico/casos/ayuda_humanitaria/agregar', [
            'fecha_remision' => '2026-08-31',
            'nombre_apellidos' => 'Ana Perez',
            'cedula' => 'CC-'.Str::uuid(),
            'edad' => '30',
            'genero' => 'F',
            'telefono' => '3001234567',
            'correo' => 'ana@example.com',
            'lugar_procedencia' => 'Bogota',
            'lugar_residencia' => 'Bogota',
            'motivo_solicitud' => 'Solicitud de apoyo.',
            'fecha_lugar_descripcion_caso' => 'Descripcion del caso.',
            'riesgo_motivos_amenaza' => 'Riesgo reportado.',
            'concepto_equipo_proteccion' => 'Concepto inicial.',
        ]);

        $response->assertCreated();
        $response->assertJsonPath('numero_identificacion', $response->json('numero_identificacion'));
        $this->assertDatabaseHas('ayuda_humanitaria', [
            'correo_victima' => 'ana@example.com',
            'numero_whatsapp' => '3001234567',
            'estado' => 'pendiente de revisión',
        ]);
    }
}