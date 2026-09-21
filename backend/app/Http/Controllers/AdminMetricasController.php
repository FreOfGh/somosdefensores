<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class AdminMetricasController extends Controller
{
    public function index()
    {
        return response()->json([
            'por_tipo' => DB::table('vista_metricas_casos_por_tipo')->orderBy('tipo_caso')->get(),
            'por_estado' => DB::table('vista_metricas_casos_por_estado')->orderBy('estado')->get(),
        ]);
    }

    public function agresionesPorUbicacion()
    {
        $base = "
            SELECT coalesce(cd.nombre, agresion->>'departamento') AS departamento,
                   coalesce(cm.nombre, agresion->>'municipio') AS municipio
            FROM (
                SELECT agresiones::jsonb AS agresiones FROM ayuda_humanitaria WHERE deleted_at IS NULL
                UNION ALL
                SELECT agresiones::jsonb AS agresiones FROM pasantia WHERE deleted_at IS NULL
            ) AS casos
            CROSS JOIN LATERAL jsonb_array_elements(
                CASE
                    WHEN jsonb_typeof(casos.agresiones) = 'array' THEN casos.agresiones
                    ELSE '[]'::jsonb
                END
            ) AS agresion
            LEFT JOIN catalogo_departamentos cd ON cd.id::text = agresion->>'departamento'
            LEFT JOIN catalogo_municipios cm ON cm.id::text = agresion->>'municipio'
        ";

        return response()->json([
            'por_departamento' => DB::select("SELECT departamento, COUNT(*)::int AS total FROM ({$base}) AS agresiones WHERE NULLIF(TRIM(departamento), '') IS NOT NULL GROUP BY departamento ORDER BY total DESC, departamento"),
            'por_municipio' => DB::select("SELECT departamento, municipio, COUNT(*)::int AS total FROM ({$base}) AS agresiones WHERE NULLIF(TRIM(municipio), '') IS NOT NULL GROUP BY departamento, municipio ORDER BY total DESC, departamento, municipio"),
        ]);
    }
}