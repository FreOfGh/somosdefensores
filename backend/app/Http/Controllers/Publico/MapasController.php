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
