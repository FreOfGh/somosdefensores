<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    private const CATALOGS = [
        'catalogo_tipos_documento' => [
            ['codigo' => 'CC', 'nombre' => 'Cédula de ciudadanía'],
            ['codigo' => 'CE', 'nombre' => 'Cédula de extranjería'],
            ['codigo' => 'TI', 'nombre' => 'Tarjeta de identidad'],
            ['codigo' => 'PPT', 'nombre' => 'Permiso por protección temporal'],
            ['codigo' => 'PASAPORTE', 'nombre' => 'Pasaporte'],
        ],
        'catalogo_generos' => [
            ['codigo' => 'F', 'nombre' => 'Femenino'],
            ['codigo' => 'M', 'nombre' => 'Masculino'],
            ['codigo' => 'LGBTIQ+', 'nombre' => 'LGBTIQ+ / OSIGD'],
            ['codigo' => 'OTRO', 'nombre' => 'Otro'],
            ['codigo' => 'NO_RESPONDE', 'nombre' => 'Prefiero no responder'],
        ],
        'catalogo_grupos_poblacionales' => [
            ['codigo' => 'INDIGENA', 'nombre' => 'Indígena'],
            ['codigo' => 'AFRODESCENDIENTE', 'nombre' => 'Afrodescendiente'],
            ['codigo' => 'AFROCOLOMBIANO', 'nombre' => 'Afrocolombiano/a'],
            ['codigo' => 'CAMPESINO', 'nombre' => 'Campesino/a'],
            ['codigo' => 'ADULTO_MAYOR', 'nombre' => 'Adulto mayor'],
            ['codigo' => 'MUJERES', 'nombre' => 'Mujeres'],
            ['codigo' => 'LGBTIQ_OSIGD', 'nombre' => 'LGBTIQ+ / OSIGD'],
            ['codigo' => 'RAIZAL', 'nombre' => 'Raizal'],
            ['codigo' => 'PALENQUERO', 'nombre' => 'Palenquero/a'],
            ['codigo' => 'ROM', 'nombre' => 'Rrom / Gitano'],
            ['codigo' => 'NINGUNO', 'nombre' => 'Ninguno'],
            ['codigo' => 'NO_RESPONDE', 'nombre' => 'Prefiero no responder'],
        ],
        'catalogo_tipo_liderazgo' => [
            ['codigo' => 'COMUNAL', 'nombre' => 'Comunal'],
            ['codigo' => 'COMUNITARIO', 'nombre' => 'Comunitario'],
            ['codigo' => 'CAMPESINO', 'nombre' => 'Campesino'],
            ['codigo' => 'DEFENSORAS_DERECHOS_MUJERES', 'nombre' => 'Defensoras de los derechos de las mujeres'],
            ['codigo' => 'AFRODESCENDIENTE', 'nombre' => 'Afrodescendiente'],
            ['codigo' => 'INDIGENA', 'nombre' => 'Indígena'],
            ['codigo' => 'SINDICAL', 'nombre' => 'Sindical'],
            ['codigo' => 'AMBIENTAL', 'nombre' => 'Ambiental'],
            ['codigo' => 'LIDERAZGO_VICTIMAS', 'nombre' => 'Liderazgo de víctimas'],
            ['codigo' => 'LGTBI', 'nombre' => 'LGTBI'],
            ['codigo' => 'JUVENIL', 'nombre' => 'Juvenil'],
            ['codigo' => 'ESTUDIANTIL', 'nombre' => 'Estudiantil'],
            ['codigo' => 'ACTIVISTA_DDHH', 'nombre' => 'Activista de DD.HH'],
            ['codigo' => 'MUJER_BUSCADORA', 'nombre' => 'Mujer buscadora'],
            ['codigo' => 'OTRO', 'nombre' => 'Otro'],
        ],
        'catalogo_modalidades_agresion' => [
            ['codigo' => 'ASESINATO', 'nombre' => 'Asesinato'],
            ['codigo' => 'AMENAZA', 'nombre' => 'Amenaza'],
            ['codigo' => 'ATENTADO', 'nombre' => 'Atentado'],
            ['codigo' => 'DETENCION_ARBITRARIA', 'nombre' => 'Detención arbitraria'],
            ['codigo' => 'JUDICIALIZACION', 'nombre' => 'Judicialización'],
            ['codigo' => 'ROBO_DE_INFORMACION', 'nombre' => 'Robo de información'],
            ['codigo' => 'VIOLENCIA_SEXUAL', 'nombre' => 'Violencia sexual'],
            ['codigo' => 'VIOLENCIA_DIGITAL', 'nombre' => 'Violencia digital'],
            ['codigo' => 'DESAPARICION_FORZADA', 'nombre' => 'Desaparición forzada'],
            ['codigo' => 'DESPLAZAMIENTO_FORZADO', 'nombre' => 'Desplazamiento forzado'],
            ['codigo' => 'ASESINATOS_RAZON_GENERO', 'nombre' => 'Asesinatos en razón del género'],
            ['codigo' => 'SECUESTRO', 'nombre' => 'Secuestro'],
            ['codigo' => 'TORTURA_TRATOS_CRUELES', 'nombre' => 'Tortura, tratos crueles, inhumanos o degradantes'],
            ['codigo' => 'OTRA', 'nombre' => 'Otra'],
        ],
        'catalogo_estados_civiles' => [
            ['codigo' => 'SOLTERO', 'nombre' => 'Soltero/a'],
            ['codigo' => 'CASADO', 'nombre' => 'Casado/a'],
            ['codigo' => 'UNION_LIBRE', 'nombre' => 'Unión libre'],
            ['codigo' => 'SEPARADO', 'nombre' => 'Separado/a'],
            ['codigo' => 'DIVORCIADO', 'nombre' => 'Divorciado/a'],
            ['codigo' => 'VIUDO', 'nombre' => 'Viudo/a'],
            ['codigo' => 'NO_RESPONDE', 'nombre' => 'Prefiero no responder'],
        ],
        'catalogo_parentescos' => [
            ['codigo' => 'CONYUGE', 'nombre' => 'Cónyuge o pareja'],
            ['codigo' => 'HIJO', 'nombre' => 'Hijo/a'],
            ['codigo' => 'PADRE_MADRE', 'nombre' => 'Padre o madre'],
            ['codigo' => 'HERMANO', 'nombre' => 'Hermano/a'],
            ['codigo' => 'ABUELO', 'nombre' => 'Abuelo/a'],
            ['codigo' => 'NIETO', 'nombre' => 'Nieto/a'],
            ['codigo' => 'OTRO_FAMILIAR', 'nombre' => 'Otro familiar'],
            ['codigo' => 'NO_FAMILIAR', 'nombre' => 'No familiar'],
        ],
        'catalogo_tipo_pasantia' => [
            ['codigo' => 'NACIONAL', 'nombre' => 'Nacional'],
            ['codigo' => 'INTERNACIONAL', 'nombre' => 'Internacional'],
        ],
        'catalogo_tipo_representante' => [
            ['codigo' => 'REPRESENTANTE_LEGAL', 'nombre' => 'Representante legal'],
            ['codigo' => 'DIRECTOR', 'nombre' => 'Director/a'],
            ['codigo' => 'PERSONA_AUTORIZADA', 'nombre' => 'Persona autorizada'],
            ['codigo' => 'COORDINADOR', 'nombre' => 'Coordinador/a'],
            ['codigo' => 'ASAMBLEA', 'nombre' => 'Asamblea o equivalente'],
        ],
        'catalogo_respuestas_binarias' => [
            ['codigo' => 'SI', 'nombre' => 'Sí'],
            ['codigo' => 'NO', 'nombre' => 'No'],
        ],
    ];

    public function up(): void
    {
        foreach (self::CATALOGS as $tableName => $options) {
            Schema::create($tableName, function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('codigo', 100)->unique();
                $table->string('nombre', 255);
                $table->text('descripcion')->nullable();
                $table->boolean('activo')->default(true);
                $table->timestamps();
            });

            foreach ($options as $option) {
                DB::table($tableName)->insert([
                    'id' => (string) Str::uuid(),
                    'codigo' => $option['codigo'],
                    'nombre' => $option['nombre'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        Schema::create('catalogo_departamentos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('codigo', 255)->unique();
            $table->string('nombre', 255)->unique();
            $table->foreignId('geometria_id')->nullable()->constrained('departamentos_geometrias')->nullOnDelete();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        Schema::create('catalogo_municipios', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('departamento_id');
            $table->string('nombre', 255);
            $table->foreignId('geometria_id')->nullable()->constrained('municipios_geometrias')->nullOnDelete();
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->unique(['departamento_id', 'nombre']);
            $table->foreign('departamento_id')->references('id')->on('catalogo_departamentos')->cascadeOnDelete();
        });

        $departments = DB::table('departamentos_geometrias')->orderBy('id')->get();
        foreach ($departments as $department) {
            DB::table('catalogo_departamentos')->insert([
                'id' => (string) Str::uuid(),
                'codigo' => $department->codigo,
                'nombre' => $department->nombre,
                'geometria_id' => $department->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $departmentIds = DB::table('catalogo_departamentos')->pluck('id', 'nombre');
        $municipalities = DB::table('municipios_geometrias')->orderBy('id')->get();
        foreach ($municipalities as $municipality) {
            $departmentId = $departmentIds[$municipality->departamento] ?? null;
            if (!$departmentId) {
                continue;
            }

            $alreadyExists = DB::table('catalogo_municipios')
                ->where('departamento_id', $departmentId)
                ->where('nombre', $municipality->nombre)
                ->exists();
            if ($alreadyExists) {
                continue;
            }

            DB::table('catalogo_municipios')->insert([
                'id' => (string) Str::uuid(),
                'departamento_id' => $departmentId,
                'nombre' => $municipality->nombre,
                'geometria_id' => $municipality->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('catalogo_municipios');
        Schema::dropIfExists('catalogo_departamentos');

        foreach (array_reverse(array_keys(self::CATALOGS)) as $tableName) {
            Schema::dropIfExists($tableName);
        }
    }
};
