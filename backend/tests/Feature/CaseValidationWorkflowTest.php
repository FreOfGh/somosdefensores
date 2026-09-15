<?php

namespace Tests\Feature;

use App\Mail\InvitacionValidacionCaso;
use App\Models\ayuda_humanitaria;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CaseValidationWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_reviewer_starts_validation_and_notifies_up_to_five_validators(): void
    {
        Mail::fake();
        Role::firstOrCreate(['name' => 'revisor', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'validador', 'guard_name' => 'web']);

        $revisor = User::factory()->create();
        $revisor->assignRole('revisor');

        $validadores = User::factory()->count(6)->create();
        $validadores->each->assignRole('validador');

        $caso = ayuda_humanitaria::create([
            'id' => Str::uuid()->toString(),
            'nombre_victima' => 'Ana',
            'apellido_victima' => 'Perez',
            'numero_identificacion' => 'CC-'.Str::uuid(),
            'correo_victima' => 'ana@example.test',
            'estado' => 'pendiente de revisión',
            'token' => Str::random(32),
        ]);

        $this->actingAs($revisor, 'sanctum')
            ->postJson('/api/revision/casos/ayuda_humanitaria/'.$caso->id.'/iniciar-validacion')
            ->assertOk()
            ->assertJsonPath('validadores_notificados', 5);

        $this->assertDatabaseHas('ayuda_humanitaria', [
            'id' => $caso->id,
            'estado' => 'en proceso de validación',
        ]);
        $this->assertDatabaseCount('validacion_caso_invitaciones', 5);
        Mail::assertSent(InvitacionValidacionCaso::class, 5);
    }
}