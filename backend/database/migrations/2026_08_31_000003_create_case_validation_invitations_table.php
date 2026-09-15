<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('validacion_caso_invitaciones', function (Blueprint $table) {
            $table->id();
            $table->string('tipo_caso');
            $table->uuid('caso_id');
            $table->uuid('validador_id');
            $table->string('token_hash', 64)->unique();
            $table->timestamp('expires_at');
            $table->timestamp('responded_at')->nullable();
            $table->string('decision', 20)->nullable();
            $table->text('comentarios')->nullable();
            $table->text('respuesta_revisor')->nullable();
            $table->timestamp('reopened_at')->nullable();
            $table->timestamps();

            $table->index(['tipo_caso', 'caso_id']);
            $table->index(['validador_id', 'responded_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('validacion_caso_invitaciones');
    }
};