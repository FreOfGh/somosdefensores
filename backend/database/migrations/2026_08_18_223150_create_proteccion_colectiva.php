<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('proteccion_colectiva', function (Blueprint $table) {

            $table->uuid('id')->primary();

            // Información general
            $table->date('fecha_remision_caso')->nullable();

            $table->boolean('tiene_personeria_juridica')
                ->nullable();

            $table->string('rut')
                ->nullable();

            // Organización
            $table->string('nombre_organizacion');

            $table->text('representante_legal')
                ->nullable();

            $table->string('cc_representante')
                ->nullable();

            $table->string('telefono')
                ->nullable();

            $table->string('correo_electronico')
                ->nullable();

            // Ubicación
            $table->text('departamento_municipio_vereda')
                ->nullable();

            // Información de la organización
            $table->text('descripcion_organizacion')
                ->nullable();

            $table->text('trabajos_realizados')
                ->nullable();

            // Riesgos
            $table->text('riesgos_seguridad_agresiones')
                ->nullable();

            // Medidas
            $table->text('medidas_proteccion_colectiva')
                ->nullable();

            $table->text('justificacion_medidas')
                ->nullable();

            // Estado de la solicitud
            $table->string('estado')
                ->default('pendiente de revisión');
            
            $table->text('token_finalizacion_caso', 32)
                ->nullable();

            
            $table->string('token', 32)
                ->unique();

            $table->timestamps();

            
            
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proteccion_colectiva');
    }
};