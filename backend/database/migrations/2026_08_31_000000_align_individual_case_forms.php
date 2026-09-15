<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['ayuda_humanitaria', 'pasantia'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                $table->date('fecha_remision')->nullable();
                $table->unsignedSmallInteger('edad')->nullable();
                $table->string('genero', 50)->nullable();
                $table->string('grupo_etnico', 100)->nullable();
                $table->string('tiene_discapacidad', 10)->nullable();
                $table->text('cual_discapacidad')->nullable();
                $table->string('tiene_condicion_salud', 10)->nullable();
                $table->text('cual_condicion_salud')->nullable();
                $table->text('lugar_procedencia')->nullable();
                $table->text('lugar_residencia')->nullable();
                $table->string('nombre_organizacion')->nullable();
                $table->string('persona_organizacion_nombre')->nullable();
                $table->string('persona_organizacion_correo')->nullable();
                $table->string('persona_organizacion_celular')->nullable();
                $table->text('motivo_solicitud')->nullable();
                $table->string('estado_civil', 100)->nullable();
                $table->text('otra_composicion_familiar')->nullable();
                $table->string('tiene_hijos', 10)->nullable();
                $table->unsignedSmallInteger('numero_hijos')->nullable();
                $table->string('edades_hijos')->nullable();
                $table->text('personas_viven_con_usuario')->nullable();
                $table->text('parentesco_personas')->nullable();
                $table->unsignedSmallInteger('total_grupo_familiar')->nullable();
                $table->text('fecha_lugar_descripcion_caso')->nullable();
                $table->text('riesgo_motivos_amenaza')->nullable();
                $table->text('concepto_equipo_proteccion')->nullable();
                $table->json('documentos_adjuntos')->nullable();

                if ($tableName === 'pasantia') {
                    $table->string('tipo_pasantia')->nullable();
                }
            });
        }
    }

    public function down(): void
    {
        $columnas = [
            'fecha_remision', 'edad', 'genero', 'grupo_etnico', 'tiene_discapacidad',
            'cual_discapacidad', 'tiene_condicion_salud', 'cual_condicion_salud',
            'lugar_procedencia', 'lugar_residencia', 'nombre_organizacion',
            'persona_organizacion_nombre', 'persona_organizacion_correo',
            'persona_organizacion_celular', 'motivo_solicitud', 'estado_civil',
            'otra_composicion_familiar', 'tiene_hijos', 'numero_hijos', 'edades_hijos',
            'personas_viven_con_usuario', 'parentesco_personas', 'total_grupo_familiar',
            'fecha_lugar_descripcion_caso', 'riesgo_motivos_amenaza',
            'concepto_equipo_proteccion', 'documentos_adjuntos',
        ];

        Schema::table('ayuda_humanitaria', fn (Blueprint $table) => $table->dropColumn($columnas));
        Schema::table('pasantia', fn (Blueprint $table) => $table->dropColumn([...$columnas, 'tipo_pasantia']));
    }
};