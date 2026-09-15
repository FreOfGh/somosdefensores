"use client";

import { motion } from "framer-motion";

interface PasoStepper {
  numero: number;
  etiqueta: string;
}

interface StepperProps {
  pasos: PasoStepper[];
  pasoActual: number;
}

export default function Stepper({ pasos, pasoActual }: StepperProps) {
  const progreso = pasos.length > 1 ? ((pasoActual - 1) / (pasos.length - 1)) * 100 : 100;

  return (
    <div className="mb-8 rounded-xl border border-gray-200 bg-[#fefbfb] p-5 shadow-sm">
      <div className="relative">
        <div className="absolute left-5 right-5 top-5 h-1 -translate-y-1/2 rounded bg-gray-200 sm:left-6 sm:right-6" />
        <motion.div
          className="absolute left-5 top-5 h-1 -translate-y-1/2 rounded bg-[#8e2329] sm:left-6"
          initial={false}
          animate={{ width: `calc(${progreso}% - ${progreso > 0 ? "2.5rem" : "0px"})` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          style={{ maxWidth: "calc(100% - 3rem)" }}
        />

        <div className="relative flex items-start justify-between">
          {pasos.map((paso) => {
            const activo = pasoActual >= paso.numero;
            const actual = pasoActual === paso.numero;
            return (
              <div key={paso.numero} className="flex flex-1 flex-col items-center text-center">
                <motion.div
                  animate={{ scale: actual ? 1.12 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm ${
                    activo ? "bg-[#8e2329] text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {paso.numero}
                </motion.div>
                <div
                  className={`mt-2 hidden max-w-[7rem] text-xs font-semibold sm:block ${
                    activo ? "text-[#8e2329]" : "text-gray-400"
                  }`}
                >
                  {paso.etiqueta}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
