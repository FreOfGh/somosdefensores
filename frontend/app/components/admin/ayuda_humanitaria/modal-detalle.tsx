import { AyudaHumanitaria } from "@/types/admin/ayuda-humanitaria.types";
import {
  formatearFechaCompleta,
  obtenerColorEstado,
  obtenerColorPago,
} from "./utils";

interface ModalDetalleAyudaProps {
  ayuda: AyudaHumanitaria;
  onCerrar: () => void;
}

export default function ModalDetalleAyuda({
  ayuda,
  onCerrar,
}: ModalDetalleAyudaProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      onClick={onCerrar}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#fefbfb] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between bg-[#8e2329] px-6 py-5 text-white">
          <div>
            <h2 className="text-xl font-bold">Detalles de la solicitud</h2>
            <p className="mt-1 text-sm text-white/80">
              Información de la ayuda humanitaria
            </p>
          </div>

          <button
            onClick={onCerrar}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xl hover:bg-white/20"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <h3 className="mb-4 text-lg font-bold text-[#8e2329]">
              Datos de la víctima
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Nombre
                </p>
                <p className="mt-1 text-gray-800">{ayuda.nombre_victima}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Apellido
                </p>
                <p className="mt-1 text-gray-800">{ayuda.apellido_victima}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Identificación
                </p>
                <p className="mt-1 text-gray-800">
                  {ayuda.numero_identificacion}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-[#8e2329]">
              Información de contacto
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Correo electrónico
                </p>
                <p className="mt-1 break-all text-gray-800">
                  {ayuda.correo_victima}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  WhatsApp
                </p>
                <p className="mt-1 text-gray-800">
                  {ayuda.numero_whatsapp || "No registrado"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-[#8e2329]">
              Estado de la solicitud
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Estado
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${obtenerColorEstado(
                    ayuda.estado
                  )}`}
                >
                  {ayuda.estado}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Pago único
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${obtenerColorPago(
                    ayuda.pago_unico
                  )}`}
                >
                  {ayuda.pago_unico}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-[#8e2329]">
              Información del registro
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Fecha de creación
                </p>
                <p className="mt-1 text-sm text-gray-800">
                  {formatearFechaCompleta(ayuda.created_at)}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Última actualización
                </p>
                <p className="mt-1 text-sm text-gray-800">
                  {formatearFechaCompleta(ayuda.updated_at)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-gray-100 p-4">
            <p className="text-xs font-semibold uppercase text-gray-500">
              Identificador de solicitud
            </p>
            <p className="mt-1 break-all font-mono text-xs text-gray-700">
              {ayuda.id}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onCerrar}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cerrar
          </button>

          <button
            onClick={() => console.log("Gestionar:", ayuda.id)}
            className="rounded-lg bg-[#8e2329] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#701b20]"
          >
            Gestionar solicitud
          </button>
        </div>
      </div>
    </div>
  );
}
