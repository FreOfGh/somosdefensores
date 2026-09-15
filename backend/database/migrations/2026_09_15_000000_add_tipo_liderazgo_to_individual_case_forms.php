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
                $table->string('tipo_liderazgo')->nullable()->after('nombre_organizacion');
                $table->string('tipo_liderazgo_otro')->nullable()->after('tipo_liderazgo');
            });
        }
    }

    public function down(): void
    {
        foreach (['ayuda_humanitaria', 'pasantia'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropColumn(['tipo_liderazgo', 'tipo_liderazgo_otro']);
            });
        }
    }
};