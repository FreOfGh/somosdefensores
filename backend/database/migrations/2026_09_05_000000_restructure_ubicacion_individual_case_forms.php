<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['ayuda_humanitaria', 'pasantia'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->string('tipo_documento', 20)->nullable()->after('numero_identificacion');

                $table->string('procedencia_departamento')->nullable();
                $table->string('procedencia_municipio')->nullable();
                $table->string('procedencia_vereda_comunidad')->nullable();
                $table->string('procedencia_resguardo')->nullable();

                $table->string('residencia_departamento')->nullable();
                $table->string('residencia_municipio')->nullable();
                $table->string('residencia_vereda_comunidad')->nullable();
                $table->string('residencia_resguardo')->nullable();

                $table->dropColumn(['lugar_procedencia', 'lugar_residencia']);
            });
        }
    }

    public function down(): void
    {
        foreach (['ayuda_humanitaria', 'pasantia'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->text('lugar_procedencia')->nullable();
                $table->text('lugar_residencia')->nullable();

                $table->dropColumn([
                    'tipo_documento',
                    'procedencia_departamento', 'procedencia_municipio',
                    'procedencia_vereda_comunidad', 'procedencia_resguardo',
                    'residencia_departamento', 'residencia_municipio',
                    'residencia_vereda_comunidad', 'residencia_resguardo',
                ]);
            });
        }
    }
};
