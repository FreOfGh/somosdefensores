<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const TABLE = 'departamentos_geometrias';

    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            throw new RuntimeException('La migracion de Colombia requiere una conexion PostgreSQL con PostGIS.');
        }

        DB::statement('CREATE EXTENSION IF NOT EXISTS postgis');

        Schema::create(self::TABLE, function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 255)->nullable();
            $table->string('nombre');
            $table->jsonb('properties');
            $table->timestamps();
        });

        DB::statement('ALTER TABLE ' . self::TABLE . ' ADD COLUMN geom geometry(Geometry, 4326) NOT NULL');
        DB::statement('CREATE INDEX departamentos_geometrias_geom_gist ON ' . self::TABLE . ' USING GIST (geom)');
        DB::statement('CREATE UNIQUE INDEX departamentos_geometrias_codigo_unique ON ' . self::TABLE . ' (codigo) WHERE codigo IS NOT NULL');

        $topology = $this->loadTopology();
        $departments = $topology['objects']['depts']['geometries'] ?? null;

        if (!is_array($departments)) {
            throw new RuntimeException('El TopoJSON no contiene la capa objects.depts.geometries esperada.');
        }

        foreach ($departments as $department) {
            $geometry = $this->toGeoJsonGeometry($department, $topology);
            $properties = $department['properties'] ?? [];

            DB::insert(
                'INSERT INTO ' . self::TABLE . ' (codigo, nombre, properties, geom, created_at, updated_at)
                 VALUES (?, ?, ?::jsonb, ST_SetSRID(ST_GeomFromGeoJSON(?), 4326), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
                [
                    $properties['dpt'] ?? null,
                    $properties['name'] ?? $properties['dpt'] ?? 'Sin nombre',
                    json_encode($properties, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE),
                    json_encode($geometry, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE),
                ]
            );
        }
    }

    public function down(): void
    {
        Schema::dropIfExists(self::TABLE);
    }

    private function loadTopology(): array
    {
        $path = storage_path('app/private/colombia-geojson.json');

        if (!is_file($path)) {
            throw new RuntimeException("No se encontro el archivo TopoJSON: {$path}");
        }

        $topology = json_decode(file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);

        if (($topology['type'] ?? null) !== 'Topology') {
            throw new RuntimeException('El archivo de Colombia no tiene formato TopoJSON Topology.');
        }

        return $topology;
    }

    private function toGeoJsonGeometry(array $geometry, array $topology): array
    {
        $type = $geometry['type'] ?? null;
        $arcs = $geometry['arcs'] ?? null;

        if (!in_array($type, ['Polygon', 'MultiPolygon'], true) || !is_array($arcs)) {
            throw new RuntimeException('La capa de departamentos contiene una geometria no soportada.');
        }

        $coordinates = $type === 'Polygon'
            ? array_map(fn (array $ring) => $this->decodeRing($ring, $topology), $arcs)
            : array_map(
                fn (array $polygon) => array_map(fn (array $ring) => $this->decodeRing($ring, $topology), $polygon),
                $arcs
            );

        return [
            'type' => $type,
            'coordinates' => $coordinates,
        ];
    }

    private function decodeRing(array $arcReferences, array $topology): array
    {
        $ring = [];

        foreach ($arcReferences as $reference) {
            $arcIndex = $reference < 0 ? -$reference - 1 : $reference;
            $arc = $topology['arcs'][$arcIndex] ?? null;

            if (!is_array($arc)) {
                throw new RuntimeException("Referencia de arco TopoJSON invalida: {$reference}");
            }

            $coordinates = $this->decodeArc($arc, $topology['transform'] ?? []);
            if ($reference < 0) {
                $coordinates = array_reverse($coordinates);
            }

            if ($ring !== []) {
                array_shift($coordinates);
            }

            $ring = array_merge($ring, $coordinates);
        }

        if ($ring !== [] && $ring[0] !== $ring[count($ring) - 1]) {
            $ring[] = $ring[0];
        }

        return $ring;
    }

    private function decodeArc(array $arc, array $transform): array
    {
        $scale = $transform['scale'] ?? [1, 1];
        $translate = $transform['translate'] ?? [0, 0];
        $x = 0;
        $y = 0;
        $coordinates = [];

        foreach ($arc as $point) {
            $x += $point[0];
            $y += $point[1];
            $coordinates[] = [
                $x * $scale[0] + $translate[0],
                $y * $scale[1] + $translate[1],
            ];
        }

        return $coordinates;
    }
};
