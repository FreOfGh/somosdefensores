"use client";

import { ArrowLeft, Check, CheckCircle2, ClipboardCopy, Download, ExternalLink, FileArchive, FileText, RefreshCw, Save, Send, Upload, X } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { adminFetch } from "@/lib/api/admin-fetch";
import { PARENTESCOS } from "@/lib/data/colombia";

type TipoCaso = "humanitaria" | "pasantia" | "proteccion_colectiva";
type Documento = { id: string; nombre: string; url: string; url_descarga?: string };
type Respuesta = { id: number; decision: string | null; comentarios: string | null; respuesta_revisor: string | null; responded_at: string | null; validador: { name: string; email: string } };
type RespuestaSeguimiento = { id: number; correo_destinatario: string; used_at: string | null; respuesta: { situacion_actual?: string; apoyo_recibido?: string; descripcion_apoyo?: string; situacion_seguridad?: string; comentarios?: string } | null };
type RespuestaFinalizacion = { id: number; correo_destinatario: string; used_at: string | null; respuesta: string | null };
type Caso = Record<string, unknown> & { id: string; estado: string };

const noEditables = new Set(["id", "token", "documentos_adjuntos", "created_at", "updated_at", "deleted_at", "estado", "motivo_solicitud", "fecha_lugar_descripcion_caso", "riesgo_motivos_amenaza"]);
const textoLargo = new Set(["motivo_solicitud", "fecha_lugar_descripcion_caso", "riesgo_motivos_amenaza", "concepto_equipo_proteccion", "descripcion_organizacion", "riesgos_seguridad", "medidas_proteccion", "justificacion_medidas", "informacion_adicional", "representante_legal", "seguimiento"]);
const etiquetas: Record<string, string> = { nombre_victima: "Nombres", apellido_victima: "Apellidos", numero_identificacion: "Número de identificación", tipo_documento: "Tipo de documento", edad: "Edad", genero: "Género", correo_victima: "Correo electrónico", numero_whatsapp: "Teléfono / celular", grupo_etnico: "Grupo étnico y/o poblacional", tiene_discapacidad: "Condición de discapacidad", cual_discapacidad: "¿Cuál discapacidad?", tiene_condicion_salud: "Condición especial en salud", cual_condicion_salud: "¿Cuál condición de salud?", estado_civil: "Estado civil", otra_composicion_familiar: "Otro estado civil", tiene_hijos: "¿Tiene hijos/as?", numero_hijos: "Número de hijos/as", edades_hijos: "Edades de los hijos/as", personas_conviven: "Personas que viven con el solicitante", total_grupo_familiar: "Total de personas del grupo familiar", nombre_organizacion: "Organización a la cual pertenece", organizacion_remite: "Organización que remite el caso", persona_organizacion_nombre: "Nombre de la persona que remite", persona_organizacion_correo: "Correo de la persona que remite", persona_organizacion_celular: "Celular de la persona que remite", motivo_solicitud: "Motivo de solicitud", concepto_equipo_proteccion: "Concepto del equipo de protección", tipo_pasantia: "Tipo de pasantía", tipo_liderazgo: "Tipo de liderazgo o derechos que defiende", tipo_liderazgo_otro: "¿Cuál? (otro tipo de liderazgo)", agresiones: "Agresiones reportadas", pago_unico: "Pago único", primer_pago: "Primer pago", segundo_pago: "Segundo pago", tercer_pago: "Tercer pago", seguimiento: "Seguimiento", fecha_remision: "Fecha de remisión", fecha_remision_caso: "Fecha de remisión", cc_representante: "Cédula del representante", correo_electronico: "Correo", procedencia_departamento: "Departamento", procedencia_municipio: "Municipio", procedencia_vereda_comunidad: "Vereda y/o comunidad", procedencia_resguardo: "Consejo comunitario", residencia_departamento: "Departamento", residencia_municipio: "Municipio", residencia_vereda_comunidad: "Vereda y/o comunidad", residencia_resguardo: "Consejo comunitario", tiene_personeria_juridica: "¿Tiene personería jurídica?", rut: "RUT", representante_legal: "Representante legal", representante_nombre: "Nombre del representante", representante_apellido: "Apellido del representante", representante_tipo: "Tipo de representación", cedula: "Número de identificación", telefono: "Teléfono", correo: "Correo electrónico", departamento: "Departamento", municipio: "Municipio", vereda: "Vereda / barrio", departamento_municipio_vereda: "Ubicación (departamento/municipio/vereda)", descripcion_organizacion: "Descripción de la organización", estructura_organizacion: "Estructura de la organización", reivindicaciones: "Reivindicaciones", derechos_defiende: "Derechos que defiende", trabajos_realiza: "Trabajos que realiza", trabajos_realizados: "Trabajos realizados", riesgos_seguridad: "Riesgos de seguridad", riesgos_seguridad_agresiones: "Riesgos de seguridad y agresiones", incidentes: "Incidentes de seguridad", afectacion_trabajo: "Afectación al trabajo", actores_riesgo: "Actores de riesgo", medidas_proteccion: "Medidas de protección solicitadas", medidas_proteccion_colectiva: "Medidas de protección colectiva", justificacion_medidas: "Justificación de las medidas", informacion_adicional: "Información adicional" };

