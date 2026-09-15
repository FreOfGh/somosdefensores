<?php

namespace Tests\Feature;

use App\Models\ayuda_humanitaria;
use App\Models\pasantia;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class FinalCaseImmutabilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_approved_or_rejected_individual_cases_cannot_be_updated(): void
    {
        Role::create(['name' => 'revisor', 'guard_name' => 'web']);
        $revisor = User::factory()->create();
        $revisor->assignRole('revisor');
        $approved = ayuda_humanitaria::create([
            'id' => Str::uuid()->toString(), 'nombre_victima' => 'Ana', 'apellido_victima' => 'Lopez',
            'numero_identificacion' => 'CC-'.Str::uuid(), 'correo_victima' => 'ana@example.test',
            'token' => Str::random(32), 'estado' => 'aprobado',
        ]);
        $rejected = pasantia::create([
            'id' => Str::uuid()->toString(), 'nombre_victima' => 'Luis', 'apellido_victima' => 'Diaz',
            'numero_identificacion' => 'CC-'.Str::uuid(), 'correo_victima' => 'luis@example.test',
            'token' => Str::random(32), 'estado' => 'rechazado',
        ]);

        $this->actingAs($revisor, 'sanctum')->patchJson('/api/admin/humanitaria/'.$approved->id, ['nombre_victima' => 'Cambio'])->assertStatus(422);
        $this->actingAs($revisor, 'sanctum')->patchJson('/api/admin/pasantia/'.$rejected->id, ['nombre_victima' => 'Cambio'])->assertStatus(422);
    }
}