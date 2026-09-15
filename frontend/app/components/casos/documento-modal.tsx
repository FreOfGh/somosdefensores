"use client";

import { Maximize2, X } from "lucide-react";
import { useState } from "react";

interface DocumentoModalProps {
  nombre: string;
  url: string;
}

export default function DocumentoModal({ nombre, url }: DocumentoModalProps) {
  const [abierto, setAbierto] = useState(false);

  return <>
    <button type="button" onClick={() => setAbierto(true)} className="block w-full text-left" title={`Ampliar ${nombre}`}>
      <iframe src={url} sandbox="" title={`Vista previa de ${nombre}`} className="h-72 w-full border border-gray-300 bg-white pointer-events-none" />
      <span className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-black"><Maximize2 className="h-4 w-4" />Abrir vista grande</span>
    </button>
    {abierto && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label={`Vista ampliada de ${nombre}`}>
      <section className="flex h-[90vh] w-full max-w-6xl flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-gray-300 px-4 py-3"><h2 className="text-sm font-bold text-black">{nombre}</h2><button type="button" onClick={() => setAbierto(false)} className="inline-flex h-9 w-9 items-center justify-center border border-gray-400 text-black" title="Cerrar vista previa"><X className="h-5 w-5" /><span className="sr-only">Cerrar</span></button></header>
        <iframe src={url} sandbox="" title={`Vista ampliada de ${nombre}`} className="min-h-0 flex-1 w-full bg-white" />
      </section>
    </div>}
  </>;
}