const seccionesFormulario: { titulo: string; campos: string[] }[] = [
  { titulo: "Información personal", campos: ["nombre_victima", "apellido_victima", "tipo_documento", "numero_identificacion", "edad", "genero", "numero_whatsapp", "correo_victima", "grupo_etnico"] },
  { titulo: "Salud", campos: ["tiene_discapacidad", "cual_discapacidad", "tiene_condicion_salud", "cual_condicion_salud"] },
  { titulo: "Composición del grupo familiar", campos: ["estado_civil", "otra_composicion_familiar", "tiene_hijos", "numero_hijos", "edades_hijos", "personas_conviven", "total_grupo_familiar"] },
  { titulo: "Lugar de procedencia", campos: ["procedencia_departamento", "procedencia_municipio", "procedencia_vereda_comunidad", "procedencia_resguardo"] },
  { titulo: "Lugar de residencia", campos: ["residencia_departamento", "residencia_municipio", "residencia_vereda_comunidad", "residencia_resguardo"] },
  { titulo: "Organización y remisión", campos: ["nombre_organizacion", "tipo_liderazgo", "tipo_liderazgo_otro", "organizacion_remite", "persona_organizacion_nombre", "persona_organizacion_correo", "persona_organizacion_celular", "tipo_pasantia"] },
  { titulo: "Agresiones reportadas", campos: ["agresiones"] },
  { titulo: "Seguimiento administrativo", campos: ["fecha_remision", "concepto_equipo_proteccion", "seguimiento", "pago_unico", "primer_pago", "segundo_pago", "tercer_pago"] },
  { titulo: "Datos de la organización", campos: ["tiene_personeria_juridica", "rut", "representante_legal", "representante_nombre", "representante_apellido", "representante_tipo", "cedula", "telefono", "correo", "correo_electronico"] },
  { titulo: "Ubicación de la organización", campos: ["departamento_municipio_vereda", "departamento", "municipio", "vereda"] },
  { titulo: "Descripción y riesgos de la organización", campos: ["descripcion_organizacion", "estructura_organizacion", "reivindicaciones", "derechos_defiende", "trabajos_realiza", "trabajos_realizados", "riesgos_seguridad", "riesgos_seguridad_agresiones", "incidentes", "afectacion_trabajo", "actores_riesgo"] },
  { titulo: "Medidas de protección colectiva", campos: ["medidas_proteccion", "medidas_proteccion_colectiva", "justificacion_medidas", "informacion_adicional"] },
];

const coloresEstado: Record<string, string> = {
  "pendiente de revisión": "border-amber-300 bg-amber-100 text-amber-800",
  "en proceso de validación": "border-blue-300 bg-blue-100 text-blue-800",
  aprobado: "border-green-300 bg-green-100 text-green-800",
  rechazado: "border-red-300 bg-red-100 text-red-800",
  "esperando desembolso": "border-purple-300 bg-purple-100 text-purple-800",
  desembolsado: "border-emerald-300 bg-emerald-100 text-emerald-800",
  "en proceso de cierre": "border-gray-300 bg-gray-200 text-gray-700",
  finalizado: "border-emerald-300 bg-emerald-100 text-emerald-800",
};

const parentescoEtiquetas: Record<string, string> = Object.fromEntries(PARENTESCOS.map((parentesco) => [parentesco.value, parentesco.label]));

function tipoApi(tipo: TipoCaso) { return tipo === "humanitaria" ? "ayuda_humanitaria" : tipo; }
function mostrarNombre(campo: string) { return etiquetas[campo] || campo.replaceAll("_", " "); }
function valorCampo(campo: string, valor: unknown): string {
  if (valor === null || valor === undefined) return "";
  if (typeof valor === "boolean") return valor ? "Sí" : "No";
  if (Array.isArray(valor)) return valor.join(", ");
  if (typeof valor === "object") return JSON.stringify(valor);
  return String(valor);
}

