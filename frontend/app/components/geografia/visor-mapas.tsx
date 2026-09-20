"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Layers3, LoaderCircle, Map, MapPinned } from "lucide-react";

type MapMode = "departamentos" | "municipios" | "departamento";
type Position = [number, number];

type GeoJsonGeometry = {
  type: "Polygon" | "MultiPolygon";
  coordinates: Position[][] | Position[][][];
};

type MapFeature = {
  type: "Feature";
  geometry: GeoJsonGeometry;
  properties: {
    codigo?: string;
    nombre?: string;
    departamento?: string;
    datos?: Record<string, string>;
  };
};

type SelectedMunicipality = {
  name: string;
  department: string;
};

type FeatureCollection = {
  type: "FeatureCollection";
  features: MapFeature[];
};

const modes: { id: MapMode; label: string; description: string }[] = [
  { id: "departamentos", label: "Departamentos", description: "División política nacional" },
  { id: "municipios", label: "Municipios", description: "Todos los municipios del país" },
  { id: "departamento", label: "Por departamento", description: "Detalle municipal" },
];

function getFeatureName(feature: MapFeature): string {
  return feature.properties.nombre ?? feature.properties.datos?.name ?? "Territorio";
}

function getFeaturePositions(feature: MapFeature): Position[] {
  if (feature.geometry.type === "Polygon") {
    return feature.geometry.coordinates.flat();
  }

  return feature.geometry.coordinates.flat(2);
}

function createPath(feature: MapFeature, project: (position: Position) => [number, number]): string {
  const polygons = feature.geometry.type === "Polygon"
    ? [feature.geometry.coordinates]
    : feature.geometry.coordinates;

  return polygons
    .map((polygon) => polygon
      .map((ring) => `${ring.map((position, index) => `${index === 0 ? "M" : "L"}${project(position).join(",")}`).join(" ")} Z`)
      .join(" "))
    .join(" ");
}

