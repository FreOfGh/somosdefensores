"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

      </div>
    </section>
  );
}