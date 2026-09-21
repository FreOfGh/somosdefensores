"use client";

import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";

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
  properties: {
    codigo?: string;
    nombre?: string;
    datos?: { name?: string };
  };
};

type FeatureCollection = {
  type: "FeatureCollection";
  features: DepartmentFeature[];
};

function getPositions(feature: DepartmentFeature): Position[] {
  return feature.geometry.type === "Polygon"
    ? feature.geometry.coordinates.flat()
    : feature.geometry.coordinates.flat(2);
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
  const polygons = feature.geometry.type === "Polygon"
    ? [feature.geometry.coordinates]
    : feature.geometry.coordinates;

  return polygons.map((polygon) => polygon.map((ring) => (
    `${ring.map((position, index) => `${index === 0 ? "M" : "L"}${project(position).join(",")}`).join(" ")} Z`
  )).join(" ")).join(" ");
}

function getName(feature: DepartmentFeature) {
  return feature.properties.nombre ?? feature.properties.datos?.name ?? "Departamento";
}

export default function MapaDepartamentos() {
  const [features, setFeatures] = useState<DepartmentFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

    fetch(`${apiUrl}/api/publico/mapas/departamentos`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
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

  const bounds = features.length ? getBounds(features) : null;
  const viewWidth = 1000;
  const viewHeight = 620;
  const padding = 42;
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

  if (loading) {
    return <div className="flex min-h-[28rem] items-center justify-center bg-[#e9efed] text-sm font-semibold text-slate-600"><LoaderCircle size={20} className="mr-3 animate-spin text-[#a82d35]" aria-hidden="true" />Cargando mapa desde PostGIS...</div>;
  }

  if (error || !features.length) {
    return <div className="flex min-h-[28rem] items-center justify-center bg-[#e9efed] px-6 text-center text-sm font-semibold text-red-700"><AlertCircle size={20} className="mr-3 shrink-0" aria-hidden="true" />{error || "No hay departamentos disponibles."}</div>;
  }

  return (
    <div className="relative min-h-[28rem] bg-[#e9efed] p-4 sm:min-h-[34rem] sm:p-8">
      <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="h-auto w-full" role="img" aria-label="Mapa de Colombia con sus departamentos">
        {features.map((feature, index) => (
          <path key={`${getName(feature)}-${index}`} d={getPath(feature, project)} fill="#b85b63" fillOpacity="0.88" stroke="#fff" strokeWidth="1.4" vectorEffect="non-scaling-stroke">
            <title>{getName(feature)}</title>
          </path>
        ))}
      </svg>
      <span className="absolute bottom-5 left-5 bg-black px-4 py-2 text-xs font-bold uppercase tracking-wider text-white sm:bottom-7 sm:left-7">Datos de departamentos · PostGIS</span>
    </div>
  );
}
