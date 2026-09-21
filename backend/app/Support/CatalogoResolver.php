<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

/**
 * Resuelve valores UUID almacenados en campos enlazados a catálogos hacia su etiqueta legible (nombre).
 */
class CatalogoResolver
{
    private const CAMPOS_CATALOGO = [
        'tipo_documento' => 'catalogo_tipos_documento',
        'genero' => 'catalogo_generos',
        'grupo_etnico' => 'catalogo_grupos_poblacionales',
        'tiene_discapacidad' => 'catalogo_respuestas_binarias',
        'tiene_condicion_salud' => 'catalogo_respuestas_binarias',
        'procedencia_departamento' => 'catalogo_departamentos',
        'procedencia_municipio' => 'catalogo_municipios',
        'residencia_departamento' => 'catalogo_departamentos',
        'residencia_municipio' => 'catalogo_municipios',
        'tipo_liderazgo' => 'catalogo_tipo_liderazgo',
        'estado_civil' => 'catalogo_estados_civiles',
        'tiene_hijos' => 'catalogo_respuestas_binarias',
        'tipo_pasantia' => 'catalogo_tipo_pasantia',
        'representante_tipo' => 'catalogo_tipo_representante',
        'tiene_personeria_juridica' => 'catalogo_respuestas_binarias',
        'departamento' => 'catalogo_departamentos',
        'municipio' => 'catalogo_municipios',
    ];

    private const CAMPOS_CATALOGO_AGRESION = [
        'departamento' => 'catalogo_departamentos',
        'municipio' => 'catalogo_municipios',
        'modalidad' => 'catalogo_modalidades_agresion',
    ];

    private const PATRON_UUID = '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i';

    /** @var array<string, array<string, string>> */
    private static array $cache = [];

    public static function tablaDelCampo(string $campo): ?string
    {
        return self::CAMPOS_CATALOGO[$campo] ?? null;
    }

    private static function mapaDeTabla(string $tabla): array
    {
        if (!isset(self::$cache[$tabla])) {
            self::$cache[$tabla] = DB::table($tabla)->pluck('nombre', 'id')->all();
        }

        return self::$cache[$tabla];
    }

    public static function resolver(string $campo, mixed $valor): mixed
    {
        if ($valor === null || $valor === '' || !is_string($valor)) {
            return $valor;
        }

        $tabla = self::CAMPOS_CATALOGO[$campo] ?? null;
        if (!$tabla || !preg_match(self::PATRON_UUID, $valor)) {
            return $valor;
        }

        return self::mapaDeTabla($tabla)[$valor] ?? $valor;
    }

    public static function resolverAgresion(array $agresion): array
    {
        foreach (self::CAMPOS_CATALOGO_AGRESION as $campo => $tabla) {
            if (!isset($agresion[$campo]) || !is_string($agresion[$campo]) || !preg_match(self::PATRON_UUID, $agresion[$campo])) {
                continue;
            }
            $agresion[$campo] = self::mapaDeTabla($tabla)[$agresion[$campo]] ?? $agresion[$campo];
        }

        return $agresion;
    }
}
