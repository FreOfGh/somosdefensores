"use client";

import { Check, Download, ExternalLink, HelpCircle, Send, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PARENTESCOS } from "@/lib/data/colombia";

type Documento = { id: string; nombre: string; url: string; url_descarga?: string };
type Caso = Record<string, unknown> & { estado: string };
type MensajeHilo = { id: number; decision: string | null; comentarios: string | null; respuesta_revisor: string | null; responded_at: string | null; validador?: { name: string; email: string } | null };

const ocultos = new Set(["id", "token", "documentos_adjuntos", "created_at", "updated_at", "deleted_at", "concepto_equipo_proteccion"]);
const etiquetas: Record<string, string> = { nombre_victima: "Nombres", apellido_victima: "Apellidos", numero_identificacion: "Número de identificación", tipo_documento: "Tipo de documento", edad: "Edad", genero: "Género", correo_victima: "Correo electrónico", numero_whatsapp: "Teléfono / celular", grupo_etnico: "Grupo étnico y/o poblacional", tiene_discapacidad: "Condición de discapacidad", cual_discapacidad: "¿Cuál discapacidad?", tiene_condicion_salud: "Condición especial en salud", cual_condicion_salud: "¿Cuál condición de salud?", estado_civil: "Estado civil", otra_composicion_familiar: "Otro estado civil", tiene_hijos: "¿Tiene hijos/as?", numero_hijos: "Número de hijos/as", edades_hijos: "Edades de los hijos/as", personas_conviven: "Personas que viven con el solicitante", total_grupo_familiar: "Total de personas del grupo familiar", nombre_organizacion: "Organización a la cual pertenece", organizacion_remite: "Organización que remite el caso", persona_organizacion_nombre: "Nombre de la persona que remite", persona_organizacion_correo: "Correo de la persona que remite", persona_organizacion_celular: "Celular de la persona que remite", motivo_solicitud: "Motivo de solicitud", tipo_pasantia: "Tipo de pasantía", tipo_liderazgo: "Tipo de liderazgo o derechos que defiende", tipo_liderazgo_otro: "¿Cuál? (otro tipo de liderazgo)", agresiones: "Agresiones reportadas", pago_unico: "Pago único", primer_pago: "Primer pago", segundo_pago: "Segundo pago", tercer_pago: "Tercer pago", fecha_remision: "Fecha de remisión", fecha_remision_caso: "Fecha de remisión", fecha_lugar_descripcion_caso: "Descripción del caso", riesgo_motivos_amenaza: "Riesgos y amenazas", cc_representante: "Cédula del representante", correo_electronico: "Correo", departamento_municipio_vereda: "Ubicación", procedencia_departamento: "Departamento", procedencia_municipio: "Municipio", procedencia_vereda_comunidad: "Vereda y/o comunidad", procedencia_resguardo: "Consejo comunitario", residencia_departamento: "Departamento", residencia_municipio: "Municipio", residencia_vereda_comunidad: "Vereda y/o comunidad", residencia_resguardo: "Consejo comunitario", tiene_personeria_juridica: "¿Tiene personería jurídica?", rut: "RUT", representante_legal: "Representante legal", representante_nombre: "Nombre del representante", representante_apellido: "Apellido del representante", representante_tipo: "Tipo de representación", cedula: "Número de identificación", telefono: "Teléfono", correo: "Correo electrónico", departamento: "Departamento", municipio: "Municipio", vereda: "Vereda / barrio", descripcion_organizacion: "Descripción de la organización", estructura_organizacion: "Estructura de la organización", reivindicaciones: "Reivindicaciones", derechos_defiende: "Derechos que defiende", trabajos_realiza: "Trabajos que realiza", trabajos_realizados: "Trabajos realizados", riesgos_seguridad: "Riesgos de seguridad", riesgos_seguridad_agresiones: "Riesgos de seguridad y agresiones", incidentes: "Incidentes de seguridad", afectacion_trabajo: "Afectación al trabajo", actores_riesgo: "Actores de riesgo", medidas_proteccion: "Medidas de protección solicitadas", medidas_proteccion_colectiva: "Medidas de protección colectiva", justificacion_medidas: "Justificación de las medidas", informacion_adicional: "Información adicional" };

