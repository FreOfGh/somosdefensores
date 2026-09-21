import { MapPinned } from "lucide-react";
import MapaDepartamentos from "./mapa-departamentos";

export default function ImpactoNacional() {
  return (
    <section className="flex min-h-screen items-center overflow-hidden bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 text-[#a82d35]"><MapPinned size={20} aria-hidden="true" /><span className="text-xs font-bold uppercase tracking-[0.2em]">Impacto nacional</span></div>
          <h2 className="max-w-xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">Una presencia que recorre todo el país.</h2>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">Estamos presentes en los 32 departamentos de Colombia, acompañando a comunidades y personas defensoras de derechos humanos en cada territorio.</p>
          <div className="mt-10 flex items-end gap-4 border-t border-slate-200 pt-6"><strong className="text-6xl font-black leading-none text-[#a82d35]">32</strong><span className="max-w-32 pb-1 text-sm font-bold uppercase leading-5 tracking-wider text-slate-500">departamentos con presencia</span></div>
        </div>
        <MapaDepartamentos />
      </div>
    </section>
  );
}
