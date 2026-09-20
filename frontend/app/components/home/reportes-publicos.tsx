import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BarChart3 } from "lucide-react";
import { publicReportsSection } from "@/lib/data/rutas";

export default function ReportesPublicos() {
  return (
    <section className="bg-[#172936] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        <div className="order-2 lg:order-1">
          <div className="mb-6 inline-flex items-center gap-2 text-[#e5b15e]">
            <BarChart3 size={20} aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">{publicReportsSection.eyebrow}</span>
          </div>
          <h2 className="max-w-xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">{publicReportsSection.title}</h2>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">{publicReportsSection.description}</p>
          <Link href={publicReportsSection.href} className="mt-8 inline-flex items-center gap-2 bg-[#a82d35] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#c04a4c]">
            Explorar reportes <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <div className="order-1 overflow-hidden bg-[#f3eee7] p-4 sm:p-6 lg:order-2 lg:p-8">
          <Image src={publicReportsSection.image} alt="Panel de reportes públicos con gráficos y datos" width={1200} height={760} className="h-auto w-full" />
        </div>
      </div>
    </section>
  );
}
