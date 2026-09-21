<?php

namespace App\Http\Controllers\Publico;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class MapasController extends Controller
{
    public function departamentos(): JsonResponse
    {
        $features = DB::table('departamentos_geometrias')
            ->select('codigo', 'nombre', 'properties')
            ->selectRaw('ST_AsGeoJSON(geom)::json AS geometry')
            ->orderBy('nombre')
            ->get()
            ->map(fn ($department) => $this->feature($department, [
                'codigo' => $department->codigo,
                'nombre' => $department->nombre,
            ]));

        return $this->featureCollection($features);
    }

    public function municipios(): JsonResponse
    {
        $features = DB::table('municipios_geometrias')
            ->select('departamento', 'nombre', 'properties')
            ->selectRaw('ST_AsGeoJSON(geom)::json AS geometry')
            ->orderBy('departamento')
            ->orderBy('nombre')
            ->get()
            ->map(fn ($municipality) => $this->feature($municipality, [
                'departamento' => $municipality->departamento,
                'nombre' => $municipality->nombre,
            ]));

        return $this->featureCollection($features);
    }

    public function municipiosPorDepartamento(string $departamento): JsonResponse
    {
        $features = DB::table('municipios_geometrias')
            ->select('departamento', 'nombre', 'properties')
            ->selectRaw('ST_AsGeoJSON(geom)::json AS geometry')
            ->where(function ($query) use ($departamento) {
                $query
                    ->whereRaw('LOWER(departamento) = LOWER(?)', [$departamento])
                    ->orWhereRaw("LOWER(properties->>'dpt') = LOWER(?)", [$departamento]);
            })
            ->orderBy('nombre')
            ->get()
            ->map(fn ($municipality) => $this->feature($municipality, [
                'departamento' => $municipality->departamento,
                'nombre' => $municipality->nombre,
            ]));

        if ($features->isEmpty()) {
            return response()->json([
                'message' => 'No se encontraron municipios para el departamento indicado.',
            ], 404);
        }

        return $this->featureCollection($features);
    }

    public function agresiones(): JsonResponse
    {
        $agresiones = "
            SELECT LOWER(TRIM(agresion->>'departamento')) AS departamento,
                   LOWER(TRIM(agresion->>'municipio')) AS municipio,
                   COUNT(*)::int AS total
            FROM (
                SELECT agresiones::jsonb AS agresiones FROM ayuda_humanitaria WHERE deleted_at IS NULL
                UNION ALL
                SELECT agresiones::jsonb AS agresiones FROM pasantia WHERE deleted_at IS NULL
            ) AS casos
            CROSS JOIN LATERAL jsonb_array_elements(
                CASE WHEN jsonb_typeof(casos.agresiones) = 'array' THEN casos.agresiones ELSE '[]'::jsonb END
            ) AS agresion
            WHERE NULLIF(TRIM(agresion->>'departamento'), '') IS NOT NULL
              AND NULLIF(TRIM(agresion->>'municipio'), '') IS NOT NULL
            GROUP BY LOWER(TRIM(agresion->>'departamento')), LOWER(TRIM(agresion->>'municipio'))
        ";

        $features = DB::table('municipios_geometrias AS municipios')
            ->leftJoinSub(DB::query()->fromRaw("({$agresiones}) AS conteos"), 'conteos', function ($join) {
                $join->on(DB::raw('LOWER(TRIM(municipios.departamento))'), '=', 'conteos.departamento')
                    ->on(DB::raw('LOWER(TRIM(municipios.nombre))'), '=', 'conteos.municipio');
            })
            ->select('municipios.departamento', 'municipios.nombre', 'municipios.properties')
            ->selectRaw('COALESCE(conteos.total, 0)::int AS agresiones')
            ->selectRaw('ST_AsGeoJSON(municipios.geom)::json AS geometry')
            ->orderByDesc('agresiones')
            ->orderBy('municipios.departamento')
            ->orderBy('municipios.nombre')
            ->get()
            ->map(fn ($municipality) => [
                'type' => 'Feature',
                'geometry' => is_string($municipality->geometry) ? json_decode($municipality->geometry, true) : $municipality->geometry,
                'properties' => [
                    'departamento' => $municipality->departamento,
                    'nombre' => $municipality->nombre,
                    'agresiones' => (int) $municipality->agresiones,
                ],
            ]);

        return $this->featureCollection($features);
    }

    private function featureCollection($features): JsonResponse
    {
        return response()->json([
            'type' => 'FeatureCollection',
            'features' => $features->values(),
        ]);
    }

    private function feature(object $row, array $properties): array
    {
        return [
            'type' => 'Feature',
            'geometry' => is_string($row->geometry) ? json_decode($row->geometry, true) : $row->geometry,
            'properties' => array_merge($properties, [
                'datos' => is_string($row->properties) ? json_decode($row->properties, true) : $row->properties,
            ]),
        ];
    }
}
