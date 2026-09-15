"use client";

import { BarChart3, FileText, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/api/admin-fetch";
import GraficoEstatico from "@/app/components/admin/dashboard/grafico-estatico";
import GraficoDinamico from "@/app/components/admin/dashboard/grafico-dinamico";

type Metrica = { tipo_caso?: string; estado?: string; total: number };

const nombres: Record<string, string> = { ayuda_humanitaria: "Ayuda humanitaria", pasantia: "Pasantía", proteccion_colectiva: "Protección colectiva" };

type TipoCasoGrafico = "ayuda_humanitaria" | "pasantia" | "proteccion_colectiva";

export default function DashboardPage() {
	const [tipos, setTipos] = useState<Metrica[]>([]);
	const [estados, setEstados] = useState<Metrica[]>([]);
	const [mensaje, setMensaje] = useState("");

	const cargar = async () => {
		try {
			setMensaje("");
			const respuesta = await adminFetch("/api/admin/dashboard/metricas", { cache: "no-store" });
			const datos = await respuesta.json();
			if (!respuesta.ok) throw new Error(datos.message || "No fue posible cargar las métricas.");
			setTipos(datos.por_tipo); setEstados(datos.por_estado);
		} catch (error) { setMensaje(error instanceof Error ? error.message : "No fue posible cargar las métricas."); }
	};

	useEffect(() => { void cargar(); }, []);
	const total = tipos.reduce((suma, item) => suma + Number(item.total), 0);
	const [tipoGrafico, setTipoGrafico] = useState<TipoCasoGrafico>("ayuda_humanitaria");

	const datosPorTipo = tipos.map((item) => ({ categoria: nombres[item.tipo_caso || ""] || item.tipo_caso || "Tipo", total: Number(item.total) }));
	const datosPorEstado = estados.map((item) => ({ categoria: item.estado || "Sin estado", total: Number(item.total) }));

	return <main className="min-h-screen bg-[#f5f5f5] px-4 py-8 md:px-8"><div className="mx-auto max-w-6xl"><header className="flex items-end justify-between border-b border-gray-300 pb-6"><div><h1 className="text-3xl font-bold text-black">Dashboard</h1><p className="mt-1 text-black">Resumen de casos registrados y su estado.</p></div><button type="button" onClick={() => void cargar()} className="inline-flex h-10 w-10 items-center justify-center border border-[#8e2329] text-[#8e2329]" title="Actualizar métricas"><RefreshCw className="h-4 w-4" /><span className="sr-only">Actualizar métricas</span></button></header>{mensaje && <p className="mt-5 border-l-4 border-red-700 bg-red-50 p-4 text-sm text-black">{mensaje}</p>}<section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Tarjeta etiqueta="Total de casos" valor={total} icono={<FileText className="h-5 w-5" />} />{tipos.map((item) => <Tarjeta key={item.tipo_caso} etiqueta={nombres[item.tipo_caso || ""] || item.tipo_caso || "Tipo"} valor={Number(item.total)} icono={<BarChart3 className="h-5 w-5" />} />)}</section>

		<section className="mt-8 grid gap-6 lg:grid-cols-2">
			<GraficoEstatico titulo="Casos por tipo" datos={datosPorTipo} tipo="torta" nombreArchivo="casos_por_tipo" />
			<GraficoEstatico titulo="Casos por estado" datos={datosPorEstado} tipo="barras" nombreArchivo="casos_por_estado" />
		</section>

		<div className="mt-10">
			<div className="mb-4 flex flex-wrap items-center gap-2">
				<h2 className="text-lg font-bold text-black">Generador de gráficos dinámicos</h2>
				<div className="flex gap-2">
					{(Object.keys(nombres) as TipoCasoGrafico[]).map((tipoCaso) => (
						<button key={tipoCaso} type="button" onClick={() => setTipoGrafico(tipoCaso)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${tipoGrafico === tipoCaso ? "bg-[#92212a] text-white" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}>
							{nombres[tipoCaso]}
						</button>
					))}
				</div>
			</div>
			<GraficoDinamico key={tipoGrafico} tipoCaso={tipoGrafico} titulo={`Gráfico dinámico: ${nombres[tipoGrafico]}`} />
		</div>

		<section className="mt-8 border border-gray-300 bg-white p-6"><h2 className="text-lg font-bold text-black">Casos por estado</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{estados.map((item) => <div key={item.estado} className="border-l-4 border-[#8e2329] bg-gray-50 p-4"><p className="text-sm text-black">{item.estado}</p><p className="mt-1 text-2xl font-bold text-black">{item.total}</p></div>)}{!estados.length && <p className="text-sm text-black">No hay casos registrados.</p>}</div></section></div></main>;
}

function Tarjeta({ etiqueta, valor, icono }: { etiqueta: string; valor: number; icono: React.ReactNode }) {
	return <article className="border border-gray-300 bg-white p-5"><div className="flex items-center justify-between text-[#8e2329]">{icono}<span className="text-2xl font-bold text-black">{valor}</span></div><p className="mt-4 text-sm font-semibold text-black">{etiqueta}</p></article>;
}
