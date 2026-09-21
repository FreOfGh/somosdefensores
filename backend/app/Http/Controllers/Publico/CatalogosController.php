<?php

namespace App\Http\Controllers\Publico;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class CatalogosController extends Controller
{
    private const CATALOG_TABLES = [
        'tipos-documento' => 'catalogo_tipos_documento',
        'generos' => 'catalogo_generos',
        'grupos-poblacionales' => 'catalogo_grupos_poblacionales',
        'tipos-liderazgo' => 'catalogo_tipo_liderazgo',
        'modalidades-agresion' => 'catalogo_modalidades_agresion',
        'estados-civiles' => 'catalogo_estados_civiles',
        'parentescos' => 'catalogo_parentescos',
        'tipos-pasantia' => 'catalogo_tipo_pasantia',
        'tipos-representante' => 'catalogo_tipo_representante',
        'respuestas-binarias' => 'catalogo_respuestas_binarias',
    ];

    public function show(string $catalogo): JsonResponse
    {
        $table = self::CATALOG_TABLES[$catalogo] ?? null;
        if (!$table) {
            return response()->json(['message' => 'Catálogo no encontrado.'], 404);
        }

        return response()->json(
            DB::table($table)
                ->where('activo', true)
                ->orderBy('nombre')
                ->get(['id', 'codigo', 'nombre', 'descripcion'])
        );
    }

    public function departamentos(): JsonResponse
    {
        return response()->json(DB::table('catalogo_departamentos')->where('activo', true)->orderBy('nombre')->get(['id', 'codigo', 'nombre']));
    }

    public function municipios(string $departamento): JsonResponse
    {
        $departamentoId = DB::table('catalogo_departamentos')
            ->where('id', $departamento)
            ->orWhere('codigo', $departamento)
            ->value('id');

        if (!$departamentoId) {
            return response()->json(['message' => 'Departamento no encontrado.'], 404);
        }

        return response()->json(DB::table('catalogo_municipios')->where('departamento_id', $departamentoId)->where('activo', true)->orderBy('nombre')->get(['id', 'nombre', 'departamento_id']));
    }

    public function todosMunicipios(): JsonResponse
    {
        return response()->json(DB::table('catalogo_municipios')->where('activo', true)->orderBy('nombre')->get(['id', 'nombre', 'departamento_id']));
    }
}
