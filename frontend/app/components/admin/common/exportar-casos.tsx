"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { adminFetch } from "@/lib/api/admin-fetch";

type CampoExportable = { campo: string; etiqueta: string };

interface ExportarCasosProps {
  tipoCaso: "ayuda_humanitaria" | "pasantia" | "proteccion_colectiva";
  abierto: boolean;
  onCerrar: () => void;
}

export default function ExportarCasos({ tipoCaso, abierto, onCerrar }: ExportarCasosProps) {
  const [campos, setCampos] = useState<CampoExportable[]>([]);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [cargandoCampos, setCargandoCampos] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!abierto) return;
    void (async () => {
      try {
        setCargandoCampos(true);
        setMensaje("");
        const respuesta = await adminFetch(`/api/admin/exportar/${tipoCaso}/campos`);
        const datos = await respuesta.json();
        if (!respuesta.ok) throw new Error(datos.message || "No fue posible cargar los campos.");
        const lista: CampoExportable[] = Array.isArray(datos) ? datos : [];
        setCampos(lista);
        setSeleccionados(new Set(lista.map((campo) => campo.campo)));
      } catch (error) {
        setMensaje(error instanceof Error ? error.message : "No fue posible cargar los campos.");
      } finally { setCargandoCampos(false); }
    })();
  }, [abierto, tipoCaso]);

  const alternar = (campo: string) => {
    setSeleccionados((prev) => {
      const nuevo = new Set(prev);
      if (nuevo.has(campo)) nuevo.delete(campo);
      else nuevo.add(campo);
      return nuevo;
    });
  };

  const exportar = async () => {
    try {
      setExportando(true);
      setMensaje("");
      const params = new URLSearchParams();
      seleccionados.forEach((campo) => params.append("campos[]", campo));
      if (fechaInicio) params.set("fecha_inicio", fechaInicio);
      if (fechaFin) params.set("fecha_fin", fechaFin);

      const respuesta = await adminFetch(`/api/admin/exportar/${tipoCaso}/csv?${params.toString()}`);
      if (!respuesta.ok) {
        const datos = await respuesta.json().catch(() => null);
        throw new Error(datos?.message || "No fue posible exportar.");
      }
      const blob = await respuesta.blob();
      const url = window.URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `casos_${tipoCaso}.csv`;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.URL.revokeObjectURL(url);
      onCerrar();
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : "No fue posible exportar.");
    } finally { setExportando(false); }
  };

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6" onClick={onCerrar}>
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between bg-[#92212a] px-6 py-4 text-white">
          <div>
            <h2 className="font-bold">Exportar casos a CSV</h2>
            <p className="mt-0.5 text-xs text-white/80">Seleccione los campos y el rango de fechas a exportar.</p>
          </div>
          <button type="button" onClick={onCerrar} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" title="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
          {mensaje && <p className="rounded-lg border-l-4 border-[#92212a] bg-red-50 p-3 text-sm text-black">{mensaje}</p>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-black">
              Fecha desde
              <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal text-black outline-none focus:border-[#92212a]" />
            </label>
            <label className="block text-sm font-semibold text-black">
              Fecha hasta
              <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal text-black outline-none focus:border-[#92212a]" />
            </label>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-black">Campos a exportar ({seleccionados.size} de {campos.length})</p>
              <div className="flex gap-3 text-xs font-semibold">
                <button type="button" onClick={() => setSeleccionados(new Set(campos.map((campo) => campo.campo)))} className="text-[#92212a] hover:underline">Todos</button>
                <button type="button" onClick={() => setSeleccionados(new Set())} className="text-gray-500 hover:underline">Ninguno</button>
              </div>
            </div>

            {cargandoCampos ? (
              <p className="py-6 text-center text-sm text-gray-500">Cargando campos...</p>
            ) : (
              <div className="grid max-h-64 grid-cols-1 gap-1 overflow-y-auto rounded-lg border border-gray-200 p-3 sm:grid-cols-2">
                {campos.map((campo) => (
                  <label key={campo.campo} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-black hover:bg-gray-50">
                    <input type="checkbox" checked={seleccionados.has(campo.campo)} onChange={() => alternar(campo.campo)} className="accent-[#92212a]" />
                    {campo.etiqueta}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button type="button" onClick={onCerrar} className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancelar</button>
          <button type="button" onClick={() => void exportar()} disabled={exportando || seleccionados.size === 0} className="inline-flex items-center gap-2 rounded-lg bg-[#92212a] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#701b20] disabled:opacity-60">
            <Download className="h-4 w-4" />{exportando ? "Exportando..." : "Exportar CSV"}
          </button>
        </div>
      </div>
    </div>
  );
}
