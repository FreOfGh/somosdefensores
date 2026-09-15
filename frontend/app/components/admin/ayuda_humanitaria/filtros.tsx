interface FiltrosAyudaProps {
  busqueda: string;
  onBusquedaChange: (valor: string) => void;
  filtroEstado: string;
  onFiltroEstadoChange: (valor: string) => void;
  filtroPago: string;
  onFiltroPagoChange: (valor: string) => void;
  fechaInicio: string;
  onFechaInicioChange: (valor: string) => void;
  fechaFin: string;
  onFechaFinChange: (valor: string) => void;
  onLimpiarFiltros: () => void;
}

export default function FiltrosAyuda({
  busqueda,
  onBusquedaChange,
  filtroEstado,
  onFiltroEstadoChange,
  filtroPago,
  onFiltroPagoChange,
  fechaInicio,
  onFechaInicioChange,
  fechaFin,
  onFechaFinChange,
  onLimpiarFiltros,
}: FiltrosAyudaProps) {
  const hayFiltrosActivos =
    busqueda ||
    filtroEstado !== "todos" ||
    filtroPago !== "todos" ||
    fechaInicio ||
    fechaFin;

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-[#fefbfb] p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-semibold text-black">
            Buscar
          </label>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            placeholder="Nombre, identificación o correo..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#8e2329] focus:ring-2 focus:ring-[#8e2329]/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-black">
            Estado
          </label>
          <select
            value={filtroEstado}
            onChange={(e) => onFiltroEstadoChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#8e2329] focus:ring-2 focus:ring-[#8e2329]/20"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente de revisión">Pendiente de revisión</option>
            <option value="en proceso de validación">En proceso de validación</option>
            <option value="rechazado">Rechazado</option>
            <option value="aprobado">Aprobado</option>
            <option value="esperando desembolso">Esperando desembolso</option>
            <option value="desembolsado">Desembolsado</option>
            <option value="en proceso de cierre">En proceso de cierre</option>
            <option value="cerrado">Cerrado</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-black">
            Pago único
          </label>
          <select
            value={filtroPago}
            onChange={(e) => onFiltroPagoChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#8e2329] focus:ring-2 focus:ring-[#8e2329]/20"
          >
            <option value="todos">Todos</option>
            <option value="pendiente de desembolso">Pendiente de desembolso</option>
            <option value="desembolsado">Desembolsado</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-black">
            Fecha desde
          </label>
          <input
            type="date"
            value={fechaInicio}
            max={fechaFin || undefined}
            onChange={(e) => onFechaInicioChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-black outline-none focus:border-[#8e2329] focus:ring-2 focus:ring-[#8e2329]/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-black">
            Fecha hasta
          </label>
          <input
            type="date"
            value={fechaFin}
            min={fechaInicio || undefined}
            onChange={(e) => onFechaFinChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-black outline-none focus:border-[#8e2329] focus:ring-2 focus:ring-[#8e2329]/20"
          />
        </div>
      </div>

      {hayFiltrosActivos && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onLimpiarFiltros}
            className="text-sm font-semibold text-[#8e2329] hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
