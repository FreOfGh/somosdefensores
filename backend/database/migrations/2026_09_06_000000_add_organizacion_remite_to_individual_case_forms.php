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
                $table->string('organizacion_remite')->nullable();
            });
        }
    }

    public function down(): void
    {
        foreach (['ayuda_humanitaria', 'pasantia'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropColumn('organizacion_remite');
            });
        }
    }
};
