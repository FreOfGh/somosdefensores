<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const INDIVIDUAL_FIELDS = [
        'tipo_documento' => 'catalogo_tipos_documento',
        'genero' => 'catalogo_generos',
        'grupo_etnico' => 'catalogo_grupos_poblacionales',
        'tiene_discapacidad' => 'catalogo_respuestas_binarias',
        'tiene_condicion_salud' => 'catalogo_respuestas_binarias',
        'procedencia_departamento' => 'catalogo_departamentos',
        'procedencia_municipio' => 'catalogo_municipios',
        'residencia_departamento' => 'catalogo_departamentos',
        'residencia_municipio' => 'catalogo_municipios',
        'tipo_liderazgo' => 'catalogo_tipo_liderazgo',
        'estado_civil' => 'catalogo_estados_civiles',
        'tiene_hijos' => 'catalogo_respuestas_binarias',
    ];

    public function up(): void
    {
        DB::statement('TRUNCATE TABLE ayuda_humanitaria, pasantia, proteccion_colectiva RESTART IDENTITY CASCADE');

        foreach (['ayuda_humanitaria', 'pasantia'] as $tableName) {
            foreach (self::INDIVIDUAL_FIELDS as $field => $catalogTable) {
                $this->replaceWithUuid($tableName, $field, $catalogTable);
            }
        }

        $this->replaceWithUuid('pasantia', 'tipo_pasantia', 'catalogo_tipo_pasantia');
        $this->replaceWithUuid('proteccion_colectiva', 'representante_tipo', 'catalogo_tipo_representante');
        $this->replaceWithUuid('proteccion_colectiva', 'departamento', 'catalogo_departamentos');
        $this->replaceWithUuid('proteccion_colectiva', 'municipio', 'catalogo_municipios');
        $this->replaceBooleanWithUuid('proteccion_colectiva', 'tiene_personeria_juridica', 'catalogo_respuestas_binarias');
    }

    public function down(): void
    {
        throw new RuntimeException('La migración destructiva de campos UUID no tiene rollback automático. Restaure un respaldo de la base de datos.');
    }

    private function replaceWithUuid(string $tableName, string $field, string $catalogTable): void
    {
        Schema::table($tableName, function (Blueprint $table) use ($field) {
            $table->dropColumn($field);
        });

        Schema::table($tableName, function (Blueprint $table) use ($field, $catalogTable) {
            $table->uuid($field)->nullable();
            $table->foreign($field)->references('id')->on($catalogTable)->nullOnDelete();
        });
    }

    private function replaceBooleanWithUuid(string $tableName, string $field, string $catalogTable): void
    {
        Schema::table($tableName, function (Blueprint $table) use ($field) {
            $table->dropColumn($field);
        });

        Schema::table($tableName, function (Blueprint $table) use ($field, $catalogTable) {
            $table->uuid($field)->nullable();
            $table->foreign($field)->references('id')->on($catalogTable)->nullOnDelete();
        });
    }
};
