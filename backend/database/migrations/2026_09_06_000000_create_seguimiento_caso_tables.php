<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seguimiento_caso_tokens', function (Blueprint $table) {
            $table->id();
            $table->string('tipo_caso');
            $table->uuid('caso_id');
            $table->string('correo_destinatario');
            $table->string('token_hash', 64)->unique();
            $table->timestamp('expires_at');
            $table->timestamp('used_at')->nullable();
            $table->json('respuesta')->nullable();
            $table->timestamps();

            $table->index(['tipo_caso', 'caso_id']);
        });

        foreach (['ayuda_humanitaria', 'pasantia', 'proteccion_colectiva'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->text('seguimiento')->nullable();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('seguimiento_caso_tokens');

        foreach (['ayuda_humanitaria', 'pasantia', 'proteccion_colectiva'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropColumn('seguimiento');
            });
        }
    }
};
