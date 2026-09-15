import { AyudaHumanitaria } from "@/types/admin/ayuda-humanitaria.types";
import TablaCasos, { FilaCaso } from "@/app/components/admin/common/tabla-casos";

interface TablaAyudasProps {
  ayudas: AyudaHumanitaria[];
  total: number;
  paginaActual: number;
  totalPaginas: number;
  onCambiarPagina: (pagina: number) => void;
  onFinalizar: (ayuda: AyudaHumanitaria) => void;
  finalizandoId?: string;
}

export default function TablaAyudas({
  ayudas,
  total,
  paginaActual,
  totalPaginas,
  onCambiarPagina,
  onFinalizar,
  finalizandoId,
}: TablaAyudasProps) {
  const filas: FilaCaso[] = ayudas.map((ayuda) => ({
    id: ayuda.id,
    nombre: `${ayuda.nombre_victima} ${ayuda.apellido_victima}`,
    identificacion: ayuda.numero_identificacion,
    telefono: ayuda.numero_whatsapp || "",
    correo: ayuda.correo_victima,
    estado: ayuda.estado,
    createdAt: ayuda.created_at,
  }));

  return (
    <div className="border border-stone-200 bg-white shadow-sm">
      <TablaCasos filas={filas} gestionarHref={(id) => `/admin/ayuda_humanitaria/${id}/gestionar`} onFinalizar={(fila) => { const ayuda = ayudas.find((item) => item.id === fila.id); if (ayuda) onFinalizar(ayuda); }} finalizandoId={finalizandoId} />

      <div className="flex flex-col gap-4 border-t border-gray-200 bg-gray-50 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-gray-600">
          Mostrando <span className="font-semibold">{ayudas.length}</span> de{" "}
          <span className="font-semibold">{total}</span> solicitudes
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onCambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            ←
          </button>

          <span className="px-3 text-sm text-gray-600">
            Página{" "}
            <span className="font-semibold">
              {totalPaginas === 0 ? 0 : paginaActual}
            </span>{" "}
            de <span className="font-semibold">{totalPaginas}</span>
          </span>

          <button
            onClick={() => onCambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas || totalPaginas === 0}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
