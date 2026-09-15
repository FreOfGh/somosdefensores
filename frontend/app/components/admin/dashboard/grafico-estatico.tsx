"use client";

import { useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";

interface GraficoEstaticoProps {
  titulo: string;
  datos: { categoria: string; total: number }[];
  tipo?: "barras" | "torta";
  nombreArchivo?: string;
}

const COLORES = ["#92212a", "#ed5a0b", "#2563eb", "#059669", "#7c3aed", "#db2777", "#ca8a04", "#0891b2", "#4b5563", "#65a30d"];

export default function GraficoEstatico({ titulo, datos, tipo = "barras", nombreArchivo }: GraficoEstaticoProps) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [descargando, setDescargando] = useState(false);

  const descargar = async () => {
    if (!contenedorRef.current) return;
    try {
      setDescargando(true);
      const canvas = await html2canvas(contenedorRef.current, { backgroundColor: "#ffffff", scale: 2 });
      const enlace = document.createElement("a");
      enlace.href = canvas.toDataURL("image/png");
      enlace.download = `${nombreArchivo ?? titulo.toLowerCase().replaceAll(" ", "_")}.png`;
      enlace.click();
    } finally { setDescargando(false); }
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-black">{titulo}</h2>
        <button type="button" onClick={() => void descargar()} disabled={descargando || !datos.length} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60">
          <Download className="h-3.5 w-3.5" />{descargando ? "..." : "PNG"}
        </button>
      </div>
      <div ref={contenedorRef} className="p-4">
        {datos.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-500">No hay datos para mostrar.</p>
        ) : tipo === "torta" ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={datos} dataKey="total" nameKey="categoria" label={(props) => `${props.name}: ${props.value}`} labelLine>
                {datos.map((_, indice) => <Cell key={indice} fill={COLORES[indice % COLORES.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datos} margin={{ top: 10, right: 20, bottom: 60, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="categoria" angle={-30} textAnchor="end" interval={0} height={70} tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" name="Casos">
                {datos.map((_, indice) => <Cell key={indice} fill={COLORES[indice % COLORES.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