const secciones: { titulo: string; campos: string[] }[] = [
  { titulo: "Información personal", campos: ["nombre_victima", "apellido_victima", "tipo_documento", "numero_identificacion", "edad", "genero", "numero_whatsapp", "correo_victima", "grupo_etnico"] },
  { titulo: "Salud", campos: ["tiene_discapacidad", "cual_discapacidad", "tiene_condicion_salud", "cual_condicion_salud"] },
  { titulo: "Composición del grupo familiar", campos: ["estado_civil", "otra_composicion_familiar", "tiene_hijos", "numero_hijos", "edades_hijos", "personas_conviven", "total_grupo_familiar"] },
  { titulo: "Lugar de procedencia", campos: ["procedencia_departamento", "procedencia_municipio", "procedencia_vereda_comunidad", "procedencia_resguardo"] },
  { titulo: "Lugar de residencia", campos: ["residencia_departamento", "residencia_municipio", "residencia_vereda_comunidad", "residencia_resguardo"] },
  { titulo: "Organización y remisión", campos: ["nombre_organizacion", "tipo_liderazgo", "tipo_liderazgo_otro", "organizacion_remite", "persona_organizacion_nombre", "persona_organizacion_correo", "persona_organizacion_celular", "tipo_pasantia"] },
  { titulo: "Información del caso", campos: ["motivo_solicitud", "fecha_lugar_descripcion_caso", "riesgo_motivos_amenaza"] },
  { titulo: "Agresiones reportadas", campos: ["agresiones"] },
  { titulo: "Datos administrativos", campos: ["fecha_remision", "pago_unico", "primer_pago", "segundo_pago", "tercer_pago", "estado"] },
  { titulo: "Datos de la organización", campos: ["tiene_personeria_juridica", "rut", "representante_legal", "representante_nombre", "representante_apellido", "representante_tipo", "cedula", "telefono", "correo", "correo_electronico"] },
  { titulo: "Ubicación de la organización", campos: ["departamento_municipio_vereda", "departamento", "municipio", "vereda"] },
  { titulo: "Descripción y riesgos de la organización", campos: ["descripcion_organizacion", "estructura_organizacion", "reivindicaciones", "derechos_defiende", "trabajos_realiza", "trabajos_realizados", "riesgos_seguridad", "riesgos_seguridad_agresiones", "incidentes", "afectacion_trabajo", "actores_riesgo"] },
  { titulo: "Medidas de protección colectiva", campos: ["medidas_proteccion", "medidas_proteccion_colectiva", "justificacion_medidas", "informacion_adicional"] },
];

const parentescoEtiquetas: Record<string, string> = Object.fromEntries(PARENTESCOS.map((parentesco) => [parentesco.value, parentesco.label]));

function visible(campo: string, valor: unknown): string {
  if (valor === null || valor === undefined || valor === "") return "Sin registrar";
  if (typeof valor === "boolean") return valor ? "Sí" : "No";
  if (campo === "edades_hijos" && Array.isArray(valor)) return (valor as unknown[]).map((edad) => `${edad} años`).join(", ");
  if (campo === "personas_conviven" && Array.isArray(valor)) {
    const lista = (valor as { parentesco?: string }[]).map((persona) => parentescoEtiquetas[persona.parentesco ?? ""] ?? persona.parentesco ?? "").filter(Boolean);
    return lista.length ? lista.join(", ") : "Sin registrar";
  }
  if (campo === "agresiones" && Array.isArray(valor)) {
    const lista = valor as Record<string, unknown>[];
    if (!lista.length) return "Sin registrar";
    return lista
      .map((agresion, indice) => {
        const lugar = [agresion.departamento, agresion.municipio, agresion.vereda_comunidad].filter(Boolean).join(", ");
        const descripcionResponsable = agresion.presunto_responsable_descripcion ? ` (${agresion.presunto_responsable_descripcion})` : "";
        return `Agresión ${indice + 1} - Fecha: ${agresion.fecha_ocurrencia ?? "Sin registrar"} | Lugar: ${lugar || "Sin registrar"} | Modalidad: ${agresion.modalidad ?? "Sin registrar"} | Descripción: ${agresion.descripcion ?? "Sin registrar"} | Motivos: ${agresion.motivos ?? "Sin registrar"} | Presunto responsable: ${agresion.presunto_responsable ?? "Sin registrar"}${descripcionResponsable}`;
      })
      .join("\n\n");
  }
  if (typeof valor === "object") return JSON.stringify(valor);
  return String(valor);
}

