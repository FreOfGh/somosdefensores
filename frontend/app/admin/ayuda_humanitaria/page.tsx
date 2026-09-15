"use client";

import { useMemo, useState } from "react";
import { AyudaHumanitaria } from "@/types/admin/ayuda-humanitaria.types";
import { useAyudasHumanitarias } from "@/hooks/admin/use-ayudas-humanitarias";
import EstadisticasAyuda from "@/app/components/admin/ayuda_humanitaria/estadisticas";
import FiltrosAyuda from "@/app/components/admin/ayuda_humanitaria/filtros";
import TablaAyudas from "@/app/components/admin/ayuda_humanitaria/tabla";
import { enviarInvitacionFinalizacion } from "@/services/admin/finalizacion-caso.service";
import ExportarCasos from "@/app/components/admin/common/exportar-casos";

const ITEMS_PER_PAGE = 10;

export default function TablaAyudasHumanitarias() {
  const { ayudas, loading, error, obtenerAyudas } = useAyudasHumanitarias();

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroPago, setFiltroPago] = useState("todos");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [finalizandoId, setFinalizandoId] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [exportarAbierto, setExportarAbierto] = useState(false);

  const finalizarCaso = async (ayuda: AyudaHumanitaria) => {
    setFinalizandoId(ayuda.id);
    setMensaje("");
    try { await enviarInvitacionFinalizacion("ayuda_humanitaria", ayuda.id); setMensaje("La invitación de finalización fue enviada al correo del caso."); }
    catch (cause) { setMensaje(cause instanceof Error ? cause.message : "No fue posible enviar la invitación."); }
    finally { setFinalizandoId(""); }
  };

  const ayudasFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();
    const inicio = fechaInicio ? new Date(fechaInicio) : null;
    const fin = fechaFin ? new Date(`${fechaFin}T23:59:59.999`) : null;

    return ayudas.filter((ayuda) => {
      const coincideBusqueda =
        texto === "" ||
        ayuda.nombre_victima.toLowerCase().includes(texto) ||
        ayuda.apellido_victima.toLowerCase().includes(texto) ||
        ayuda.numero_identificacion.toLowerCase().includes(texto) ||
        ayuda.correo_victima.toLowerCase().includes(texto);

      const coincideEstado =
        filtroEstado === "todos" || ayuda.estado === filtroEstado;

      const coincidePago =
        filtroPago === "todos" || ayuda.pago_unico === filtroPago;

      const fechaCreacion = new Date(ayuda.created_at);
      const coincideFecha =
        (!inicio || fechaCreacion >= inicio) && (!fin || fechaCreacion <= fin);

      return coincideBusqueda && coincideEstado && coincidePago && coincideFecha;
    });
  }, [ayudas, busqueda, filtroEstado, filtroPago, fechaInicio, fechaFin]);

  const totalSolicitudes = ayudas.length;
  const pendientes = ayudas.filter((a) => a.estado.toLowerCase().includes("pendiente")).length;
  const aprobadas = ayudas.filter((a) => a.estado.toLowerCase() === "aprobado").length;
  const rechazadas = ayudas.filter((a) => a.estado.toLowerCase() === "rechazado").length;

  const totalPaginas = Math.ceil(ayudasFiltradas.length / ITEMS_PER_PAGE);
  const inicioPagina = (paginaActual - 1) * ITEMS_PER_PAGE;
  const ayudasPaginadas = ayudasFiltradas.slice(inicioPagina, inicioPagina + ITEMS_PER_PAGE);

  const cambiarPagina = (pagina: number) => {
    if (pagina < 1 || pagina > totalPaginas) return;
    setPaginaActual(pagina);
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroEstado("todos");
    setFiltroPago("todos");
    setFechaInicio("");
    setFechaFin("");
    setPaginaActual(1);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-[#f5f5f5]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#8e2329] border-t-transparent" />

          <p className="text-gray-600">
            Cargando solicitudes...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] bg-[#f5f5f5] px-4 py-10">
        <div className="mx-auto max-w-4xl rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <div className="mb-3 text-3xl">⚠️</div>
          <h2 className="font-bold text-red-800">Ocurrió un error</h2>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button
            onClick={obtenerAyudas}
            className="mt-5 rounded-lg bg-[#8e2329] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#701b20]"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#8e2329]">
              Ayudas humanitarias
            </h1>
            <p className="mt-1 text-gray-600">
              Administración de solicitudes de ayuda humanitaria.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setExportarAbierto(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#8e2329] bg-white px-5 py-3 text-sm font-semibold text-[#8e2329] shadow-sm transition hover:bg-[#8e2329]/5"
            >
              <span>⤓</span>
              Exportar CSV
            </button>

            <button
              onClick={obtenerAyudas}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#8e2329] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#701b20]"
            >
              <span>↻</span>
              Actualizar
            </button>
          </div>
        </div>

        <ExportarCasos
          tipoCaso="ayuda_humanitaria"
          abierto={exportarAbierto}
          onCerrar={() => setExportarAbierto(false)}
        />

        <EstadisticasAyuda
          total={totalSolicitudes}
          pendientes={pendientes}
          aprobadas={aprobadas}
          rechazadas={rechazadas}
        />

        <FiltrosAyuda
          busqueda={busqueda}
          onBusquedaChange={(valor) => {
            setBusqueda(valor);
            setPaginaActual(1);
          }}
          filtroEstado={filtroEstado}
          onFiltroEstadoChange={(valor) => {
            setFiltroEstado(valor);
            setPaginaActual(1);
          }}
          filtroPago={filtroPago}
          onFiltroPagoChange={(valor) => {
            setFiltroPago(valor);
            setPaginaActual(1);
          }}
          fechaInicio={fechaInicio}
          onFechaInicioChange={(valor) => {
            setFechaInicio(valor);
            setPaginaActual(1);
          }}
          fechaFin={fechaFin}
          onFechaFinChange={(valor) => {
            setFechaFin(valor);
            setPaginaActual(1);
          }}
          onLimpiarFiltros={limpiarFiltros}
        />
        {mensaje && <p className="mb-5 border-l-4 border-[#ed5a0b] bg-orange-50 p-4 text-sm text-slate-800">{mensaje}</p>}

        <TablaAyudas
          ayudas={ayudasPaginadas}
          total={ayudasFiltradas.length}
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          onCambiarPagina={cambiarPagina}
          onFinalizar={finalizarCaso}
          finalizandoId={finalizandoId}
        />
      </div>

    </div>
  );
}