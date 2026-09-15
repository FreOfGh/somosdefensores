<?php

namespace Tests\Feature;

use App\Mail\InvitacionFinalizacionCaso;
use App\Models\ayuda_humanitaria;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CaseFinalizationInvitationTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_approved_cases_send_finalization_invites_to_representative_and_reviewers(): void
    {
        Mail::fake();
        Role::create(['name' => 'revisor', 'guard_name' => 'web']);
        $revisor = User::factory()->create(['email' => 'revisor@example.test']);
        $revisor->assignRole('revisor');

        $pendiente = $this->crearCaso('pendiente de revisión', 'pendiente@example.test');
        $this->actingAs($revisor, 'sanctum')
            ->postJson('/api/revision/casos/ayuda_humanitaria/'.$pendiente->id.'/finalizacion')
            ->assertStatus(422);

        $aprobado = $this->crearCaso('aprobado', 'representante@example.test');
        $this->actingAs($revisor, 'sanctum')
            ->postJson('/api/revision/casos/ayuda_humanitaria/'.$aprobado->id.'/finalizacion')
            ->assertCreated()
            ->assertJsonPath('destinatarios', 2);

        $this->assertDatabaseCount('finalizacion_caso_tokens', 2);
        Mail::assertSent(InvitacionFinalizacionCaso::class, 2);
    }

    private function crearCaso(string $estado, string $correo): ayuda_humanitaria
    {
        return ayuda_humanitaria::create([
            'id' => Str::uuid()->toString(),
            'nombre_victima' => 'Ana',
            'apellido_victima' => 'Perez',
            'numero_identificacion' => 'CC-'.Str::uuid(),
            'correo_victima' => $correo,
            'token' => Str::random(32),
            'estado' => $estado,
        ]);
    }
}