export default function ValidacionCasoPage() {
  const { token } = useParams<{ token: string }>();
  const [caso, setCaso] = useState<Caso | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [respuestaRevisor, setRespuestaRevisor] = useState<string | null>(null);
  const [hilo, setHilo] = useState<MensajeHilo[]>([]);
  const [respondido, setRespondido] = useState(false);
  const [decision, setDecision] = useState<"aprobado" | "rechazado" | "aclaracion">("aprobado");
  const [comentarios, setComentarios] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!token) return;
    void (async () => { try {
      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/publico/validacion/${encodeURIComponent(token)}`, { cache: "no-store" });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.message || "El enlace de validación no es válido.");
      setCaso(datos.caso); setDocumentos(datos.documentos || []); setRespondido(datos.respondido); setRespuestaRevisor(datos.respuesta_revisor || null); setHilo(datos.hilo || []);
    } catch (error) { setMensaje(error instanceof Error ? error.message : "No fue posible cargar el caso."); }
    finally { setCargando(false); } })();
  }, [token]);

  const enviar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (decision === "aclaracion" && !comentarios.trim()) { setMensaje("Para solicitar una aclaración debe indicar en los comentarios qué información debe aclararse."); return; }
    try {
      setEnviando(true); setMensaje("");
      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/publico/validacion/${encodeURIComponent(token)}/responder`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ decision, comentarios: comentarios.trim() || null }) });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.message || "No fue posible registrar la respuesta.");
      setRespondido(true); setMensaje("Respuesta registrada. El equipo revisor fue notificado.");
    } catch (error) { setMensaje(error instanceof Error ? error.message : "No fue posible registrar la respuesta."); }
    finally { setEnviando(false); }
  };

  if (cargando) return <main className="min-h-screen bg-[#f5f5f5] p-12 text-center text-black">Cargando caso...</main>;
  if (!caso) return <main className="min-h-screen bg-[#f5f5f5] p-12 text-center text-black">{mensaje || "Caso no disponible."}</main>;

  const nombreCompleto = [caso.nombre_victima, caso.apellido_victima].filter(Boolean).map(String).join(" ").trim();
  const asignados = new Set(secciones.flatMap((seccion) => seccion.campos));

  const seccionesConDatos = secciones
    .map((seccion) => ({
      titulo: seccion.titulo,
      entradas: seccion.campos
        .filter((campo) => campo in caso && !ocultos.has(campo))
        .map((campo) => [campo, caso[campo]] as [string, unknown]),
    }))
    .filter((seccion) => seccion.entradas.length > 0);

  const restantes = Object.entries(caso).filter(([campo]) => !ocultos.has(campo) && !asignados.has(campo));
  if (restantes.length) seccionesConDatos.push({ titulo: "Otros datos", entradas: restantes });

  const claseOpcion = (activa: boolean, color: string) => `inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${activa ? `${color} text-white` : "bg-white text-black hover:bg-gray-50"}`;

  return <main className="min-h-screen bg-[#f5f5f5] px-4 py-8"><div className="mx-auto max-w-6xl">
    <header className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b-4 border-[#ed5a0b] bg-[#92212a] px-6 py-7 text-white">
        <h1 className="text-2xl font-bold">Validación de caso</h1>
        <p className="mt-1 text-sm text-white/90">{nombreCompleto ? `Caso de ${nombreCompleto}.` : ""} Consulta la información y registra tu respuesta.</p>
      </div>
    </header>

    {mensaje && <p className="mt-5 rounded-lg border-l-4 border-[#92212a] bg-white p-4 text-sm text-black shadow-sm">{mensaje}</p>}

    {hilo.length > 0 && <section className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="bg-[#ed5a0b] px-6 py-3"><h2 className="text-sm font-bold uppercase tracking-wide text-white">Conversación de validación</h2></div>
      <div className="space-y-4 p-6">
        <p className="text-xs text-gray-500">Esta conversación es compartida: todos los validadores del caso pueden ver las respuestas.</p>
        {hilo.map((mensaje) => (
          <article key={mensaje.id} className="rounded-lg border-l-4 border-[#ed5a0b] bg-gray-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-black">{mensaje.validador?.name ?? "Validador"}</p>
              <div className="flex items-center gap-2 text-xs">
                {mensaje.decision && <span className="rounded-full border border-gray-300 bg-white px-2.5 py-0.5 font-semibold capitalize text-black">{mensaje.decision === "aclaracion" ? "Solicita aclaración" : mensaje.decision}</span>}
                {mensaje.responded_at && <span className="text-gray-500">{new Date(mensaje.responded_at).toLocaleString("es-CO")}</span>}
              </div>
            </div>
            {mensaje.comentarios && <p className="mt-2 whitespace-pre-wrap text-sm text-black">{mensaje.comentarios}</p>}
            {mensaje.respuesta_revisor && <p className="mt-3 whitespace-pre-wrap rounded-lg border-l-2 border-[#92212a] bg-white p-3 text-sm text-black"><span className="font-semibold text-[#92212a]">Equipo revisor:</span> {mensaje.respuesta_revisor}</p>}
          </article>
        ))}
      </div>
    </section>}

    {respuestaRevisor && !hilo.length && <section className="mt-6 overflow-hidden rounded-xl border border-[#ed5a0b]/30 bg-white shadow-sm">
      <div className="bg-[#ed5a0b] px-6 py-3"><h2 className="text-sm font-bold uppercase tracking-wide text-white">Mensaje del equipo revisor</h2></div>
      <p className="whitespace-pre-wrap px-6 py-5 text-sm text-black">{respuestaRevisor}</p>
    </section>}

    {seccionesConDatos.map((seccion) => (
      <section key={seccion.titulo} className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="bg-[#92212a] px-6 py-3"><h2 className="text-sm font-bold uppercase tracking-wide text-white">{seccion.titulo}</h2></div>
        <dl className="grid gap-x-8 gap-y-5 p-6 md:grid-cols-2">
          {seccion.entradas.map(([campo, valor]) => (
            <div key={campo}>
              <dt className="text-xs font-bold uppercase tracking-wide text-gray-500">{etiquetas[campo] || campo.replaceAll("_", " ")}</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-black">{visible(campo, valor)}</dd>
            </div>
          ))}
        </dl>
      </section>
    ))}

    <section className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="bg-[#92212a] px-6 py-3"><h2 className="text-sm font-bold uppercase tracking-wide text-white">Documentos adjuntos</h2></div>
      <div className="p-6">
        {documentos.length ? (
          <ul className="divide-y divide-gray-100">
            {documentos.map((documento) => (
              <li key={documento.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="min-w-0 flex-1 text-sm font-semibold capitalize text-black">{documento.nombre.replaceAll("_", " ")}</span>
                <div className="flex shrink-0 gap-2">
                  <a href={documento.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"><ExternalLink className="h-3.5 w-3.5" />Abrir</a>
                  <a href={documento.url_descarga ?? documento.url} className="inline-flex items-center gap-1.5 rounded-lg bg-[#92212a] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#701b20]"><Download className="h-3.5 w-3.5" />Descargar</a>
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-gray-600">No hay documentos adjuntos.</p>}
      </div>
    </section>

    {!respondido && <form onSubmit={enviar} className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="bg-[#92212a] px-6 py-3"><h2 className="text-sm font-bold uppercase tracking-wide text-white">Respuesta de validación</h2></div>
      <div className="p-6">
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => setDecision("aprobado")} className={claseOpcion(decision === "aprobado", "border-green-700 bg-green-700") + (decision !== "aprobado" ? " border-green-700" : "")}><Check className="h-4 w-4" />Aprobar caso</button>
          <button type="button" onClick={() => setDecision("rechazado")} className={claseOpcion(decision === "rechazado", "border-red-700 bg-red-700") + (decision !== "rechazado" ? " border-red-700" : "")}><X className="h-4 w-4" />Rechazar caso</button>
          <button type="button" onClick={() => setDecision("aclaracion")} className={claseOpcion(decision === "aclaracion", "border-amber-600 bg-amber-600") + (decision !== "aclaracion" ? " border-amber-600" : "")}><HelpCircle className="h-4 w-4" />Solicitar aclaración</button>
        </div>

        {decision === "aclaracion" && <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">El caso no quedará aprobado ni rechazado. Indique en los comentarios qué información o documentos debe aclarar el solicitante (obligatorio).</p>}

        <label className="mt-5 block text-sm font-semibold text-black">{decision === "aclaracion" ? "¿Qué información debe aclararse?" : "Comentarios opcionales"}
          <textarea value={comentarios} onChange={(event) => setComentarios(event.target.value)} rows={6} maxLength={5000} placeholder={decision === "aclaracion" ? "Describa la información, documentos o precisiones que debe aportar el solicitante." : "Agregue observaciones para el equipo revisor."} className="mt-2 w-full rounded-lg border border-gray-300 p-3 font-normal text-black outline-none transition focus:border-[#92212a] focus:ring-2 focus:ring-[#92212a]/20" />
        </label>

        <button type="submit" disabled={enviando} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#92212a] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#701b20] disabled:opacity-60"><Send className="h-4 w-4" />{enviando ? "Enviando..." : "Enviar respuesta"}</button>
      </div>
    </form>}
  </div></main>;
}
