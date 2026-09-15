'use client';

import Link from 'next/link';
import React from 'react';
import { useDashboardStats } from "@/hooks/home/metrics";
import {
  BarChart3,
  FileSearch,
  Users,
  ArrowUpRight,
  Eye
} from 'lucide-react';

const Metricas = () => {
    const {
    data,
    loading,
    error,
  } = useDashboardStats();

  const stats = React.useMemo(() => {
    if (!data) return [];

    return [
      {
        label: 'Total de casos recibidos',
        value: data.casos_totales,
        icon: FileSearch,
        color: 'text-red-600',
      },
      {
        label: 'Porcentaje de confirmación de casos',
        value: `${(data.casos_atendidos / data.casos_totales * 100).toFixed(2)}%`,
        icon: Eye,
        color: 'text-green-600',
      },
      {
        label: 'Presencia en municipios',
        value: '125',
        icon: Users,
        color: 'text-green-600',
      },
    ];
  }, [data]);

  return (
    <section className="py-20 bg-white text-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Datos Abiertos para la <br />
              <span className="text-red-900">
                Transparencia del Territorio
              </span>
            </h2>

            <p className="text-black text-lg">
              Creemos en la transparencia de datos. Nuestra base de datos de
              derechos humanos es accesible al público, permitiendo auditoría
              social y análisis ciudadano de forma inmediata.
            </p>
          </div>

          <Link
            href="/reportes"
            className="flex items-center border border-red-900 gap-2 bg-white hover:bg-red-200 text-black px-6 py-3 rounded-xl font-bold transition-all group"
          >
            Reportes disponibles
            <ArrowUpRight
              size={20}
              className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
            />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Estadísticas */}
          <div className="md:col-span-2 bg-white border border-red-900 p-8 rounded-3xl backdrop-blur-sm">

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <BarChart3 className="text-black" />
                </div>

                <h3 className="text-xl font-bold">
                  Consolidado Nacional
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {stats.length > 0 &&
                stats.map((stat, index) => (
                  <div key={index} className="space-y-2">
                    <div
                      className={`p-2 w-fit rounded-md bg-white/5 ${stat.color}`}
                    >
                      <stat.icon size={20} />
                    </div>

                    <p className="text-3xl text-black">
                      {stat.value}
                    </p>

                    <p className="text-black text-sm font-medium uppercase tracking-wider">
                      {stat.label}
                    </p>
                  </div>
                ))}
            </div>

            {/* Barra progreso */}
            <div className="mt-10 pt-8 border-t border-slate-700/50">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-black">
                  Progreso de verificación de casos en 2026
                </span>

                <span className="text-black font-bold">
                  {data?.casos_totales ? ((data.casos_atendidos / data.casos_totales) * 100).toFixed(2) : 0}%
                </span>
              </div>

              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-900 transition-all duration-1000 ease-out rounded-full shadow-[0_0_15px_rgba(128,21,21,0.3)]"
                  style={{
                    width: `${data?.casos_totales ? ((data.casos_atendidos / data.casos_totales) * 100).toFixed(2) : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Reportes rápidos */}
          <div className="bg-white border border-red-900 p-8 rounded-3xl flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-black">
                Reportes de acceso rápido
              </h3>

              <p className="text-black mb-6">
                Descarga informes detallados en formato PDF o Excel filtrando
                por municipio, subregión o tipo de vulneración.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href={"api/reportes/general_casos/export"}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-red-200 transition-colors p-4 rounded-2xl border border-red-900 cursor-pointer flex items-center justify-between"
              >
                <span className="font-medium text-sm">
                  Reporte general en CSV
                </span>

                <span className="text-[10px] bg-white/20 px-2 py-1 rounded text-black uppercase font-bold">
                  CSV
                </span>
              </a>
            </div>
          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-black text-sm mt-12">
          * Los datos mostrados corresponden a registros anonimizados para
          proteger la integridad de las víctimas.
        </p>

      </div>
    </section>
  );
};

export default Metricas;
