interface EstadisticasAyudaProps {
  total: number;
  pendientes: number;
  aprobadas: number;
  rechazadas: number;
}

export default function EstadisticasAyuda({
  total,
  pendientes,
  aprobadas,
  rechazadas,
}: EstadisticasAyudaProps) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-gray-200 bg-[#fefbfb] p-5 shadow-sm">
        <p className="text-sm text-gray-500">Total solicitudes</p>
        <p className="mt-2 text-3xl font-bold text-[#8e2329]">{total}</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-[#fefbfb] p-5 shadow-sm">
        <p className="text-sm text-gray-500">Pendientes</p>
        <p className="mt-2 text-3xl font-bold text-yellow-600">{pendientes}</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-[#fefbfb] p-5 shadow-sm">
        <p className="text-sm text-gray-500">Aprobadas</p>
        <p className="mt-2 text-3xl font-bold text-green-600">{aprobadas}</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-[#fefbfb] p-5 shadow-sm">
        <p className="text-sm text-gray-500">Rechazadas</p>
        <p className="mt-2 text-3xl font-bold text-red-600">{rechazadas}</p>
      </div>
    </div>
  );
}
