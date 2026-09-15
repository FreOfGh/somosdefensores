"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import TablaCasos, { FilaCaso } from "@/app/components/admin/common/tabla-casos";
import { enviarInvitacionFinalizacion } from "@/services/admin/finalizacion-caso.service";
import { adminFetch } from "@/lib/api/admin-fetch";
import ExportarCasos from "@/app/components/admin/common/exportar-casos";

interface Pasantia extends FilaCaso { nombre_victima: string; apellido_victima: string; numero_identificacion: string; numero_whatsapp: string | null; correo_victima: string; created_at: string; }

export default function PasantiasPage() {
    const [casos, setCasos] = useState<Pasantia[]>([]);
    const [cargando, setCargando] = useState(true);
    const [finalizandoId, setFinalizandoId] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [exportarAbierto, setExportarAbierto] = useState(false);
    const cargar = async () => { try { setCargando(true); const response = await adminFetch("/api/admin/listar/pasantia"); if (!response.ok) throw new Error("No fue posible cargar las pasantías."); setCasos(await response.json()); } catch (error) { setMensaje(error instanceof Error ? error.message : "No fue posible cargar las pasantías."); } finally { setCargando(false); } };
    useEffect(() => { void Promise.resolve().then(cargar); }, []);
    const finalizar = async (fila: FilaCaso) => { setFinalizandoId(fila.id); setMensaje(""); try { await enviarInvitacionFinalizacion("pasantia", fila.id); setMensaje("La invitación de finalización fue enviada al correo del caso."); } catch (error) { setMensaje(error instanceof Error ? error.message : "No fue posible enviar la invitación."); } finally { setFinalizandoId(""); } };
    const filas = casos.map((caso) => ({ id: caso.id, nombre: `${caso.nombre_victima} ${caso.apellido_victima}`, identificacion: caso.numero_identificacion, telefono: caso.numero_whatsapp || "", correo: caso.correo_victima, estado: caso.estado, createdAt: caso.created_at }));
    return <main className="min-h-screen bg-[#f5f5f5] px-4 py-8 md:px-8"><div className="mx-auto max-w-7xl"><header className="mb-8 flex items-end justify-between gap-4"><div><h1 className="text-3xl font-bold text-[#92212a]">Pasantías</h1><p className="mt-1 text-slate-600">Administración de solicitudes de pasantía.</p></div><div className="flex gap-2"><button type="button" onClick={() => setExportarAbierto(true)} className="inline-flex items-center gap-2 border border-[#92212a] bg-white px-4 py-2.5 text-sm font-semibold text-[#92212a] hover:bg-[#92212a]/5">Exportar CSV</button><button type="button" onClick={cargar} className="inline-flex items-center gap-2 bg-[#92212a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#731920]"><RefreshCw className="h-4 w-4" />Actualizar</button></div></header><ExportarCasos tipoCaso="pasantia" abierto={exportarAbierto} onCerrar={() => setExportarAbierto(false)} />{mensaje && <p className="mb-5 border-l-4 border-[#ed5a0b] bg-orange-50 p-4 text-sm text-slate-800">{mensaje}</p>}{cargando ? <p className="py-16 text-center text-slate-600">Cargando casos...</p> : <TablaCasos filas={filas} gestionarHref={(id) => `/admin/pasantias/${id}/gestionar`} onFinalizar={finalizar} finalizandoId={finalizandoId} />}</div></main>;
}