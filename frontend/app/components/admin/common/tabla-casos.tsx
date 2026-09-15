import { Pencil } from "lucide-react";
import Link from "next/link";

export interface FilaCaso {
  id: string;
  nombre: string;
  identificacion: string;
  telefono: string;
  correo: string;
  estado: string;
  createdAt: string;
}

interface TablaCasosProps {
  filas: FilaCaso[];
  gestionarHref: (id: string) => string;
  onFinalizar?: (fila: FilaCaso) => void;
  finalizandoId?: string;
}

export default function TablaCasos({ filas, gestionarHref }: TablaCasosProps) {
  return (
    <section className="overflow-x-auto border border-stone-200 bg-white shadow-sm">
      <table className="min-w-[980px] w-full text-left text-sm">
        <thead className="border-b-4 border-[#ed5a0b] bg-[#92212a] text-white">
          <tr>
            <th className="px-5 py-4 font-semibold">Caso</th>
            <th className="px-5 py-4 font-semibold">Cédula</th>
            <th className="px-5 py-4 font-semibold">Teléfono</th>
            <th className="px-5 py-4 font-semibold">Estado</th>
            <th className="px-5 py-4 font-semibold">Correo</th>
            <th className="px-5 py-4 font-semibold">Registro</th>
            <th className="px-5 py-4 text-right font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200">
          {filas.map((fila) => (
            <tr key={fila.id} className="text-slate-700 hover:bg-stone-50">
              <td className="px-5 py-4 font-semibold text-slate-900">{fila.nombre}</td>
              <td className="px-5 py-4">{fila.identificacion || "Sin registrar"}</td>
              <td className="px-5 py-4">{fila.telefono || "Sin registrar"}</td>
              <td className="px-5 py-4"><span className="inline-flex bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">{fila.estado}</span></td>
              <td className="px-5 py-4 break-all">{fila.correo || "Sin registrar"}</td>
              <td className="px-5 py-4">{new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(fila.createdAt))}</td>
              <td className="px-5 py-4"><div className="flex justify-end gap-2"><Link href={gestionarHref(fila.id)} className="inline-flex h-9 w-9 items-center justify-center border border-[#92212a] text-[#92212a] hover:bg-[#92212a] hover:text-white" title="Gestionar caso"><Pencil className="h-4 w-4" aria-hidden="true" /><span className="sr-only">Gestionar {fila.nombre}</span></Link></div></td>
            </tr>
          ))}
          {!filas.length && <tr><td colSpan={7} className="px-5 py-14 text-center text-slate-500">No hay casos para mostrar.</td></tr>}
        </tbody>
      </table>
    </section>
  );
}