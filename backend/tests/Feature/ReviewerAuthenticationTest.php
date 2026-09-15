<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ReviewerAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_reviewers_can_log_in_and_admin_routes_require_a_token(): void
    {
        Role::create(['name' => 'revisor', 'guard_name' => 'web']);
        $revisor = User::create([
            'id' => Str::uuid()->toString(),
            'name' => 'Revisor',
            'email' => 'revisor@example.test',
            'password' => Hash::make('password123'),
        ]);
        $revisor->assignRole('revisor');

        $this->getJson('/api/admin/dashboard/metricas')->assertUnauthorized();

        $this->postJson('/api/auth/login', [
            'email' => $revisor->email,
            'password' => 'password123',
            'device_name' => 'testing',
        ])->assertOk()->assertJsonStructure(['token_type', 'token', 'user']);
    }
}