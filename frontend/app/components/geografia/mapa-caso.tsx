"use client";

import { forwardRef, useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

type Position = [number, number];
type GeoJsonGeometry = {
  type: "Polygon";
  coordinates: Position[][];
} | {
  type: "MultiPolygon";
  coordinates: Position[][][];
};

type DepartmentFeature = {
  type: "Feature";
  geometry: GeoJsonGeometry;
  properties: { codigo?: string; nombre?: string; datos?: { name?: string } };
};

type FeatureCollection = { type: "FeatureCollection"; features: DepartmentFeature[] };

function getPositions(feature: DepartmentFeature): Position[] {
  return feature.geometry.type === "Polygon" ? feature.geometry.coordinates.flat() : feature.geometry.coordinates.flat(2);
}

function getBounds(features: DepartmentFeature[]) {
  const positions = features.flatMap(getPositions);
  const longitudes = positions.map(([longitude]) => longitude);
  const latitudes = positions.map(([, latitude]) => latitude);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const longitudePadding = Math.max((maxLongitude - minLongitude) * 0.06, 0.08);
  const latitudePadding = Math.max((maxLatitude - minLatitude) * 0.06, 0.08);

  return {
    minLongitude: minLongitude - longitudePadding,
    maxLongitude: maxLongitude + longitudePadding,
    minLatitude: minLatitude - latitudePadding,
    maxLatitude: maxLatitude + latitudePadding,
  };
}

function getPath(feature: DepartmentFeature, project: (position: Position) => [number, number]) {
  const polygons = feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;
  return polygons.map((polygon) => polygon.map((ring) => (
    `${ring.map((position, index) => `${index === 0 ? "M" : "L"}${project(position).join(",")}`).join(" ")} Z`
  )).join(" ")).join(" ");
}

function getName(feature: DepartmentFeature) {
  return feature.properties.nombre ?? feature.properties.datos?.name ?? "Departamento";
}

function normalizar(valor: string) {
  return valor.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

interface MapaCasoProps {
  /** Nombres de los departamentos involucrados en el caso, a resaltar en el mapa. */
  departamentosResaltados: string[];
}

/** Mapa de Colombia con los departamentos del caso resaltados, listo para capturarse como imagen para el PDF. */
const MapaCaso = forwardRef<HTMLDivElement, MapaCasoProps>(function MapaCaso({ departamentosResaltados }, ref) {
  const [features, setFeatures] = useState<DepartmentFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

    fetch(`${apiUrl}/api/publico/mapas/departamentos`, { headers: { Accept: "application/json" }, signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message ?? "No se pudo cargar el mapa.");
        return data as FeatureCollection;
      })
      .then((data) => setFeatures(data.features))
      .catch((requestError: Error) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const resaltados = new Set(departamentosResaltados.filter(Boolean).map(normalizar));
  const bounds = features.length ? getBounds(features) : null;
  const viewWidth = 900;
  const viewHeight = 560;
  const padding = 36;
  const longitudeRange = bounds ? bounds.maxLongitude - bounds.minLongitude : 1;
  const latitudeRange = bounds ? bounds.maxLatitude - bounds.minLatitude : 1;
  const scale = Math.min((viewWidth - padding * 2) / longitudeRange, (viewHeight - padding * 2) / latitudeRange);
  const mapWidth = longitudeRange * scale;
  const mapHeight = latitudeRange * scale;
  const offsetX = (viewWidth - mapWidth) / 2;
  const offsetY = (viewHeight - mapHeight) / 2;
  const project = (position: Position): [number, number] => {
    if (!bounds) return [0, 0];
    return [
      Number((offsetX + (position[0] - bounds.minLongitude) * scale).toFixed(2)),
      Number((viewHeight - offsetY - (position[1] - bounds.minLatitude) * scale).toFixed(2)),
    ];
  };

  return (
    <div ref={ref} className="relative min-h-[20rem] bg-[#e9efed] p-4">
      {loading ? (
        <div className="flex min-h-[20rem] items-center justify-center text-sm font-semibold text-slate-600"><LoaderCircle size={20} className="mr-3 animate-spin text-[#a82d35]" aria-hidden="true" />Cargando mapa...</div>
      ) : error || !features.length ? (
        <div className="flex min-h-[20rem] items-center justify-center text-center text-sm font-semibold text-red-700">{error || "No hay departamentos disponibles."}</div>
      ) : (
        <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="h-auto w-full" role="img" aria-label="Mapa de ubicación del caso">
          {features.map((feature, index) => {
            const resaltado = resaltados.has(normalizar(getName(feature)));
            return (
              <path
                key={`${getName(feature)}-${index}`}
                d={getPath(feature, project)}
                fill={resaltado ? "#8e2329" : "#cbd5e1"}
                fillOpacity={resaltado ? 0.95 : 0.55}
                stroke="#fff"
                strokeWidth="1.2"
                vectorEffect="non-scaling-stroke"
              >
                <title>{getName(feature)}</title>
              </path>
            );
          })}
        </svg>
      )}
    </div>
  );
});

export default MapaCaso;
