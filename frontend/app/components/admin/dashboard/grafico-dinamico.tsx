"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";
import { adminFetch } from "@/lib/api/admin-fetch";

export type TipoGrafico = "barras" | "torta";

interface GraficoDinamicoProps {
  tipoCaso: "ayuda_humanitaria" | "pasantia" | "proteccion_colectiva";
  titulo?: string;
}

type CampoGraficable = { campo: string; etiqueta: string };
type Punto = { categoria: string; [serie: string]: string | number };
type Filtro = { id: string; campo: string; valor: string };

const COLORES = ["#92212a", "#ed5a0b", "#2563eb", "#059669", "#7c3aed", "#db2777", "#ca8a04", "#0891b2", "#4b5563", "#65a30d"];
const MAX_CRUCES = 3;
const MAX_FILTROS = 5;

export default function GraficoDinamico({ tipoCaso, titulo = "Gráfico dinámico" }: GraficoDinamicoProps) {
  const [campos, setCampos] = useState<CampoGraficable[]>([]);
  const [campo, setCampo] = useState("");
  const [cruces, setCruces] = useState<string[]>([]);
  const [filtros, setFiltros] = useState<Filtro[]>([]);
  const [valoresPorCampo, setValoresPorCampo] = useState<Record<string, string[]>>({});
  const [tipoGrafico, setTipoGrafico] = useState<TipoGrafico>("barras");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [datos, setDatos] = useState<Punto[]>([]);
  const [series, setSeries] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void (async () => {
      try {
        const respuesta = await adminFetch(`/api/admin/graficos/${tipoCaso}/campos`);
        const lista = await respuesta.json();
        if (!respuesta.ok) throw new Error(lista.message || "No fue posible cargar los campos.");
        setCampos(Array.isArray(lista) ? lista : []);
        if (lista.length) setCampo((actual) => actual || lista[0].campo);
      } catch (error) {
        setMensaje(error instanceof Error ? error.message : "No fue posible cargar los campos.");
      }
    })();
  }, [tipoCaso]);

  const obtenerValores = useCallback(async (campoValor: string) => {
    if (!campoValor || valoresPorCampo[campoValor]) return;
    try {
      const respuesta = await adminFetch(`/api/admin/graficos/${tipoCaso}/valores?campo=${encodeURIComponent(campoValor)}`);
      const lista = await respuesta.json();
      if (!respuesta.ok) throw new Error(lista.message || "No fue posible cargar los valores.");
      setValoresPorCampo((actual) => ({ ...actual, [campoValor]: Array.isArray(lista) ? lista.map(String) : [] }));
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : "No fue posible cargar los valores.");
    }
  }, [tipoCaso, valoresPorCampo]);

  const alternarCruce = (campoCruce: string) => {
    setCruces((actual) => {
      if (actual.includes(campoCruce)) return actual.filter((item) => item !== campoCruce);
      if (actual.length >= MAX_CRUCES) return actual;
      return [...actual, campoCruce];
    });
  };

  const agregarFiltro = () => {
    if (filtros.length >= MAX_FILTROS) return;
    const disponible = campos.find((item) => !filtros.some((filtro) => filtro.campo === item.campo));
    if (!disponible) return;
    void obtenerValores(disponible.campo);
    setFiltros((actual) => [...actual, { id: `${Date.now()}-${Math.random()}`, campo: disponible.campo, valor: "" }]);
  };

  const actualizarFiltro = (id: string, cambios: Partial<Filtro>) => {
    setFiltros((actual) => actual.map((filtro) => (filtro.id === id ? { ...filtro, ...cambios } : filtro)));
    if (cambios.campo) void obtenerValores(cambios.campo);
  };

  const eliminarFiltro = (id: string) => setFiltros((actual) => actual.filter((filtro) => filtro.id !== id));

  const generar = useCallback(async () => {
    if (!campo) return;
    try {
      setCargando(true);
      setMensaje("");
      const params = new URLSearchParams({ campo });
      if (cruces.length) params.set("cruce", cruces.join(","));
      const filtrosValidos = filtros.filter((filtro) => filtro.campo && filtro.valor);
      if (filtrosValidos.length) params.set("filtros", JSON.stringify(filtrosValidos.map(({ campo: campoFiltro, valor }) => ({ campo: campoFiltro, valor }))));
      if (fechaInicio) params.set("fecha_inicio", fechaInicio);
      if (fechaFin) params.set("fecha_fin", fechaFin);
      const respuesta = await adminFetch(`/api/admin/graficos/${tipoCaso}/datos?${params.toString()}`);
      const resultado = await respuesta.json();
      if (!respuesta.ok) throw new Error(resultado.message || "No fue posible generar el gráfico.");
      setDatos(resultado.datos ?? []);
      setSeries(resultado.series ?? ["total"]);
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : "No fue posible generar el gráfico.");
    } finally { setCargando(false); }
  }, [campo, cruces, filtros, fechaInicio, fechaFin, tipoCaso]);

  useEffect(() => { if (campo) void generar(); }, [campo, generar]);

  const descargar = async () => {
    if (!contenedorRef.current) return;
    try {
      setDescargando(true);
      const canvas = await html2canvas(contenedorRef.current, { backgroundColor: "#ffffff", scale: 2 });
      const enlace = document.createElement("a");
      enlace.href = canvas.toDataURL("image/png");
      enlace.download = `grafico_${tipoCaso}_${campo}.png`;
      enlace.click();
    } catch {
      setMensaje("No fue posible descargar el gráfico.");
    } finally { setDescargando(false); }
  };

  const etiquetaCampo = campos.find((item) => item.campo === campo)?.etiqueta ?? campo;
  const claseSelect = "rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-[#92212a]";

  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#92212a] px-6 py-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-white">{titulo}</h2>
        <button type="button" onClick={() => void descargar()} disabled={descargando || !datos.length} className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#92212a] shadow-sm transition hover:bg-gray-100 disabled:opacity-60">
          <Download className="h-4 w-4" />{descargando ? "Descargando..." : "Descargar PNG"}
        </button>
      </div>

      <div className="space-y-4 p-6">
        {mensaje && <p className="rounded-lg border-l-4 border-[#92212a] bg-red-50 p-3 text-sm text-black">{mensaje}</p>}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <label className="text-xs font-semibold text-gray-600">
            Campo principal
            <select value={campo} onChange={(e) => setCampo(e.target.value)} className={`mt-1 w-full ${claseSelect}`}>
              {campos.map((item) => <option key={item.campo} value={item.campo}>{item.etiqueta}</option>)}
            </select>
          </label>

          <div className="col-span-2 text-xs font-semibold text-gray-600 md:col-span-2">
            Cruzar con (hasta {MAX_CRUCES} variables)
            <div className="mt-1 flex max-h-24 flex-wrap gap-x-3 gap-y-1 overflow-y-auto rounded-lg border border-gray-300 bg-white p-2">
              {campos.filter((item) => item.campo !== campo).map((item) => (
                <label key={item.campo} className="flex items-center gap-1.5 text-xs font-normal text-black">
                  <input
                    type="checkbox"
                    checked={cruces.includes(item.campo)}
                    disabled={!cruces.includes(item.campo) && cruces.length >= MAX_CRUCES}
                    onChange={() => alternarCruce(item.campo)}
                  />
                  {item.etiqueta}
                </label>
              ))}
            </div>
          </div>

          <label className="text-xs font-semibold text-gray-600">
            Tipo de gráfico
            <select value={tipoGrafico} onChange={(e) => setTipoGrafico(e.target.value as TipoGrafico)} className={`mt-1 w-full ${claseSelect}`}>
              <option value="barras">Barras</option>
              <option value="torta">Torta</option>
            </select>
          </label>

          <label className="text-xs font-semibold text-gray-600">
            Desde
            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className={`mt-1 w-full ${claseSelect}`} />
          </label>

          <label className="text-xs font-semibold text-gray-600">
            Hasta
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className={`mt-1 w-full ${claseSelect}`} />
          </label>
        </div>

        <div className="rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-600">Filtros (opcional)</p>
            <button
              type="button"
              onClick={agregarFiltro}
              disabled={filtros.length >= MAX_FILTROS || filtros.length >= campos.length}
              className="rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
            >
              + Agregar filtro
            </button>
          </div>

          {filtros.length > 0 && (
            <div className="mt-3 space-y-2">
              {filtros.map((filtro) => (
                <div key={filtro.id} className="flex flex-wrap items-center gap-2">
                  <select value={filtro.campo} onChange={(e) => actualizarFiltro(filtro.id, { campo: e.target.value, valor: "" })} className={`${claseSelect} flex-1 min-w-[160px]`}>
                    {campos.map((item) => <option key={item.campo} value={item.campo}>{item.etiqueta}</option>)}
                  </select>
                  <select value={filtro.valor} onChange={(e) => actualizarFiltro(filtro.id, { valor: e.target.value })} className={`${claseSelect} flex-1 min-w-[160px]`}>
                    <option value="">Seleccione un valor</option>
                    {(valoresPorCampo[filtro.campo] ?? []).map((valor) => <option key={valor} value={valor}>{valor}</option>)}
                  </select>
                  <button type="button" onClick={() => eliminarFiltro(filtro.id)} className="rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50">
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button type="button" onClick={() => void generar()} disabled={cargando || !campo} className="rounded-lg bg-[#92212a] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#701b20] disabled:opacity-60">
            {cargando ? "Generando..." : "Generar gráfico"}
          </button>
        </div>

        <div ref={contenedorRef} className="rounded-lg border border-gray-100 bg-white p-4">
          {datos.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500">{cargando ? "Cargando datos..." : "Seleccione un campo y genere el gráfico."}</p>
          ) : tipoGrafico === "torta" && series.length <= 1 ? (
            <ResponsiveContainer width="100%" height={360}>
              <PieChart>
                <Pie data={datos} dataKey="total" nameKey="categoria" label={(props) => `${props.name}: ${props.value}`} labelLine>
                  {datos.map((_, indice) => <Cell key={indice} fill={COLORES[indice % COLORES.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={datos} margin={{ top: 10, right: 20, bottom: 70, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" angle={-35} textAnchor="end" interval={0} height={80} tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                {series.length > 1 && <Legend />}
                {series.map((serie, indice) => (
                  <Bar key={serie} dataKey={serie} name={serie === "total" ? etiquetaCampo : serie} fill={COLORES[indice % COLORES.length]} stackId={cruces.length ? "cruce" : undefined} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
}
