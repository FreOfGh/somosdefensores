"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { navFormulario } from "@/lib/data/rutas";

export default function SeleccionFormulario() {
  const router = useRouter();
  const [activeDescription, setActiveDescription] = useState<string | null>(
    null
  );

  const handleFormulario = (href: string, id: string) => {
    router.push(`${href}?tipo=${id}`);
  };

  return (
    <section className="min-h-screen bg-[#f5f5f5] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-[#8e2329]">
            Selecciona un formulario
          </h2>

          <p className="mt-2 text-gray-600">
            Elige el formulario que corresponda a tu solicitud.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {navFormulario.map((formulario) => {
            const isDescriptionOpen =
              activeDescription === formulario.id;

            return (
              <div
                key={formulario.id}
                className="relative overflow-hidden rounded-2xl border border-gray-200 bg-[#fefbfb] shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Botón de información */}
                <button
                  type="button"
                  onClick={() =>
                    setActiveDescription(
                      isDescriptionOpen ? null : formulario.id
                    )
                  }
                  aria-label={`Información sobre ${formulario.name}`}
                  className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#8e2329] font-bold text-[#8e2329] transition-colors hover:bg-[#8e2329] hover:text-white"
                >
                  ?
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleFormulario(formulario.href, formulario.id)
                  }
                  className="flex min-h-[150px] w-full flex-col items-start justify-center px-7 py-8 pr-16 text-left"
                >
                  <span className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#8e2329]">
                    Formulario
                  </span>

                  <h3 className="text-xl font-bold text-gray-800">
                    {formulario.name.replace("Formulario de ", "")}
                  </h3>

                  <span className="mt-4 inline-flex items-center font-semibold text-[#8e2329]">
                    Diligenciar formulario
                    <span className="ml-2 text-lg">→</span>
                  </span>
                </button>

                {/* Descripción */}
                {isDescriptionOpen && (
                  <div className="border-t border-[#8e2329]/20 bg-[#8e2329]/5 px-7 py-5">
                    <div className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#8e2329] text-sm font-bold text-white">
                        ?
                      </div>

                      <p className="text-sm leading-6 text-gray-700">
                        {formulario.descripcion}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}