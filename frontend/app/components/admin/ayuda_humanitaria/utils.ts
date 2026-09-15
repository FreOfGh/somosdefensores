export function formatearFecha(fecha: string) {
  if (!fecha) return "Sin fecha";

  return new Date(fecha).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatearFechaCompleta(fecha: string) {
  if (!fecha) return "Sin fecha";

  return new Date(fecha).toLocaleString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const COLORES_ESTADO: Record<string, string> = {
  "pendiente de revisión": "bg-yellow-100 text-yellow-800",
  "en proceso de validación": "bg-blue-100 text-blue-800",
  rechazado: "bg-red-100 text-red-800",
  aprobado: "bg-green-100 text-green-800",
  "esperando desembolso": "bg-purple-100 text-purple-800",
  desembolsado: "bg-teal-100 text-teal-800",
  "en proceso de cierre": "bg-indigo-100 text-indigo-800",
  cerrado: "bg-gray-200 text-gray-800",
};

export function obtenerColorEstado(estado: string) {
  return COLORES_ESTADO[estado.toLowerCase()] ?? "bg-gray-100 text-gray-800";
}

export function obtenerColorPago(pago: string) {
  const pagoNormalizado = pago.toLowerCase();

  if (pagoNormalizado.includes("pendiente")) return "bg-yellow-100 text-yellow-800";
  if (pagoNormalizado.includes("desembolsado") || pagoNormalizado.includes("pagado")) return "bg-green-100 text-green-800";
  if (pagoNormalizado.includes("rechazado")) return "bg-red-100 text-red-800";

  return "bg-gray-100 text-gray-800";
}
