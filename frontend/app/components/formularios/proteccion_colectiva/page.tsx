
"use client";

import { FormEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FormularioProteccionColectiva,
  formularioProteccionColectivaInicial,
} from "@/types/formularios/proteccion-colectiva.types";
import { enviarProteccionColectiva } from "@/services/formularios/proteccion-colectiva.service";
import Stepper from "@/app/components/formularios/shared/stepper";
import PasoInformacionGeneral from "./paso1";
import PasoSeguridadYProteccion from "./paso2";


export default function FormularioProteccionColectivaPage() {
  const [formulario, setFormulario] = useState<FormularioProteccionColectiva>(
    formularioProteccionColectivaInicial
  );

  const [paso, setPaso] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});

  const actualizarCampo = (
    campo: keyof FormularioProteccionColectiva,
    valor: string
  ) => {
    setFormulario((prev) => ({ ...prev, [campo]: valor }));
    const error = validarCampo(campo, valor);
    setErrores((prev) => {
      const nuevosErrores = { ...prev };
      if (error) nuevosErrores[campo] = error;
      else delete nuevosErrores[campo];
      return nuevosErrores;
    });
  };

  const validarPaso = () => {
    const nuevosErrores: Record<string, string> = {};

    if (paso === 1) {
      if (!formulario.fecha_remision_caso)
        nuevosErrores.fecha_remision_caso = "La fecha de remisión es obligatoria.";
      if (!formulario.tiene_personeria_juridica)
        nuevosErrores.tiene_personeria_juridica = "Selecciona una opción.";
      if (!formulario.nombre_organizacion.trim())
        nuevosErrores.nombre_organizacion =
          "El nombre de la organización es obligatorio.";
      if (!formulario.representante_nombre.trim())
        nuevosErrores.representante_nombre =
          "El nombre del representante es obligatorio.";
      if (!formulario.representante_apellido.trim())
        nuevosErrores.representante_apellido =
          "El apellido del representante es obligatorio.";
      if (!formulario.cedula.trim())
        nuevosErrores.cedula = "La identificación es obligatoria.";
      if (!formulario.telefono.trim())
        nuevosErrores.telefono = "El teléfono es obligatorio.";
      if (!formulario.correo.trim())
        nuevosErrores.correo = "El correo electrónico es obligatorio.";
    }

    if (paso === 2) {
      if (!formulario.departamento.trim())
        nuevosErrores.departamento = "El departamento es obligatorio.";
      if (!formulario.municipio.trim())
        nuevosErrores.municipio = "El municipio es obligatorio.";
      if (!formulario.descripcion_organizacion.trim())
        nuevosErrores.descripcion_organizacion = "Este campo es obligatorio.";
      if (!formulario.trabajos_realiza.trim())
        nuevosErrores.trabajos_realiza = "Este campo es obligatorio.";
      if (!formulario.riesgos_seguridad.trim())
        nuevosErrores.riesgos_seguridad = "Este campo es obligatorio.";
      if (!formulario.medidas_proteccion.trim())
        nuevosErrores.medidas_proteccion = "Este campo es obligatorio.";
      if (!formulario.justificacion_medidas.trim())
        nuevosErrores.justificacion_medidas = "Este campo es obligatorio.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const siguientePaso = () => {
    if (!validarPaso()) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
    setPaso(2);
  };

  const pasoAnterior = () => {
    setPaso(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const enviarFormulario = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validarPaso()) return;

    try {
      setEnviando(true);
      setMensaje("");
      await enviarProteccionColectiva(formulario);
      setMensaje("La solicitud fue enviada correctamente.");
      setFormulario(formularioProteccionColectivaInicial);
      setPaso(1);
    } catch (error) {
      console.error(error);
      setMensaje(
        "Ocurrió un error al enviar la solicitud. Intenta nuevamente."
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[#8e2329] md:text-3xl">
            Solicitud de Protección Colectiva
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Complete la siguiente información para solicitar medidas de
            protección colectiva para su organización, colectivo o comunidad.
          </p>
        </div>

        <Stepper
          pasoActual={paso}
          pasos={[
            { numero: 1, etiqueta: "Información general" },
            { numero: 2, etiqueta: "Seguridad y protección" },
          ]}
        />

        <AnimatePresence>
        {mensaje && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className={`mb-6 rounded-lg p-4 text-sm ${
              mensaje.includes("correctamente")
                ? "border border-green-700 bg-green-100 text-black"
                : "border border-red-700 bg-red-100 text-black"
            }`}
          >
            {mensaje}
          </motion.div>
        )}
        </AnimatePresence>

        <form onSubmit={enviarFormulario}>
          <AnimatePresence mode="wait">
            <motion.div
              key={paso}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {paso === 1 && (
                <PasoInformacionGeneral
                  formulario={formulario}
                  errores={errores}
                  onCampoChange={actualizarCampo}
                  onSiguiente={siguientePaso}
                />
              )}

              {paso === 2 && (
                <PasoSeguridadYProteccion
                  formulario={formulario}
                  errores={errores}
                  onCampoChange={actualizarCampo}
                  onVolver={pasoAnterior}
                  enviando={enviando}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </form>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
          <p className="font-semibold text-gray-800">Importante</p>

          <p className="mt-2 leading-6">
            La información proporcionada en este formulario será utilizada
            para evaluar la solicitud de medidas de protección colectiva.
            Procure suministrar información clara, completa y veraz.
          </p>

          <p className="mt-2 text-xs text-gray-500">
            Los campos marcados con <span className="text-[#8e2329]">*</span>{" "}
            son obligatorios.
          </p>
        </div>
      </div>
    </div>
  );
}

function validarCampo(campo: keyof FormularioProteccionColectiva, valor: string): string | undefined {
  const obligatorios: Partial<Record<keyof FormularioProteccionColectiva, string>> = {
    fecha_remision_caso: "La fecha de remisión es obligatoria.",
    tiene_personeria_juridica: "Selecciona una opción.",
    nombre_organizacion: "El nombre de la organización es obligatorio.",
    representante_nombre: "El nombre del representante es obligatorio.",
    representante_apellido: "El apellido del representante es obligatorio.",
    cedula: "La identificación es obligatoria.", telefono: "El teléfono es obligatorio.",
    correo: "El correo electrónico es obligatorio.", departamento: "El departamento es obligatorio.",
    municipio: "El municipio es obligatorio.", descripcion_organizacion: "Este campo es obligatorio.",
    trabajos_realiza: "Este campo es obligatorio.", riesgos_seguridad: "Este campo es obligatorio.",
    medidas_proteccion: "Este campo es obligatorio.", justificacion_medidas: "Este campo es obligatorio.",
  };
  if (obligatorios[campo] && !valor.trim()) return obligatorios[campo];
  if (campo === "correo" && valor && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return "Ingrese un correo electrónico válido.";
  return undefined;
}

