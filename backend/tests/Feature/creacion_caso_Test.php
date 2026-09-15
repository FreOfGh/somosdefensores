<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class creacion_caso_test extends TestCase
{
    use RefreshDatabase;
    /**
     * prueba  de creación de caso
     */
    public function test_example(): void
    {
        $response = $this->post('/casos', [
            'nombre_victima' => 'Juan',
            'apellido_victima' => 'Pérez',
            'correo_victima' => 'juan.perez@example.com',
            'numero_whatsapp' => '1234567890',
        ]);

        $response->assertStatus(201);
    }
}