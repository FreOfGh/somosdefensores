import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, HeartHandshake, UsersRound } from "lucide-react";
import Navbar from "../components/casos/navbar";
import Footer from "../components/casos/footer";
import { formOptions } from "@/lib/data/rutas";

const formIcons = {
  ayuda_humanitaria: HeartHandshake,
  pasantia: BriefcaseBusiness,
  proteccion_colectiva: UsersRound,
};

export default function FormulariosPage() {
  return (
    <div className="flex min-h-full flex-col bg-[#f3eee7]">
      <Navbar />
      <main className="flex-1 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#a82d35]">Solicita acompañamiento</p>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-6xl">Selecciona el tipo de formulario</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Elige la opción que corresponde a tu solicitud. Te guiaremos paso a paso para registrar la información necesaria.</p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {formOptions.map((option) => {
              const Icon = formIcons[option.id];

              return (
                <Link
                  key={option.id}
                  href={option.href}
                  className="group flex min-h-[20rem] flex-col justify-between border-t-4 border-[#a82d35] bg-white p-7 shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a82d35]"
                >
                  <div>
                    <span className="flex h-12 w-12 items-center justify-center bg-[#172936] text-[#e5b15e]">
                      <Icon size={24} aria-hidden="true" />
                    </span>
                    <h2 className="mt-8 text-2xl font-bold leading-tight text-slate-950">{option.title}</h2>
                    <p className="mt-4 text-sm leading-6 text-slate-600">{option.description}</p>
                  </div>
                  <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#a82d35]">
                    Iniciar formulario <ArrowUpRight size={17} aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}