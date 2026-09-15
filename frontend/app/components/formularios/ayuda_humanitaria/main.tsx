"use client";

import { FormEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Agresion,
  DocumentosAdjuntos,
  FormularioProteccionIndividual,
  documentosProteccionIndividualIniciales,
  formularioProteccionIndividualInicial,
} from "@/types/formularios/proteccion-individual.types";
import { enviarProteccionIndividual } from "@/services/formularios/proteccion-individual.service";
import Stepper from "@/app/components/formularios/shared/stepper";
import PasoEntrevistaInicial from "./paso1";
import PasoRemisionSolicitud from "./paso2";
import PasoInformacionCaso from "./paso3";
import PasoDocumentos from "./paso4";

interface FormularioProteccionIndividualPageProps {
  tipoFormulario?: "ayuda_humanitaria" | "pasantia";
}

export default function FormularioProteccionIndividualPage({
  tipoFormulario = "ayuda_humanitaria",
}: FormularioProteccionIndividualPageProps) {
  const esPasantia = tipoFormulario === "pasantia";
  const [formulario, setFormulario] = useState<FormularioProteccionIndividual>(
    formularioProteccionIndividualInicial
  );

  const [documentos, setDocumentos] = useState<DocumentosAdjuntos>(
    documentosProteccionIndividualIniciales
  );

  const [edadesHijos, setEdadesHijos] = useState<string[]>([]);
  const [personasConviven, setPersonasConviven] = useState<
    { parentesco: string }[]
  >([]);
  const [agresiones, setAgresiones] = useState<Agresion[]>([]);

  const [paso, setPaso] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});

  const actualizarCampo = (
    campo: keyof FormularioProteccionIndividual,
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

  const actualizarArchivo = (
    campo:
      | "certificacion_cuenta_bancaria"
      | "documento_identidad"
      | "carta_organizacion"
      | "carta_aceptacion_pasantia",
    archivos: FileList | null
  ) => {
    setDocumentos((prev) => ({
      ...prev,
      [campo]: archivos?.[0] ?? null,
    }));
    setErrores((prev) => {
      const nuevosErrores = { ...prev };
      delete nuevosErrores[campo];
      return nuevosErrores;
    });
  };

  const actualizarArchivosMultiples = (
    campo:
      | "evidencias_soportes"
      | "denuncias_organismos_estado"
      | "otros_documentos",
    archivos: FileList | null
  ) => {
    if (!archivos) return;

    setDocumentos((prev) => ({
      ...prev,
      [campo]: Array.from(archivos),
    }));
  };

  const validarPaso = () => {
    const nuevosErrores: Record<string, string> = {};

    if (paso === 1) {
      if (!formulario.fecha_remision)
        nuevosErrores.fecha_remision = "La fecha de remisión es obligatoria.";
      if (esPasantia && !formulario.tipo_pasantia)
        nuevosErrores.tipo_pasantia = "Seleccione el tipo de pasantía.";
      if (!formulario.nombre_apellidos.trim())
        nuevosErrores.nombre_apellidos = "El nombre es obligatorio.";
      if (!formulario.tipo_documento)
        nuevosErrores.tipo_documento =
          "Seleccione el tipo de documento de identidad.";
      if (!formulario.cedula.trim())
        nuevosErrores.cedula = "El número de identificación es obligatorio.";
      else if (!/^\d+$/.test(formulario.cedula.trim()))
        nuevosErrores.cedula =
          "El número de identificación solo debe contener números.";
      if (!formulario.edad.trim())
        nuevosErrores.edad = "La edad es obligatoria.";
      else if (!/^\d+$/.test(formulario.edad.trim()) || Number(formulario.edad) > 100)
        nuevosErrores.edad = "La edad debe ser un número entre 0 y 100.";
      if (!formulario.genero)
        nuevosErrores.genero = "Seleccione el género.";
      if (!formulario.telefono.trim())
        nuevosErrores.telefono = "El teléfono es obligatorio.";
      else if (!/^\d+$/.test(formulario.telefono.trim()))
        nuevosErrores.telefono = "El teléfono solo debe contener números.";
      if (!formulario.correo.trim())
        nuevosErrores.correo = "El correo electrónico es obligatorio.";
      if (!formulario.nombre_organizacion.trim())
        nuevosErrores.nombre_organizacion =
          "El nombre de la organización es obligatorio.";
      if (!formulario.tipo_liderazgo.trim())
        nuevosErrores.tipo_liderazgo =
          "Seleccione el tipo de liderazgo o derechos que defiende.";
      else if (
        formulario.tipo_liderazgo === "otro" &&
        !formulario.tipo_liderazgo_otro.trim()
      )
        nuevosErrores.tipo_liderazgo_otro =
          "Describa el tipo de liderazgo o derechos que defiende.";
      if (!formulario.procedencia_departamento)
        nuevosErrores.procedencia_departamento =
          "Seleccione el departamento de procedencia.";
      if (!formulario.procedencia_municipio)
        nuevosErrores.procedencia_municipio =
          "Seleccione el municipio de procedencia.";
      if (!formulario.residencia_departamento)
        nuevosErrores.residencia_departamento =
          "Seleccione el departamento de residencia.";
      if (!formulario.residencia_municipio)
        nuevosErrores.residencia_municipio =
          "Seleccione el municipio de residencia.";
      if (formulario.tiene_hijos === "si") {
        if (edadesHijos.length === 0)
          nuevosErrores.edades_hijos =
            "Agregue la edad de al menos un hijo/a.";
        else if (edadesHijos.some((edad) => !/^\d+$/.test(edad.trim())))
          nuevosErrores.edades_hijos =
            "Todas las edades de los hijos deben ser números válidos.";
      }

      if (personasConviven.some((persona) => persona.parentesco === ""))
        nuevosErrores.personas_conviven =
          "Seleccione el parentesco de todas las personas agregadas.";
    }

    if (paso === 2) {
      if (!formulario.organizacion_remite.trim())
        nuevosErrores.organizacion_remite =
          "La organización que remite el caso es obligatoria.";
      if (
        formulario.persona_organizacion_correo.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.persona_organizacion_correo.trim())
      )
        nuevosErrores.persona_organizacion_correo =
          "Ingrese un correo electrónico válido.";
    }

    if (paso === 3) {
      if (agresiones.length === 0)
        nuevosErrores.agresiones = "Agregue al menos una agresión.";
      agresiones.forEach((agresion, indice) => {
        const prefijo = `agresiones.${indice}`;
        if (!agresion.fecha_ocurrencia) nuevosErrores[`${prefijo}.fecha_ocurrencia`] = "Seleccione la fecha de ocurrencia.";
        if (!agresion.departamento) nuevosErrores[`${prefijo}.departamento`] = "Seleccione el departamento.";
        if (!agresion.municipio) nuevosErrores[`${prefijo}.municipio`] = "Seleccione el municipio.";
        if (!agresion.modalidad.trim()) nuevosErrores[`${prefijo}.modalidad`] = "Indique la modalidad de agresión.";
        if (!agresion.descripcion.trim()) nuevosErrores[`${prefijo}.descripcion`] = "Describa la agresión.";
        if (!agresion.motivos.trim()) nuevosErrores[`${prefijo}.motivos`] = "Indique los motivos de la agresión.";
        if (!agresion.presunto_responsable.trim()) nuevosErrores[`${prefijo}.presunto_responsable`] = "Indique el presunto responsable.";
      });
    }

    if (paso === 4) {
      if (!documentos.carta_organizacion)
        nuevosErrores.carta_organizacion =
          "La carta de la organización que presenta el caso es obligatoria.";
      if (!documentos.documento_identidad)
        nuevosErrores.documento_identidad =
          "El documento de identidad es obligatorio.";
      if (!documentos.certificacion_cuenta_bancaria)
        nuevosErrores.certificacion_cuenta_bancaria =
          "La certificación de cuenta bancaria es obligatoria.";
      if (
        esPasantia &&
        formulario.tipo_pasantia !== "internacional" &&
        !documentos.carta_aceptacion_pasantia
      )
        nuevosErrores.carta_aceptacion_pasantia =
          "La carta de aceptación de la pasantía es obligatoria para pasantías no internacionales.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const siguientePaso = () => {
    if (!validarPaso()) return;
    setPaso((prev) => Math.min(prev + 1, 4));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pasoAnterior = () => {
    setPaso((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const enviarFormulario = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validarPaso()) return;

    const formularioEnvio: FormularioProteccionIndividual = {
      ...formulario,
      numero_hijos:
        formulario.tiene_hijos === "si" ? String(edadesHijos.length) : "0",
      edades_hijos: JSON.stringify(
        edadesHijos
          .map((edad) => edad.trim())
          .filter((edad) => edad !== "")
          .map(Number)
      ),
      personas_conviven: JSON.stringify(
        personasConviven.filter((persona) => persona.parentesco !== "")
      ),
      agresiones: JSON.stringify(agresiones),
    };

    try {
      setEnviando(true);
      setMensaje("");
      await enviarProteccionIndividual(formularioEnvio, documentos, tipoFormulario);
      setMensaje(
        "La solicitud de protección individual fue enviada correctamente."
      );
      setFormulario(formularioProteccionIndividualInicial);
      setDocumentos(documentosProteccionIndividualIniciales);
      setEdadesHijos([]);
      setPersonasConviven([]);
      setAgresiones([]);
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
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#8e2329] text-2xl text-white shadow-lg shadow-[#8e2329]/30"
          >
            🛡️
          </motion.div>

          <h1 className="text-2xl font-bold text-[#8e2329] md:text-3xl">
            {esPasantia ? "Solicitud de pasantía" : "Solicitud de Apoyo de Protección Individual"}
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            {esPasantia
              ? "Complete la información requerida para realizar la solicitud de pasantía."
              : "Complete la información requerida para realizar la solicitud de apoyo de protección individual."}
          </p>
        </div>

        <Stepper
          pasoActual={paso}
          pasos={[
            { numero: 1, etiqueta: "Información personal" },
            { numero: 2, etiqueta: "Remisión de la solicitud" },
            { numero: 3, etiqueta: "Información de las agresiones" },
            { numero: 4, etiqueta: "Documentos" },
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

        <AnimatePresence>
          {enviando && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.96, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, y: 10 }}
                className="w-full max-w-md rounded-2xl border border-[#8e2329]/20 bg-white p-8 text-center shadow-2xl"
              >
                <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-[#8e2329]/15 border-t-[#8e2329]" />
                <h3 className="text-xl font-bold text-[#8e2329]">Subiendo archivos</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Estamos cargando los documentos adjuntos. Este proceso puede tardar unos segundos.
                </p>
              </motion.div>
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
                <PasoEntrevistaInicial
                  formulario={formulario}
                  errores={errores}
                  edadesHijos={edadesHijos}
                  personasConviven={personasConviven}
                  onCampoChange={actualizarCampo}
                  onEdadesHijosChange={setEdadesHijos}
                  onPersonasConvivenChange={setPersonasConviven}
                  onSiguiente={siguientePaso}
                  esPasantia={esPasantia}
                />
              )}

              {paso === 2 && (
                <PasoRemisionSolicitud
                  formulario={formulario}
                  errores={errores}
                  onCampoChange={actualizarCampo}
                  onVolver={pasoAnterior}
                  onSiguiente={siguientePaso}
                />
              )}

              {paso === 3 && (
                <PasoInformacionCaso
                  errores={errores}
                  agresiones={agresiones}
                  onAgresionesChange={setAgresiones}
                  onVolver={pasoAnterior}
                  onSiguiente={siguientePaso}
                />
              )}

              {paso === 4 && (
                <PasoDocumentos
                  formulario={formulario}
                  errores={errores}
                  documentos={documentos}
                  onArchivoChange={actualizarArchivo}
                  onArchivosMultiplesChange={actualizarArchivosMultiples}
                  onVolver={pasoAnterior}
                  enviando={enviando}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </form>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm font-semibold text-gray-800">
            Protección de la información
          </p>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            La información suministrada en este formulario será utilizada
            para la gestión de la solicitud de protección individual.
            Procure proporcionar información clara y veraz y adjuntar
            únicamente los documentos pertinentes.
          </p>
        </div>
      </div>
    </div>
  );
}

function validarCampo(campo: keyof FormularioProteccionIndividual, valor: string): string | undefined {
  const obligatorios: Partial<Record<keyof FormularioProteccionIndividual, string>> = {
    fecha_remision: "La fecha de remisión es obligatoria.", nombre_apellidos: "El nombre es obligatorio.",
    tipo_documento: "Seleccione el tipo de documento de identidad.", cedula: "El número de identificación es obligatorio.",
    edad: "La edad es obligatoria.", genero: "Seleccione el género.",
    telefono: "El teléfono es obligatorio.", correo: "El correo electrónico es obligatorio.",
    procedencia_departamento: "Seleccione el departamento de procedencia.",
    procedencia_municipio: "Seleccione el municipio de procedencia.",
    residencia_departamento: "Seleccione el departamento de residencia.",
    residencia_municipio: "Seleccione el municipio de residencia.",
    motivo_solicitud: "El motivo de solicitud es obligatorio.", fecha_lugar_descripcion_caso: "Este campo es obligatorio.",
    riesgo_motivos_amenaza: "Este campo es obligatorio.", tipo_pasantia: "Seleccione el tipo de pasantía.",
  };
  if (obligatorios[campo] && !valor.trim()) return obligatorios[campo];
  if (campo === "correo" && valor && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return "Ingrese un correo electrónico válido.";
  if (campo === "cedula" && valor && !/^\d+$/.test(valor)) return "El número de identificación solo debe contener números.";
  if (campo === "telefono" && valor && !/^\d+$/.test(valor)) return "El teléfono solo debe contener números.";
  if (campo === "edad" && valor && (!/^\d+$/.test(valor) || Number(valor) > 100)) return "La edad debe ser un número entre 0 y 100.";
  return undefined;
}
