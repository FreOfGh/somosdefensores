"use client";

import { BarChart3, FileText, KeyRound, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/api/admin-fetch";
import GraficoEstatico from "@/app/components/admin/dashboard/grafico-estatico";
import GraficoDinamico from "@/app/components/admin/dashboard/grafico-dinamico";
import GraficoAgresionesUbicacion from "@/app/components/admin/dashboard/grafico-agresiones-ubicacion";

type Metrica = { tipo_caso?: string; estado?: string; total: number };
type DashboardResponse = { por_tipo?: Metrica[]; por_estado?: Metrica[]; message?: string; errors?: Record<string, string[]> };

const nombres: Record<string, string> = { ayuda_humanitaria: "Ayuda humanitaria", pasantia: "Pasantía", proteccion_colectiva: "Protección colectiva" };

type TipoCasoGrafico = "ayuda_humanitaria" | "pasantia" | "proteccion_colectiva";

export default function DashboardPage() {
	const router = useRouter();
	const [tipos, setTipos] = useState<Metrica[]>([]);
	const [estados, setEstados] = useState<Metrica[]>([]);
	const [mensaje, setMensaje] = useState("");
	const [contrasenaActual, setContrasenaActual] = useState("");
	const [nuevaContrasena, setNuevaContrasena] = useState("");
	const [confirmacionContrasena, setConfirmacionContrasena] = useState("");
	const [guardandoContrasena, setGuardandoContrasena] = useState(false);
	const [esSuperUsuario, setEsSuperUsuario] = useState(false);

	const cargar = async () => {
		try {
			setMensaje("");
			const respuesta = await adminFetch("/api/admin/dashboard/metricas", { cache: "no-store" });
			const datos: DashboardResponse = await respuesta.json();
			if (!respuesta.ok) throw new Error(datos.message || "No fue posible cargar las métricas.");
			setTipos(datos.por_tipo ?? []); setEstados(datos.por_estado ?? []);
		} catch (error) { setMensaje(error instanceof Error ? error.message : "No fue posible cargar las métricas."); }
	};

	useEffect(() => { void Promise.resolve().then(cargar); }, []);
	useEffect(() => {
		void adminFetch("/api/auth/me")
			.then((respuesta) => respuesta.json())
			.then((datos) => setEsSuperUsuario(Boolean(datos.user?.roles?.some((role: { name: string }) => role.name === "super usuario"))))
			.catch(() => setEsSuperUsuario(false));
	}, []);
	const total = tipos.reduce((suma, item) => suma + Number(item.total), 0);
	const [tipoGrafico, setTipoGrafico] = useState<TipoCasoGrafico>("ayuda_humanitaria");

	const datosPorTipo = tipos.map((item) => ({ categoria: nombres[item.tipo_caso || ""] || item.tipo_caso || "Tipo", total: Number(item.total) }));
	const datosPorEstado = estados.map((item) => ({ categoria: item.estado || "Sin estado", total: Number(item.total) }));
	const cambiarMiContrasena = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (nuevaContrasena.length < 8 || nuevaContrasena !== confirmacionContrasena) {
			setMensaje(nuevaContrasena.length < 8 ? "La nueva contraseña debe tener al menos 8 caracteres." : "Las contraseñas no coinciden.");
			return;
		}
		try {
			setGuardandoContrasena(true);
			const respuesta = await adminFetch("/api/admin/mi-contrasena", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ current_password: contrasenaActual, password: nuevaContrasena, password_confirmation: confirmacionContrasena }) });
			const datos: DashboardResponse = await respuesta.json();
			if (!respuesta.ok) throw new Error(datos.message ?? Object.values(datos.errors ?? {})[0]?.[0] ?? "No fue posible cambiar la contraseña.");
			window.localStorage.removeItem("revisor_token");
			router.push("/login");
		} catch (error) { setMensaje(error instanceof Error ? error.message : "No fue posible cambiar la contraseña."); }
		finally { setGuardandoContrasena(false); }
	};

	return <main className="min-h-screen bg-[#f5f5f5] px-4 py-8 md:px-8"><div className="mx-auto max-w-6xl"><header className="flex items-end justify-between border-b border-gray-300 pb-6"><div><h1 className="text-3xl font-bold text-black">Dashboard</h1><p className="mt-1 text-black">{esSuperUsuario ? "Administración de cuenta." : "Resumen de casos registrados y su estado."}</p></div>{!esSuperUsuario && <button type="button" onClick={() => void cargar()} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#8e2329] text-[#8e2329] transition-colors hover:bg-[#8e2329] hover:text-white" title="Actualizar métricas"><RefreshCw className="h-4 w-4" /><span className="sr-only">Actualizar métricas</span></button>}</header>{mensaje && <p className="mt-5 rounded-lg border-l-4 border-red-700 bg-red-50 p-4 text-sm text-black">{mensaje}</p>}{!esSuperUsuario && <><section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Tarjeta etiqueta="Total de casos" valor={total} icono={<FileText className="h-5 w-5" />} />{tipos.map((item) => <Tarjeta key={item.tipo_caso} etiqueta={nombres[item.tipo_caso || ""] || item.tipo_caso || "Tipo"} valor={Number(item.total)} icono={<BarChart3 className="h-5 w-5" />} />)}</section>

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

		<section className="mt-8 rounded-xl border border-gray-200 bg-[#fefbfb] p-6 shadow-sm"><h2 className="text-lg font-bold text-black">Casos por estado</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{estados.map((item) => <div key={item.estado} className="rounded-lg border-l-4 border-[#8e2329] bg-white p-4"><p className="text-sm text-black">{item.estado}</p><p className="mt-1 text-2xl font-bold text-black">{item.total}</p></div>)}{!estados.length && <p className="text-sm text-black">No hay casos registrados.</p>}</div></section></>}

		{!esSuperUsuario && <GraficoAgresionesUbicacion />}

		<section className="mt-8 rounded-xl border border-gray-200 bg-[#fefbfb] p-6 shadow-sm">
					<div className="flex items-center gap-3"><KeyRound className="h-5 w-5 text-[#8e2329]" aria-hidden="true" /><div><h2 className="text-lg font-bold text-black">Cambiar mi contraseña</h2><p className="text-sm text-gray-600">Actualiza únicamente la contraseña de tu usuario.</p></div></div>
					<form onSubmit={cambiarMiContrasena} className="mt-5 grid gap-4 md:grid-cols-3">
						<input type="password" required value={contrasenaActual} onChange={(event) => setContrasenaActual(event.target.value)} placeholder="Contraseña actual" className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#8e2329] focus:ring-2 focus:ring-[#8e2329]/20" />
						<input type="password" required minLength={8} value={nuevaContrasena} onChange={(event) => setNuevaContrasena(event.target.value)} placeholder="Nueva contraseña" className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#8e2329] focus:ring-2 focus:ring-[#8e2329]/20" />
						<input type="password" required minLength={8} value={confirmacionContrasena} onChange={(event) => setConfirmacionContrasena(event.target.value)} placeholder="Confirmar nueva contraseña" className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#8e2329] focus:ring-2 focus:ring-[#8e2329]/20" />
						<button type="submit" disabled={guardandoContrasena} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#8e2329] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#a82d35] disabled:opacity-60 md:col-span-3 md:justify-self-start"><KeyRound className="h-4 w-4" aria-hidden="true" />{guardandoContrasena ? "Guardando..." : "Cambiar contraseña"}</button>
					</form>
				</section>
	</div></main>;
}

function Tarjeta({ etiqueta, valor, icono }: { etiqueta: string; valor: number; icono: React.ReactNode }) {
	return <article className="rounded-xl border border-gray-200 bg-[#fefbfb] p-5 shadow-sm"><div className="flex items-center justify-between text-[#8e2329]">{icono}<span className="text-2xl font-bold text-black">{valor}</span></div><p className="mt-4 text-sm font-semibold text-black">{etiqueta}</p></article>;
}
