<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('proteccion_colectiva', function (Blueprint $table) {
            $table->string('representante_nombre')->nullable();
            $table->string('representante_apellido')->nullable();
            $table->string('representante_tipo')->nullable();
            $table->string('cedula')->nullable();
            $table->string('correo')->nullable();
            $table->string('departamento')->nullable();
            $table->string('municipio')->nullable();
            $table->string('vereda')->nullable();
            $table->text('estructura_organizacion')->nullable();
            $table->text('reivindicaciones')->nullable();
            $table->text('derechos_defiende')->nullable();
            $table->text('trabajos_realiza')->nullable();
            $table->text('riesgos_seguridad')->nullable();
            $table->text('incidentes')->nullable();
            $table->text('afectacion_trabajo')->nullable();
            $table->text('actores_riesgo')->nullable();
            $table->text('medidas_proteccion')->nullable();
            $table->text('informacion_adicional')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('proteccion_colectiva', function (Blueprint $table) {
            $table->dropColumn([
                'representante_nombre', 'representante_apellido', 'representante_tipo',
                'cedula', 'correo', 'departamento', 'municipio', 'vereda',
                'estructura_organizacion', 'reivindicaciones', 'derechos_defiende',
                'trabajos_realiza', 'riesgos_seguridad', 'incidentes',
                'afectacion_trabajo', 'actores_riesgo', 'medidas_proteccion',
                'informacion_adicional',
            ]);
        });
    }
};