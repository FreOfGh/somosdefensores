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
                $table->dropColumn([
                    'edades_hijos',
                    'personas_viven_con_usuario',
                    'parentesco_personas',
                ]);
            });

            Schema::table($tableName, function (Blueprint $table) {
                $table->json('edades_hijos')->nullable();
                $table->json('personas_conviven')->nullable();
            });
        }
    }

    public function down(): void
    {
        foreach (['ayuda_humanitaria', 'pasantia'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropColumn(['edades_hijos', 'personas_conviven']);
            });

            Schema::table($tableName, function (Blueprint $table) {
                $table->string('edades_hijos')->nullable();
                $table->text('personas_viven_con_usuario')->nullable();
                $table->text('parentesco_personas')->nullable();
            });
        }
    }
};