function getBounds(features: MapFeature[]) {
  const positions = features.flatMap(getFeaturePositions);
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

export default function VisorMapas() {
  const [mode, setMode] = useState<MapMode>("departamentos");
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState<MapFeature[]>([]);
  const [features, setFeatures] = useState<MapFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] = useState<SelectedMunicipality | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
    const endpoint = mode === "departamentos"
      ? "/api/publico/mapas/departamentos"
      : mode === "municipios"
        ? "/api/publico/mapas/municipios"
        : department
          ? `/api/publico/mapas/departamentos/${encodeURIComponent(department)}/municipios`
          : "";

    if (!endpoint) {
      return () => controller.abort();
    }

    fetch(`${apiUrl}${endpoint}`, { headers: { Accept: "application/json" }, signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message ?? "No se pudo cargar el mapa.");
        return data as FeatureCollection;
      })
      .then((data) => setFeatures(data.features))
      .catch((requestError: Error) => {
        if (requestError.name !== "AbortError") {
          setFeatures([]);
          setError(requestError.message);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [mode, department]);

  useEffect(() => {
    const controller = new AbortController();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

    fetch(`${apiUrl}/api/publico/mapas/departamentos`, { headers: { Accept: "application/json" }, signal: controller.signal })
      .then((response) => response.json())
      .then((data: FeatureCollection) => setDepartments(data.features))
      .catch((requestError: Error) => {
        if (requestError.name !== "AbortError") setError("No se pudieron cargar los departamentos.");
      });

    return () => controller.abort();
  }, []);

  const bounds = features.length ? getBounds(features) : null;
  const viewWidth = 1000;
  const viewHeight = 620;
  const mapPadding = 42;
  const longitudeRange = bounds ? bounds.maxLongitude - bounds.minLongitude : 1;
  const latitudeRange = bounds ? bounds.maxLatitude - bounds.minLatitude : 1;
  const mapScale = Math.min(
    (viewWidth - mapPadding * 2) / longitudeRange,
    (viewHeight - mapPadding * 2) / latitudeRange,
  );
  const mapWidth = longitudeRange * mapScale;
  const mapHeight = latitudeRange * mapScale;
  const mapOffsetX = (viewWidth - mapWidth) / 2;
  const mapOffsetY = (viewHeight - mapHeight) / 2;
  const project = (position: Position): [number, number] => {
    if (!bounds) return [0, 0];
    const x = mapOffsetX + (position[0] - bounds.minLongitude) * mapScale;
    const y = viewHeight - mapOffsetY - (position[1] - bounds.minLatitude) * mapScale;
    return [Number(x.toFixed(2)), Number(y.toFixed(2))];
  };

  const seleccionarDepartamento = (feature: MapFeature) => {
    const value = feature.properties.codigo ?? feature.properties.nombre ?? "";
    setDepartment(value);
    setMode("departamento");
    setFeatures([]);
    setError("");
    setLoading(Boolean(value));
  };

  const seleccionarMunicipio = (feature: MapFeature) => {
    setSelectedMunicipality({
      name: getFeatureName(feature),
      department: feature.properties.departamento ?? feature.properties.datos?.dpt ?? "Colombia",
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
      <aside className="bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center bg-[#172936] text-[#e5b15e]"><Layers3 size={20} aria-hidden="true" /></span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#a82d35]">Capas del mapa</p>
            <h2 className="font-bold text-slate-950">Selecciona una vista</h2>
          </div>
        </div>

        <div className="space-y-2">
          {modes.map((mapMode) => (
            <button
              key={mapMode.id}
              type="button"
              onClick={() => {
                setMode(mapMode.id);
                setFeatures([]);
                setError("");
                setLoading(mapMode.id !== "departamento");
              }}
              className={`w-full border-l-4 px-4 py-3 text-left transition-colors ${mode === mapMode.id ? "border-[#a82d35] bg-[#f3eee7] text-slate-950" : "border-transparent text-slate-600 hover:bg-slate-50"}`}
              aria-pressed={mode === mapMode.id}
            >
              <span className="block text-sm font-bold">{mapMode.label}</span>
              <span className="mt-1 block text-xs text-slate-500">{mapMode.description}</span>
            </button>
          ))}
        </div>

        {mode === "departamento" && (
          <label className="mt-6 block text-sm font-semibold text-slate-700">
            Departamento
            <select value={department} onChange={(event) => { const value = event.target.value; setDepartment(value); setFeatures([]); setError(""); setLoading(Boolean(value)); }} className="mt-2 w-full border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#a82d35] focus:ring-2 focus:ring-[#a82d35]/20">
              <option value="">Selecciona un departamento</option>
              {departments.map((item) => <option key={item.properties.codigo ?? item.properties.nombre} value={item.properties.codigo ?? item.properties.nombre}>{getFeatureName(item)}</option>)}
            </select>
          </label>
        )}

        <div className="mt-8 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-500">
          <p className="flex items-start gap-2"><MapPinned size={15} className="mt-0.5 shrink-0 text-[#a82d35]" aria-hidden="true" />Datos geográficos servidos desde PostGIS.</p>
        </div>
      </aside>

      <section className="min-w-0 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a82d35]">Reporte geográfico</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{mode === "departamento" && department ? `Municipios de ${getFeatureName(departments.find((item) => (item.properties.codigo ?? item.properties.nombre) === department) ?? { type: "Feature", geometry: { type: "Polygon", coordinates: [] }, properties: { nombre: department } })}` : modes.find((item) => item.id === mode)?.label}</h1>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="inline-flex min-h-9 items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600">
              <Map size={15} aria-hidden="true" />{features.length} zonas
            </span>
            <span className="inline-flex min-h-9 max-w-full items-center gap-2 bg-[#172936] px-3 py-2 text-xs font-bold text-white" aria-live="polite">
              {hoveredRegion || "Pasa el cursor sobre el mapa"}
            </span>
          </div>
        </div>

        <div className="relative flex min-h-[30rem] items-center justify-center overflow-hidden bg-[#e9efed] p-3 sm:min-h-[38rem] sm:p-6">
          {loading && <div className="flex items-center gap-3 text-sm font-semibold text-slate-600"><LoaderCircle size={20} className="animate-spin text-[#a82d35]" aria-hidden="true" />Cargando geometrías...</div>}
          {!loading && error && <div className="flex max-w-sm items-center gap-3 text-sm font-semibold text-red-700"><AlertCircle size={20} aria-hidden="true" />{error}</div>}
          {!loading && !error && mode === "departamento" && !department && <p className="max-w-sm text-center text-sm font-semibold text-slate-600">Selecciona un departamento para ver sus municipios.</p>}
          {!loading && !error && features.length > 0 && (
            <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="h-auto max-h-[36rem] w-full" role="img" aria-label="Mapa geográfico de Colombia">
              {features.map((feature, index) => {
                const isDepartmentMap = mode === "departamentos";
                const name = getFeatureName(feature);

                return (
                  <path
                    key={`${name}-${index}`}
                    d={createPath(feature, project)}
                    fill={mode === "municipios" ? "#b7cbc8" : "#a82d35"}
                    fillOpacity={mode === "municipios" ? 0.62 : 0.78}
                    stroke="#fff"
                    strokeWidth={mode === "municipios" ? 0.65 : 1.5}
                    vectorEffect="non-scaling-stroke"
                    role={isDepartmentMap ? "button" : undefined}
                    tabIndex={isDepartmentMap ? 0 : undefined}
                    aria-label={isDepartmentMap ? `Ver municipios de ${name}` : name}
                    className={isDepartmentMap ? "cursor-pointer transition-[fill] hover:fill-[#e5b15e]" : "cursor-pointer transition-[fill] hover:fill-[#a82d35]"}
                    onClick={isDepartmentMap ? () => seleccionarDepartamento(feature) : () => seleccionarMunicipio(feature)}
                    onMouseEnter={() => setHoveredRegion(name)}
                    onMouseLeave={() => setHoveredRegion("")}
                    onFocus={() => setHoveredRegion(name)}
                    onBlur={() => setHoveredRegion("")}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        if (isDepartmentMap) seleccionarDepartamento(feature);
                        else seleccionarMunicipio(feature);
                      }
                    }}
                  >
                    <title>{isDepartmentMap ? `Ver municipios de ${name}` : `Ver resumen de ${name}`}</title>
                  </path>
                );
              })}
            </svg>
          )}
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-500">Selecciona una zona del panel para consultar otra representación geográfica.</p>
      </section>

      {selectedMunicipality && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 px-4 py-8" role="presentation" onClick={() => setSelectedMunicipality(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="municipality-summary-title" className="w-full max-w-lg bg-white p-6 shadow-2xl sm:p-8" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a82d35]">Resumen municipal</p>
                <h2 id="municipality-summary-title" className="mt-2 text-3xl font-black tracking-tight text-slate-950">{selectedMunicipality.name}</h2>
                <p className="mt-2 text-sm font-semibold text-slate-500">{selectedMunicipality.department}</p>
              </div>
              <button type="button" onClick={() => setSelectedMunicipality(null)} className="inline-flex h-9 w-9 items-center justify-center border border-slate-200 text-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950" aria-label="Cerrar resumen">&times;</button>
            </div>
            <div className="mt-8 border-l-4 border-[#e5b15e] bg-[#f3eee7] p-5">
              <p className="text-sm font-bold uppercase tracking-wider text-slate-800">Modal de prueba</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Aquí aparecerá el resumen del municipio: casos registrados, tendencias y otra información pública disponible.</p>
            </div>
            <button type="button" onClick={() => setSelectedMunicipality(null)} className="mt-7 w-full bg-[#172936] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#243f4e]">Cerrar resumen</button>
          </div>
        </div>
      )}
    </div>
  );
}
