"use client";

import { RefreshCw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import TablaCasos, { FilaCaso } from "@/app/components/admin/common/tabla-casos";
import { enviarInvitacionFinalizacion } from "@/services/admin/finalizacion-caso.service";
import { adminFetch } from "@/lib/api/admin-fetch";
import ExportarCasos from "@/app/components/admin/common/exportar-casos";

interface SolicitudProteccionColectiva {
  id: string;
  fecha_remision_caso: string | null;
  tiene_personeria_juridica: boolean | null;
  rut: string | null;
  nombre_organizacion: string;
  representante_legal: string | null;
  cc_representante: string | null;
  telefono: string | null;
  correo_electronico: string | null;
  departamento_municipio_vereda: string | null;
  descripcion_organizacion: string | null;
  trabajos_realizados: string | null;
  riesgos_seguridad_agresiones: string | null;
  medidas_proteccion_colectiva: string | null;
  justificacion_medidas: string | null;
  estado: string;
  created_at: string;
}

export default function ProteccionColectivaPage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudProteccionColectiva[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("todos");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [finalizandoId, setFinalizandoId] = useState("");
  const [exportarAbierto, setExportarAbierto] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const obtenerSolicitudes = async () => {
    try {
      setCargando(true);
      setError("");
      const response = await adminFetch("/api/admin/listar/proteccion_colectiva");

      if (!response.ok) throw new Error("No fue posible cargar las solicitudes.");

      const resultado = await response.json();
      setSolicitudes(resultado.data ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Ocurrió un error inesperado.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(obtenerSolicitudes);
  }, []);

  const solicitudesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return solicitudes.filter((solicitud) => {
      const coincideBusqueda =
        !texto ||
        solicitud.nombre_organizacion.toLowerCase().includes(texto) ||
        solicitud.representante_legal?.toLowerCase().includes(texto) ||
        solicitud.correo_electronico?.toLowerCase().includes(texto) ||
        solicitud.cc_representante?.toLowerCase().includes(texto);
      return coincideBusqueda && (estado === "todos" || solicitud.estado === estado);
    });
  }, [busqueda, estado, solicitudes]);

  const estados = Array.from(new Set(solicitudes.map((solicitud) => solicitud.estado)));
  const pendientes = solicitudes.filter((solicitud) =>
    solicitud.estado.toLowerCase().includes("pendiente")
  ).length;
  const finalizar = async (fila: FilaCaso) => {
    setFinalizandoId(fila.id);
    setMensaje("");
    try { await enviarInvitacionFinalizacion("proteccion_colectiva", fila.id); setMensaje("La invitación de finalización fue enviada al correo de la solicitud."); }
    catch (cause) { setMensaje(cause instanceof Error ? cause.message : "No fue posible enviar la invitación."); }
    finally { setFinalizandoId(""); }
  };
  const filas: FilaCaso[] = solicitudesFiltradas.map((solicitud) => ({ id: solicitud.id, nombre: solicitud.nombre_organizacion, identificacion: solicitud.cc_representante || "", telefono: solicitud.telefono || "", correo: solicitud.correo_electronico || "", estado: solicitud.estado, createdAt: solicitud.created_at }));

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#8e2329]">Protección colectiva</h1>
            <p className="mt-1 text-gray-600">Solicitudes de organizaciones, colectivos y comunidades.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setExportarAbierto(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#8e2329] bg-white px-4 py-2.5 text-sm font-semibold text-[#8e2329] transition hover:bg-[#8e2329]/5"
            >
              Exportar CSV
            </button>
            <button
              type="button"
              onClick={obtenerSolicitudes}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#8e2329] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#701b20]"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Actualizar
            </button>
          </div>
        </header>

        <ExportarCasos tipoCaso="proteccion_colectiva" abierto={exportarAbierto} onCerrar={() => setExportarAbierto(false)} />

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Resumen etiqueta="Total solicitudes" valor={solicitudes.length} />
          <Resumen etiqueta="Pendientes" valor={pendientes} />
          <Resumen etiqueta="Resultados filtrados" valor={solicitudesFiltradas.length} />
        </section>

        <section className="mb-6 flex flex-col gap-3 border-b border-gray-200 pb-6 md:flex-row">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por organización, representante, documento o correo"
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none focus:border-[#8e2329] focus:ring-2 focus:ring-[#8e2329]/20"
            />
          </label>
          <select
            value={estado}
            onChange={(event) => setEstado(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#8e2329] focus:ring-2 focus:ring-[#8e2329]/20"
          >
            <option value="todos">Todos los estados</option>
            {estados.map((opcion) => <option key={opcion} value={opcion}>{opcion}</option>)}
          </select>
        </section>

        {mensaje && <p className="mb-5 border-l-4 border-[#ed5a0b] bg-orange-50 p-4 text-sm text-slate-800">{mensaje}</p>}
        {cargando ? (
          <p className="py-16 text-center text-gray-600">Cargando solicitudes...</p>
        ) : error ? (
          <section className="border border-red-200 bg-red-50 p-5 text-red-800">
            <p>{error}</p>
          </section>
        ) : (
          <TablaCasos filas={filas} gestionarHref={(id) => `/admin/proteccion_colectiva/${id}/gestionar`} onFinalizar={finalizar} finalizandoId={finalizandoId} />
        )}
      </div>
    </main>
  );
}

function Resumen({ etiqueta, valor }: { etiqueta: string; valor: number }) {
  return <div className="border border-gray-200 bg-white p-4"><p className="text-sm text-gray-600">{etiqueta}</p><p className="mt-1 text-2xl font-bold text-[#8e2329]">{valor}</p></div>;
}

