"use client";

import { useEffect, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import html2canvas from "html2canvas";
import { Download, LoaderCircle } from "lucide-react";
import { adminFetch } from "@/lib/api/admin-fetch";

type DepartmentPoint = { departamento: string; total: number };
type MunicipalityPoint = { departamento: string; municipio: string; total: number };
type LocationResponse = { por_departamento: DepartmentPoint[]; por_municipio: MunicipalityPoint[] };

export default function GraficoAgresionesUbicacion() {
  const [data, setData] = useState<LocationResponse>({ por_departamento: [], por_municipio: [] });
  const [view, setView] = useState<"departamento" | "municipio">("departamento");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void adminFetch("/api/admin/dashboard/agresiones-ubicacion", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message ?? "No fue posible cargar las agresiones por ubicación.");
        setData(result);
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "No fue posible cargar las agresiones por ubicación."))
      .finally(() => setLoading(false));
  }, []);

  const points = view === "departamento"
    ? data.por_departamento.map((item) => ({ categoria: item.departamento, total: item.total }))
    : data.por_municipio.map((item) => ({ categoria: `${item.municipio} (${item.departamento})`, total: item.total }));

  const download = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current, { backgroundColor: "#ffffff", scale: 2 });
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `agresiones_por_${view}.png`;
    link.click();
  };

  return (
    <section className="mt-8 border border-gray-300 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-black">Agresiones por ubicación</h2>
          <p className="mt-1 text-sm text-gray-600">Agrupación de agresiones registradas en ayuda humanitaria y pasantía.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setView("departamento")} className={`px-3 py-2 text-xs font-semibold ${view === "departamento" ? "bg-[#92212a] text-white" : "border border-gray-300 text-gray-700"}`}>Departamentos</button>
          <button type="button" onClick={() => setView("municipio")} className={`px-3 py-2 text-xs font-semibold ${view === "municipio" ? "bg-[#92212a] text-white" : "border border-gray-300 text-gray-700"}`}>Municipios</button>
          <button type="button" onClick={() => void download()} disabled={!points.length} className="inline-flex items-center gap-1 border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 disabled:opacity-50"><Download size={14} aria-hidden="true" /> PNG</button>
        </div>
      </div>

      {message && <p className="mt-4 border-l-4 border-red-700 bg-red-50 p-3 text-sm text-red-800">{message}</p>}
      <div ref={chartRef} className="mt-5 bg-white">
        {loading ? <p className="flex items-center justify-center gap-2 py-16 text-sm text-gray-600"><LoaderCircle size={18} className="animate-spin" aria-hidden="true" />Cargando agresiones...</p> : points.length === 0 ? <p className="py-16 text-center text-sm text-gray-500">No hay agresiones con ubicación registrada.</p> : <ResponsiveContainer width="100%" height={380}><BarChart data={points} margin={{ top: 12, right: 20, bottom: view === "municipio" ? 100 : 70, left: 0 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="categoria" angle={-35} textAnchor="end" interval={0} height={view === "municipio" ? 110 : 80} tick={{ fontSize: 10 }} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="total" name="Agresiones" fill="#92212a" /></BarChart></ResponsiveContainer>}
      </div>
    </section>
  );
}
