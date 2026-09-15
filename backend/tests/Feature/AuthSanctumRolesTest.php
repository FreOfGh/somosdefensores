<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthSanctumRolesTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_returns_a_sanctum_token(): void
    {
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => Hash::make('password'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
            'device_name' => 'testing',
        ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'token_type',
            'token',
            'user' => ['id', 'name', 'email'],
        ]);
    }

    public function test_admin_routes_require_the_admin_role(): void
    {
        Role::firstOrCreate(['name' => 'administrador', 'guard_name' => 'web']);

        $user = User::factory()->create([
            'email' => 'staff@example.com',
            'password' => Hash::make('password'),
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/admin/casos/generar_nuevo_token/does-not-exist')
            ->assertForbidden();

        $user->assignRole('administrador');

        $missingCaseId = Str::uuid()->toString();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/admin/casos/generar_nuevo_token/' . $missingCaseId)
            ->assertNotFound();
    }
}