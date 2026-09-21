import Link from "next/link";
import { ArrowUpRight, BarChart3, Clock3, FileText, MapPinned, TrendingUp } from "lucide-react";
import Navbar from "../components/casos/navbar";
import Footer from "../components/casos/footer";
import { publicReports } from "@/lib/data/rutas";

const reportIcons = [MapPinned, TrendingUp, BarChart3];

export default function ReportesPage() {
  return (
    <div className="flex min-h-full flex-col bg-[#f3eee7]">
      <Navbar />
      <main className="flex-1">
        <section className="bg-[#172936] px-4 py-14 text-white sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#e5b15e]">Fuente pública de datos</p>
            <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">Reportes para comprender el territorio.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Consulta los informes públicos sobre las realidades de quienes defienden los derechos humanos. Esta sección se encuentra en construcción.</p>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-300 pb-6 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a82d35]">Biblioteca de reportes</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Información pública disponible</h2>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500"><Clock3 size={16} aria-hidden="true" />Actualización progresiva</span>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {publicReports.map((report, index) => {
                const Icon = reportIcons[index];
                const isAvailable = report.href !== "#";

                return (
                  <article key={report.id} className="flex min-h-[24rem] flex-col justify-between border-t-4 border-[#a82d35] bg-white p-7 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <span className="flex h-12 w-12 items-center justify-center bg-[#172936] text-[#e5b15e]"><Icon size={23} aria-hidden="true" /></span>
                        <span className="bg-[#f3eee7] px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-[#a82d35]">Demo</span>
                      </div>
                      <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{report.category}</p>
                      <h3 className="mt-3 text-2xl font-bold leading-tight text-slate-950">{report.title}</h3>
                      <p className="mt-4 text-sm leading-6 text-slate-600">{report.description}</p>
                    </div>
                    <div className="mt-8 border-t border-slate-200 pt-5">
                      <p className="text-xs text-slate-500">{report.updatedAt}</p>
                      {isAvailable ? (
                        <Link href={report.href} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#a82d35] hover:text-[#87242b]">Explorar reporte <ArrowUpRight size={17} aria-hidden="true" /></Link>
                      ) : (
                        <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-slate-400"><FileText size={17} aria-hidden="true" />Próximamente</span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}