export default function GestionarCasoIndividual({ tipo }: { tipo: TipoCaso }) {
  const { id } = useParams<{ id: string }>();
  const [caso, setCaso] = useState<Caso | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [zipUrl, setZipUrl] = useState("");
  const [categoriasDocumentos, setCategoriasDocumentos] = useState<Record<string, "individual" | "multiple">>({});
  const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
  const [respuestasSeguimiento, setRespuestasSeguimiento] = useState<RespuestaSeguimiento[]>([]);
  const [respuestasFinalizacion, setRespuestasFinalizacion] = useState<RespuestaFinalizacion[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [comentario, setComentario] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [descargandoZip, setDescargandoZip] = useState(false);
  const [subiendoDocumento, setSubiendoDocumento] = useState<string | null>(null);
  const [subiendoCategoria, setSubiendoCategoria] = useState<string | null>(null);
  const [finalizando, setFinalizando] = useState(false);
  const [enviandoSeguimiento, setEnviandoSeguimiento] = useState(false);
  const [enlaceFinalizacion, setEnlaceFinalizacion] = useState("");
  const [enlaceSeguimiento, setEnlaceSeguimiento] = useState("");
  const [enlaceCopiado, setEnlaceCopiado] = useState(false);
  const [enlaceSeguimientoCopiado, setEnlaceSeguimientoCopiado] = useState(false);
  const [exportandoPdf, setExportandoPdf] = useState(false);
  const tipoCaso = tipoApi(tipo);
  const listado = tipo === "humanitaria" ? "/admin/ayuda_humanitaria" : tipo === "pasantia" ? "/admin/pasantias" : "/admin/proteccion_colectiva";

  const cargar = async () => {
    try {
      const [casoRespuesta, documentosRespuesta, historialRespuesta, seguimientoRespuesta, finalizacionRespuesta] = await Promise.all([
        adminFetch(`/api/admin/${tipo}/${id}`),
        adminFetch(`/api/admin/casos/${tipoCaso}/${id}/documentos`),
        adminFetch(`/api/revision/casos/${tipoCaso}/${id}/validaciones`),
        adminFetch(`/api/revision/casos/${tipoCaso}/${id}/seguimiento`),
        adminFetch(`/api/revision/casos/${tipoCaso}/${id}/finalizacion`),
      ]);
      const datosCaso = await casoRespuesta.json();
      if (!casoRespuesta.ok) throw new Error(datosCaso.message || "No fue posible cargar el caso.");
      setCaso(datosCaso.data ?? datosCaso);
      if (documentosRespuesta.ok) {
        const datosDocumentos = await documentosRespuesta.json();
        setDocumentos(Array.isArray(datosDocumentos) ? datosDocumentos : datosDocumentos.documentos ?? []);
        setZipUrl(Array.isArray(datosDocumentos) ? "" : datosDocumentos.zip_url ?? "");
        setCategoriasDocumentos(Array.isArray(datosDocumentos) ? {} : datosDocumentos.categorias ?? {});
      }
      if (historialRespuesta.ok) setRespuestas(await historialRespuesta.json());
      if (seguimientoRespuesta.ok) setRespuestasSeguimiento(await seguimientoRespuesta.json());
      if (finalizacionRespuesta.ok) setRespuestasFinalizacion(await finalizacionRespuesta.json());
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : "No fue posible cargar el caso.");
    }
  };

  useEffect(() => { void cargar(); }, [id, tipo]);

  const post = async (ruta: string, cuerpo?: object) => {
    const respuesta = await adminFetch(ruta, { method: "POST", headers: { "Content-Type": "application/json" }, body: cuerpo ? JSON.stringify(cuerpo) : undefined });
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.message || "No fue posible completar la acción.");
    return datos;
  };

  const guardar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!caso || caso.estado === "finalizado") return;
    try {
      setGuardando(true);
      const datos = Object.fromEntries(Object.entries(caso).filter(([campo]) => !noEditables.has(campo)));
      if (typeof datos.edades_hijos === "string") {
        datos.edades_hijos = datos.edades_hijos.split(",").map((edad) => Number(edad.trim())).filter((edad) => !Number.isNaN(edad) && edad >= 0);
      }
      const respuesta = await adminFetch(`/api/admin/${tipo}/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) });
      const resultado = await respuesta.json();
      if (!respuesta.ok) throw new Error(resultado.message || "No fue posible guardar los cambios.");
      setCaso(resultado.data ?? resultado);
      setMensaje("Información del caso actualizada correctamente.");
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : "No fue posible guardar los cambios.");
    } finally { setGuardando(false); }
  };

  const iniciar = async () => { try { await post(`/api/revision/casos/${tipoCaso}/${id}/iniciar-validacion`); setMensaje("Validación iniciada y enlaces enviados."); await cargar(); } catch (error) { setMensaje(error instanceof Error ? error.message : "No fue posible iniciar la validación."); } };
  const decidir = async (estado: "aprobado" | "rechazado") => { try { await post(`/api/revision/casos/${tipoCaso}/${id}/decision-final`, { estado }); setMensaje(`Caso ${estado} definitivamente.`); await cargar(); } catch (error) { setMensaje(error instanceof Error ? error.message : "No fue posible registrar la decisión."); } };
  const finalizar = async () => {
    try {
      setFinalizando(true);
      setMensaje("");
      const respuesta = await post(`/api/revision/casos/${tipoCaso}/${id}/finalizacion`) as { url?: string };
      setMensaje("Las invitaciones de finalización fueron enviadas a los destinatarios.");
      if (respuesta?.url) setEnlaceFinalizacion(respuesta.url);
    } catch (error) { setMensaje(error instanceof Error ? error.message : "No fue posible iniciar la finalización."); }
    finally { setFinalizando(false); }
  };
  const obtenerEnlace = async () => {
    try {
      setFinalizando(true);
      setMensaje("");
      const respuesta = await post(`/api/revision/casos/${tipoCaso}/${id}/finalizacion/enlace`) as { url?: string };
      if (respuesta?.url) {
        setEnlaceFinalizacion(respuesta.url);
        try { await navigator.clipboard.writeText(respuesta.url); setEnlaceCopiado(true); setTimeout(() => setEnlaceCopiado(false), 2000); } catch { /* el usuario puede copiarlo manualmente */ }
      }
    } catch (error) { setMensaje(error instanceof Error ? error.message : "No fue posible generar el enlace."); }
    finally { setFinalizando(false); }
  };

  const enviarSeguimiento = async () => {
    try {
      setEnviandoSeguimiento(true);
      setMensaje("");
      const respuesta = await post(`/api/revision/casos/${tipoCaso}/${id}/seguimiento`) as { url?: string };
      setMensaje("Las invitaciones del formulario de seguimiento fueron enviadas.");
      if (respuesta?.url) setEnlaceSeguimiento(respuesta.url);
      await cargar();
    } catch (error) { setMensaje(error instanceof Error ? error.message : "No fue posible enviar el formulario de seguimiento."); }
    finally { setEnviandoSeguimiento(false); }
  };

  const obtenerEnlaceSeguimiento = async () => {
    try {
      setEnviandoSeguimiento(true);
      setMensaje("");
      const respuesta = await post(`/api/revision/casos/${tipoCaso}/${id}/seguimiento/enlace`) as { url?: string };
      if (respuesta?.url) {
        setEnlaceSeguimiento(respuesta.url);
        try { await navigator.clipboard.writeText(respuesta.url); setEnlaceSeguimientoCopiado(true); setTimeout(() => setEnlaceSeguimientoCopiado(false), 2000); } catch { /* copia manual */ }
      }
    } catch (error) { setMensaje(error instanceof Error ? error.message : "No fue posible generar el enlace de seguimiento."); }
    finally { setEnviandoSeguimiento(false); }
  };
  const copiarEnlace = async () => {
    if (!enlaceFinalizacion) return;
    try { await navigator.clipboard.writeText(enlaceFinalizacion); setEnlaceCopiado(true); setTimeout(() => setEnlaceCopiado(false), 2000); } catch { setMensaje("No fue posible copiar el enlace. Cópielo manualmente."); }
  };

  const exportarPdf = async (conConversaciones: boolean) => {
    try {
      setExportandoPdf(true);
      setMensaje("");
      const respuesta = await adminFetch(`/api/revision/casos/${tipoCaso}/${id}/pdf${conConversaciones ? "?conversaciones=1" : ""}`);
      if (!respuesta.ok) {
        const datos = await respuesta.json().catch(() => null);
        throw new Error(datos?.message || "No fue posible generar el PDF.");
      }
      const blob = await respuesta.blob();
      const url = window.URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `caso_${id}${conConversaciones ? "_con_conversaciones" : ""}.pdf`;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) { setMensaje(error instanceof Error ? error.message : "No fue posible generar el PDF."); }
    finally { setExportandoPdf(false); }
  };

  const cambiarPago = async (valor: string) => {
    if (!caso) return;
    try {
      setMensaje("");
      const respuesta = await adminFetch(`/api/admin/pagos/${tipo}/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ estado: valor }) });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.message || "No fue posible actualizar el estado del pago.");
      setCaso({ ...caso, pago_unico: valor });
      setMensaje("Estado del pago actualizado correctamente.");
    } catch (error) { setMensaje(error instanceof Error ? error.message : "No fue posible actualizar el estado del pago."); }
  };
  const responder = async (invitacionId: number) => { if (!comentario.trim()) return setMensaje("Escriba una respuesta para el validador."); try { await post(`/api/revision/casos/validaciones/${invitacionId}/responder`, { respuesta_revisor: comentario }); setComentario(""); setMensaje("Respuesta enviada al validador con un nuevo enlace."); await cargar(); } catch (error) { setMensaje(error instanceof Error ? error.message : "No fue posible responder."); } };

  const descargarZip = async () => {
    if (!zipUrl) return setMensaje("No fue posible generar el enlace de descarga del ZIP.");
    try {
      setDescargandoZip(true);
      const enlace = document.createElement("a");
      enlace.href = zipUrl;
      enlace.download = "documentos_caso.zip";
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
    } finally { setDescargandoZip(false); }
  };

  const resubirDocumento = async (documentoId: string, archivo: File | undefined) => {
    if (!archivo) return;
    try {
      setSubiendoDocumento(documentoId);
      setMensaje("");
      const datos = new FormData();
      datos.append("archivo", archivo);
      const respuesta = await adminFetch(`/api/admin/casos/${tipoCaso}/${id}/documentos/${documentoId}`, { method: "POST", body: datos });
      const resultado = await respuesta.json();
      if (!respuesta.ok) throw new Error(resultado.message || "No fue posible reemplazar el documento.");
      setMensaje("Documento reemplazado correctamente.");
      await cargar();
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : "No fue posible reemplazar el documento.");
    } finally { setSubiendoDocumento(null); }
  };

  const subirEnCategoria = async (categoria: string, archivo: File | undefined) => {
    if (!archivo) return;
    try {
      setSubiendoCategoria(categoria);
      setMensaje("");
      const datos = new FormData();
      datos.append("categoria", categoria);
      datos.append("archivo", archivo);
      const respuesta = await adminFetch(`/api/admin/casos/${tipoCaso}/${id}/documentos`, { method: "POST", body: datos });
      const resultado = await respuesta.json();
      if (!respuesta.ok) throw new Error(resultado.message || "No fue posible subir el documento.");
      setMensaje("Documento agregado correctamente.");
      await cargar();
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : "No fue posible subir el documento.");
    } finally { setSubiendoCategoria(null); }
  };

  if (!caso) return <main className="min-h-screen bg-[#f5f5f5] p-12 text-center text-black">{mensaje || "Cargando caso..."}</main>;

  const esFinal = ["aprobado", "rechazado"].includes(caso.estado);
  const campos = Object.entries(caso).filter(([campo]) => !noEditables.has(campo));
  const nombreCompleto = [caso.nombre_victima, caso.apellido_victima].filter(Boolean).map(String).join(" ").trim();

  const secciones = seccionesFormulario
    .map((seccion) => ({
      titulo: seccion.titulo,
      entradas: seccion.campos
        .filter((campo) => campo in caso && !noEditables.has(campo))
        .map((campo) => [campo, caso[campo]] as [string, unknown]),
    }))
    .filter((seccion) => seccion.entradas.length > 0);

  const asignados = new Set(seccionesFormulario.flatMap((seccion) => seccion.campos));
  const restantes = campos.filter(([campo]) => !asignados.has(campo));
  if (restantes.length) secciones.push({ titulo: "Otros datos", entradas: restantes });

  const claseInput = "mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-normal text-black outline-none transition focus:border-[#92212a] focus:ring-2 focus:ring-[#92212a]/20 disabled:bg-gray-100 disabled:text-gray-500";

  const renderCampo = (campo: string, dato: unknown) => {
    if (campo === "pago_unico") {
      return (
        <div key={campo} className="text-sm font-semibold text-black">
          {mostrarNombre(campo)}
          <select
            value={String(dato ?? "")}
            onChange={(event) => void cambiarPago(event.target.value)}
            disabled={caso.estado === "rechazado" || caso.estado === "finalizado"}
            className={claseInput}
          >
            <option value="">Sin registrar</option>
            <option value="pendiente de desembolso">Pendiente de desembolso</option>
            <option value="esperando desembolso">Esperando desembolso</option>
            <option value="desembolsado" disabled={caso.estado !== "aprobado"}>Desembolsado{caso.estado !== "aprobado" ? " (requiere caso aprobado)" : ""}</option>
          </select>
          {caso.estado !== "aprobado" && <span className="mt-1 block text-xs font-normal text-gray-500">La opción \"Desembolsado\" solo está disponible cuando el caso está aprobado.</span>}
        </div>
      );
    }

    if (campo === "personas_conviven") {
      const lista = Array.isArray(dato) ? (dato as { parentesco?: string }[]) : [];
      return (
        <div key={campo} className="text-sm font-semibold text-black md:col-span-2">
          {mostrarNombre(campo)}
          <div className="mt-2 flex flex-wrap gap-2">
            {lista.length === 0 && <span className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-normal text-gray-500">Sin registrar</span>}
            {lista.map((persona, indice) => (
              <span key={indice} className="rounded-full border border-[#92212a]/20 bg-[#92212a]/5 px-3 py-1.5 text-xs font-semibold text-[#92212a]">
                {parentescoEtiquetas[persona.parentesco ?? ""] ?? persona.parentesco ?? "Sin parentesco"}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (campo === "agresiones") {
      const lista = Array.isArray(dato) ? (dato as Record<string, string>[]) : [];
      const bloqueado = esFinal;
      const actualizarAgresion = (indice: number, campoAgresion: string, valor: string) => {
        setCaso({ ...caso, agresiones: lista.map((agresion, posicion) => (posicion === indice ? { ...agresion, [campoAgresion]: valor } : agresion)) });
      };
      const eliminarAgresion = (indice: number) => setCaso({ ...caso, agresiones: lista.filter((_, posicion) => posicion !== indice) });
      const agregarAgresion = () => setCaso({ ...caso, agresiones: [...lista, { fecha_ocurrencia: "", departamento: "", municipio: "", vereda_comunidad: "", resguardo: "", modalidad: "", descripcion: "", motivos: "", presunto_responsable: "" }] });
      const camposAgresion: { campo: string; etiqueta: string; largo?: boolean; tipo?: string }[] = [
        { campo: "fecha_ocurrencia", etiqueta: "Fecha de ocurrencia", tipo: "date" },
        { campo: "departamento", etiqueta: "Departamento" },
        { campo: "municipio", etiqueta: "Municipio" },
        { campo: "vereda_comunidad", etiqueta: "Vereda y/o comunidad" },
        { campo: "resguardo", etiqueta: "Consejo comunitario / resguardo" },
        { campo: "modalidad", etiqueta: "Modalidad de agresión" },
        { campo: "descripcion", etiqueta: "Descripción", largo: true },
        { campo: "motivos", etiqueta: "Motivos", largo: true },
        { campo: "presunto_responsable", etiqueta: "Presunto responsable", largo: true },
      ];
      return (
        <div key={campo} className="text-sm font-semibold text-black md:col-span-2">
          {mostrarNombre(campo)}
          <div className="mt-2 space-y-3">
            {lista.length === 0 && <span className="block rounded-lg bg-gray-100 px-3 py-2 text-xs font-normal text-gray-500">Sin registrar</span>}
            {lista.map((agresion, indice) => (
              <div key={indice} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold text-[#92212a]">Agresión {indice + 1}</p>
                  {!bloqueado && (
                    <button type="button" onClick={() => eliminarAgresion(indice)} className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50">
                      Quitar
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {camposAgresion.map(({ campo: campoAgresion, etiqueta, largo, tipo }) => (
                    <label key={campoAgresion} className={`block text-xs font-semibold text-black ${largo ? "md:col-span-2" : ""}`}>
                      {etiqueta}
                      {largo ? (
                        <textarea value={agresion[campoAgresion] ?? ""} onChange={(event) => actualizarAgresion(indice, campoAgresion, event.target.value)} rows={3} disabled={bloqueado} className={claseInput} />
                      ) : (
                        <input type={tipo ?? "text"} value={agresion[campoAgresion] ?? ""} onChange={(event) => actualizarAgresion(indice, campoAgresion, event.target.value)} disabled={bloqueado} className={claseInput} />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            {!bloqueado && (
              <button type="button" onClick={agregarAgresion} className="rounded-lg border border-[#92212a] px-3 py-2 text-xs font-semibold text-[#92212a] transition hover:bg-[#92212a]/5">
                + Agregar agresión
              </button>
            )}
          </div>
        </div>
      );
    }

    const largo = textoLargo.has(campo);
    const campoBloqueado = campo === "seguimiento" ? caso.estado === "finalizado" : esFinal;
    return (
      <label key={campo} className={`block text-sm font-semibold text-black ${largo ? "md:col-span-2" : ""}`}>
        {mostrarNombre(campo)}
        {largo ? (
          <textarea value={valorCampo(campo, dato)} onChange={(event) => setCaso({ ...caso, [campo]: event.target.value })} rows={5} disabled={campoBloqueado} className={claseInput} />
        ) : (
          <input value={valorCampo(campo, dato)} onChange={(event) => setCaso({ ...caso, [campo]: event.target.value })} disabled={campoBloqueado} className={claseInput} />
        )}
        {campo === "edades_hijos" && <span className="mt-1 block text-xs font-normal text-gray-500">Edades separadas por comas. Ej: 5, 8, 12</span>}
      </label>
    );
  };

  const hayAcciones = caso.estado === "pendiente de revisión" || caso.estado === "en proceso de validación" || caso.estado === "aprobado" || esFinal;
  const seguimientoRespondido = respuestasSeguimiento.some((respuesta) => respuesta.respuesta);
  const pagoCampo = caso.pago_unico ?? caso.primer_pago;
  const pagoDesembolsado = pagoCampo === "desembolsado";
  const puedeEnviarSeguimiento = caso.estado === "aprobado" && (tipo !== "humanitaria" || pagoDesembolsado);

  return <main className="min-h-screen bg-[#f5f5f5] px-4 py-8"><div className="mx-auto max-w-6xl">
    <Link href={listado} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"><ArrowLeft className="h-4 w-4" />Volver al listado</Link>

    <header className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
        <div>
          <h1 className="text-2xl font-bold text-black">Gestionar caso</h1>
          <p className="mt-1 text-sm text-gray-600">{nombreCompleto || "Revise y actualice la información del caso."}</p>
        </div>
        <span className={`rounded-full border px-4 py-1.5 text-sm font-semibold capitalize ${coloresEstado[caso.estado] ?? "border-gray-300 bg-gray-100 text-gray-700"}`}>{caso.estado}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 bg-gray-50 px-6 py-3">
        <button type="button" onClick={() => void exportarPdf(false)} disabled={exportandoPdf} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:opacity-60">
          <FileText className="h-4 w-4" />{exportandoPdf ? "Generando..." : "Exportar PDF"}
        </button>
        <button type="button" onClick={() => void exportarPdf(true)} disabled={exportandoPdf} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:opacity-60">
          <FileText className="h-4 w-4" />{exportandoPdf ? "Generando..." : "Exportar PDF con conversaciones"}
        </button>
      </div>
      {hayAcciones && <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4">
        {caso.estado === "pendiente de revisión" && <button type="button" onClick={() => void iniciar()} className="inline-flex items-center gap-2 rounded-lg bg-[#92212a] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#701b20]"><Send className="h-4 w-4" />Iniciar validación</button>}
        {caso.estado === "en proceso de validación" && (
          <div className="w-full">
            <BarraVotos respuestas={respuestas} />
            <p className="mt-2 text-xs text-gray-600">La decisión final se toma automáticamente por consenso: aprobado si todos los validadores votan aprobado, rechazado si todos votan rechazado. Si hay diferencias, el caso permanece en validación. Puede forzar una decisión manual:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={() => void decidir("aprobado")} className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800"><Check className="h-4 w-4" />Aprobar</button>
              <button type="button" onClick={() => void decidir("rechazado")} className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-800"><X className="h-4 w-4" />Rechazar</button>
            </div>
          </div>
        )}
        {caso.estado === "aprobado" && (
          <div className="flex w-full flex-col gap-3">
            {!seguimientoRespondido ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  {puedeEnviarSeguimiento ? (
                    <>
                      <button type="button" onClick={() => void enviarSeguimiento()} disabled={enviandoSeguimiento} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-60">
                        <Send className="h-4 w-4" />{enviandoSeguimiento && !enlaceSeguimiento ? "Enviando..." : "Formulario de seguimiento"}
                      </button>
                      <button type="button" onClick={() => void obtenerEnlaceSeguimiento()} disabled={enviandoSeguimiento} className="inline-flex items-center gap-2 rounded-lg border border-blue-700 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:opacity-60">
                        {enlaceSeguimientoCopiado ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                        {enlaceSeguimientoCopiado ? "Copiado" : "Copiar link del formulario de seguimiento"}
                      </button>
                    </>
                  ) : (
                    tipo === "humanitaria" && <p className="text-xs text-gray-600">Marque el pago como \"desembolsado\" para habilitar el formulario de seguimiento.</p>
                  )}
                </div>
                {enlaceSeguimiento && (
                  <div className="w-full rounded-lg border border-blue-300 bg-blue-50 p-4">
                    <p className="text-sm font-semibold text-blue-900">Enlace del formulario de seguimiento</p>
                    <p className="mt-1 text-xs text-blue-800">Comparta este enlace con la persona que debe diligenciar el seguimiento. Válido por 7 días.</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <input readOnly value={enlaceSeguimiento} onFocus={(event) => event.target.select()} className="min-w-0 flex-1 rounded-lg border border-blue-300 bg-white px-3 py-2.5 text-xs text-black outline-none" />
                      <button type="button" onClick={() => { void navigator.clipboard.writeText(enlaceSeguimiento).then(() => { setEnlaceSeguimientoCopiado(true); setTimeout(() => setEnlaceSeguimientoCopiado(false), 2000); }).catch(() => setMensaje("No fue posible copiar el enlace. Cópielo manualmente.")); }} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-800">
                        {enlaceSeguimientoCopiado ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                        {enlaceSeguimientoCopiado ? "Copiado" : "Copiar enlace"}
                      </button>
                    </div>
                  </div>
                )}
                {puedeEnviarSeguimiento && <p className="text-xs text-amber-700">Cuando el formulario de seguimiento sea respondido, aquí aparecerán las opciones para finalizar el caso.</p>}
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => void finalizar()} disabled={finalizando} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-60">
                    <CheckCircle2 className="h-4 w-4" />{finalizando && !enlaceFinalizacion ? "Generando..." : "Finalizar caso"}
                  </button>
                  <button type="button" onClick={() => void obtenerEnlace()} disabled={finalizando} className="inline-flex items-center gap-2 rounded-lg border border-emerald-700 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50 disabled:opacity-60">
                    {enlaceCopiado ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                    {enlaceCopiado ? "Copiado" : "Copiar link para finalizar caso"}
                  </button>
                </div>
                {enlaceFinalizacion && (
                  <div className="w-full rounded-lg border border-emerald-300 bg-emerald-50 p-4">
                    <p className="text-sm font-semibold text-emerald-900">Enlace del formulario de finalización</p>
                    <p className="mt-1 text-xs text-emerald-800">Comparta este enlace con la persona que debe diligenciar el formulario. Válido por 7 días.</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <input readOnly value={enlaceFinalizacion} onFocus={(event) => event.target.select()} className="min-w-0 flex-1 rounded-lg border border-emerald-300 bg-white px-3 py-2.5 text-xs text-black outline-none" />
                      <button type="button" onClick={() => void copiarEnlace()} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-800">
                        {enlaceCopiado ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                        {enlaceCopiado ? "Copiado" : "Copiar enlace"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        {esFinal && <p className="text-sm font-semibold text-gray-600">Este caso tiene una decisión definitiva y no se puede modificar.</p>}
      </div>}
    </header>

    {mensaje && <p className="mt-5 rounded-lg border-l-4 border-[#92212a] bg-white p-4 text-sm text-black shadow-sm">{mensaje}</p>}

    <form onSubmit={guardar} className="mt-6 space-y-6">
      {secciones.map((seccion) => (
        <section key={seccion.titulo} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-[#92212a] px-6 py-3"><h2 className="text-sm font-bold uppercase tracking-wide text-white">{seccion.titulo}</h2></div>
          <div className="grid gap-5 p-6 md:grid-cols-2">{seccion.entradas.map(([campo, dato]) => renderCampo(campo, dato))}</div>
        </section>
      ))}
      {caso.estado !== "finalizado" && (
        <div className="flex justify-end">
          <button type="submit" disabled={guardando} className="inline-flex items-center gap-2 rounded-lg bg-[#92212a] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#701b20] disabled:opacity-60"><Save className="h-4 w-4" />{guardando ? "Guardando..." : "Guardar cambios"}</button>
        </div>
      )}
    </form>

    <section className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#92212a] px-6 py-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-white">Documentos adjuntos</h2>
        {documentos.length > 0 && (
          <button type="button" onClick={() => void descargarZip()} disabled={descargandoZip} className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#92212a] shadow-sm transition hover:bg-gray-100 disabled:opacity-60">
            <FileArchive className="h-4 w-4" />{descargandoZip ? "Generando ZIP..." : "Descargar todo (.zip)"}
          </button>
        )}
      </div>
      <div className="space-y-5 p-6">
        {Object.entries(categoriasDocumentos).map(([categoria, tipoCategoria]) => {
          const archivosCategoria = documentos.filter((documento) => documento.nombre === categoria);
          return (
            <div key={categoria} className="rounded-lg border border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
                <p className="text-sm font-semibold capitalize text-black">{categoria.replaceAll("_", " ")}</p>
                {!esFinal && (tipoCategoria === "multiple" || archivosCategoria.length === 0) && (
                  <label className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#92212a] bg-white px-3 py-1.5 text-xs font-semibold text-[#92212a] transition hover:bg-[#92212a]/5 ${subiendoCategoria === categoria ? "pointer-events-none opacity-60" : ""}`}>
                    <Upload className="h-3.5 w-3.5" />
                    {subiendoCategoria === categoria ? "Subiendo..." : archivosCategoria.length ? "Agregar archivo" : "Subir archivo"}
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      disabled={subiendoCategoria === categoria}
                      onChange={(event) => {
                        void subirEnCategoria(categoria, event.target.files?.[0]);
                        event.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
              {archivosCategoria.length ? (
                <ul className="divide-y divide-gray-100">
                  {archivosCategoria.map((documento) => (
                    <li key={documento.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                      <span className="min-w-0 flex-1 text-sm capitalize text-black">Archivo adjunto</span>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <a href={documento.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50">
                          <ExternalLink className="h-3.5 w-3.5" />Abrir
                        </a>
                        <a href={documento.url_descarga ?? documento.url} className="inline-flex items-center gap-1.5 rounded-lg bg-[#92212a] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#701b20]">
                          <Download className="h-3.5 w-3.5" />Descargar
                        </a>
                        {!esFinal && (
                          <label className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#92212a] bg-white px-3 py-1.5 text-xs font-semibold text-[#92212a] transition hover:bg-[#92212a]/5 ${subiendoDocumento === documento.id ? "pointer-events-none opacity-60" : ""}`}>
                            <RefreshCw className="h-3.5 w-3.5" />
                            {subiendoDocumento === documento.id ? "Subiendo..." : "Resubir"}
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                              disabled={subiendoDocumento === documento.id}
                              onChange={(event) => {
                                void resubirDocumento(documento.id, event.target.files?.[0]);
                                event.target.value = "";
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-4 py-3 text-xs text-gray-500">No se adjuntó ningún documento en esta categoría.</p>
              )}
            </div>
          );
        })}
        {!Object.keys(categoriasDocumentos).length && !documentos.length && <p className="text-sm text-gray-600">No hay documentos adjuntos.</p>}
      </div>
    </section>

    <section className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="bg-[#92212a] px-6 py-3"><h2 className="text-sm font-bold uppercase tracking-wide text-white">Respuestas de validadores</h2></div>
      <div className="space-y-4 p-6">
        {respuestas.map((respuesta) => <article key={respuesta.id} className="rounded-lg border-l-4 border-[#ed5a0b] bg-gray-50 p-4"><p className="font-semibold text-black">{respuesta.validador.name} ({respuesta.validador.email})</p><p className="mt-1 text-sm text-black">Respuesta: <strong className="capitalize">{respuesta.decision === "aclaracion" ? "Solicita aclaración" : respuesta.decision || "Pendiente"}</strong></p>{respuesta.comentarios && <p className="mt-2 whitespace-pre-wrap rounded-lg bg-white p-3 text-sm text-black">{respuesta.comentarios}</p>}{respuesta.responded_at && !respuesta.respuesta_revisor && !esFinal && <div className="mt-3"><textarea value={comentario} onChange={(event) => setComentario(event.target.value)} rows={3} placeholder="Responder al validador" className="w-full rounded-lg border border-gray-300 p-3 text-sm text-black outline-none transition focus:border-[#92212a] focus:ring-2 focus:ring-[#92212a]/20" /><button type="button" onClick={() => void responder(respuesta.id)} className="mt-2 rounded-lg bg-[#92212a] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#701b20]">Enviar respuesta al validador</button></div>}</article>)}
        {!respuestas.length && <p className="text-sm text-gray-600">Aún no hay respuestas.</p>}
      </div>
    </section>

    <section className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="bg-blue-800 px-6 py-3"><h2 className="text-sm font-bold uppercase tracking-wide text-white">Formulario de seguimiento</h2></div>
      <div className="space-y-4 p-6">
        {respuestasSeguimiento.map((respuesta) => {
          const datos = respuesta.respuesta ?? {};
          const etiquetasRespuesta: Record<string, string> = { si: "Sí", parcial: "Parcialmente", no: "No", mejoro: "Mejoró", igual: "Permanece igual", empeoro: "Empeoró" };
          return (
            <article key={respuesta.id} className="rounded-lg border-l-4 border-blue-600 bg-gray-50 p-4">
              <p className="font-semibold text-black">Respondido por {respuesta.correo_destinatario}</p>
              {respuesta.used_at && <p className="mt-1 text-xs text-gray-500">{new Date(respuesta.used_at).toLocaleString("es-CO")}</p>}
              <dl className="mt-3 space-y-3">
                <div><dt className="text-xs font-bold uppercase text-gray-500">Situación actual</dt><dd className="mt-1 whitespace-pre-wrap rounded-lg bg-white p-3 text-sm text-black">{datos.situacion_actual || "Sin registrar"}</dd></div>
                <div><dt className="text-xs font-bold uppercase text-gray-500">¿Recibió el apoyo o desembolso?</dt><dd className="mt-1 text-sm text-black">{etiquetasRespuesta[datos.apoyo_recibido ?? ""] ?? datos.apoyo_recibido ?? "Sin registrar"}</dd></div>
                {datos.descripcion_apoyo && <div><dt className="text-xs font-bold uppercase text-gray-500">Detalle del apoyo</dt><dd className="mt-1 whitespace-pre-wrap rounded-lg bg-white p-3 text-sm text-black">{datos.descripcion_apoyo}</dd></div>}
                <div><dt className="text-xs font-bold uppercase text-gray-500">Situación de seguridad</dt><dd className="mt-1 text-sm text-black">{etiquetasRespuesta[datos.situacion_seguridad ?? ""] ?? datos.situacion_seguridad ?? "Sin registrar"}</dd></div>
                {datos.comentarios && <div><dt className="text-xs font-bold uppercase text-gray-500">Comentarios adicionales</dt><dd className="mt-1 whitespace-pre-wrap rounded-lg bg-white p-3 text-sm text-black">{datos.comentarios}</dd></div>}
              </dl>
            </article>
          );
        })}
        {!respuestasSeguimiento.length && <p className="text-sm text-gray-600">El formulario de seguimiento aún no ha sido respondido.</p>}
      </div>
    </section>

    <section className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="bg-emerald-800 px-6 py-3"><h2 className="text-sm font-bold uppercase tracking-wide text-white">Formulario de finalización del caso</h2></div>
      <div className="space-y-4 p-6">
        {respuestasFinalizacion.map((respuesta) => (
          <article key={respuesta.id} className="rounded-lg border-l-4 border-emerald-600 bg-gray-50 p-4">
            <p className="font-semibold text-black">Respondido por {respuesta.correo_destinatario}</p>
            {respuesta.used_at && <p className="mt-1 text-xs text-gray-500">{new Date(respuesta.used_at).toLocaleString("es-CO")}</p>}
            <p className="mt-2 whitespace-pre-wrap rounded-lg bg-white p-3 text-sm text-black">{respuesta.respuesta}</p>
          </article>
        ))}
        {!respuestasFinalizacion.length && <p className="text-sm text-gray-600">El formulario de finalización aún no ha sido respondido.</p>}
      </div>
    </section>
  </div></main>;
}

function BarraVotos({ respuestas }: { respuestas: Respuesta[] }) {
  const votos = respuestas.filter((respuesta) => respuesta.decision);
  const aprobados = votos.filter((respuesta) => respuesta.decision === "aprobado").length;
  const rechazados = votos.filter((respuesta) => respuesta.decision === "rechazado").length;
  const aclaraciones = votos.filter((respuesta) => respuesta.decision === "aclaracion").length;
  const total = votos.length;

  if (!total) return <p className="text-xs text-gray-600">Aún no hay votos de validadores.</p>;

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex flex-wrap gap-4 text-xs font-semibold text-black">
        <span className="text-green-700">Aprobar: {aprobados}</span>
        <span className="text-red-700">Rechazar: {rechazados}</span>
        <span className="text-amber-700">Aclaración: {aclaraciones}</span>
        <span className="text-gray-500">Total votos: {total}</span>
      </div>
      <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div className="bg-green-600" style={{ width: `${(aprobados / total) * 100}%` }} />
        <div className="bg-red-600" style={{ width: `${(rechazados / total) * 100}%` }} />
        <div className="bg-amber-500" style={{ width: `${(aclaraciones / total) * 100}%` }} />
      </div>
    </div>
  );
}
