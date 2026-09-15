<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("CREATE VIEW vista_metricas_casos_por_tipo AS
            SELECT 'ayuda_humanitaria' AS tipo_caso, COUNT(*) AS total FROM ayuda_humanitaria WHERE deleted_at IS NULL
            UNION ALL SELECT 'pasantia', COUNT(*) FROM pasantia WHERE deleted_at IS NULL
            UNION ALL SELECT 'proteccion_colectiva', COUNT(*) FROM proteccion_colectiva WHERE deleted_at IS NULL");

        DB::statement("CREATE VIEW vista_metricas_casos_por_estado AS
            SELECT estado, COUNT(*) AS total FROM (
                SELECT estado FROM ayuda_humanitaria WHERE deleted_at IS NULL
                UNION ALL SELECT estado FROM pasantia WHERE deleted_at IS NULL
                UNION ALL SELECT estado FROM proteccion_colectiva WHERE deleted_at IS NULL
            ) AS casos GROUP BY estado");
    }

    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS vista_metricas_casos_por_estado');
        DB::statement('DROP VIEW IF EXISTS vista_metricas_casos_por_tipo');
    }
};