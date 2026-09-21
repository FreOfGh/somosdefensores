import { useState } from "react";
import { Agresion } from "@/types/formularios/proteccion-individual.types";
import { useCatalogo, useMunicipiosCatalogo } from "@/hooks/use-catalogo";
import { modalidadesAgresion, presuntosResponsables } from "@/lib/data/agresiones";
import { HelpCircle, Plus, Trash2 } from "lucide-react";
import CampoSelect from "@/app/components/formularios/shared/campo-select";
import CampoTexto from "@/app/components/formularios/shared/campo-texto";
import CampoTextarea from "@/app/components/formularios/shared/campo-textarea";

interface PasoCasoProps {
  errores: Record<string, string>;
  agresiones: Agresion[];
  onAgresionesChange: (agresiones: Agresion[]) => void;
  onVolver: () => void;
  onSiguiente: () => void;
}

export default function PasoInformacionCaso({
  errores,
  agresiones,
  onAgresionesChange,
  onVolver,
  onSiguiente,
}: PasoCasoProps) {
  const [ayudaAbierta, setAyudaAbierta] = useState<number | null>(null);
  const [ayudaResponsableAbierta, setAyudaResponsableAbierta] = useState<number | null>(null);
  const departamentos = useCatalogo("departamentos");
  const municipios = useMunicipiosCatalogo();
  const modalidades = useCatalogo("modalidades-agresion");
  const agregarAgresion = () => {
    onAgresionesChange([
      ...agresiones,
      {
        fecha_ocurrencia: "",
        departamento: "",
        municipio: "",
        vereda_comunidad: "",
        resguardo: "",
        modalidad: "",
        descripcion: "",
        motivos: "",
        presunto_responsable: "",
        presunto_responsable_descripcion: "",
      },
    ]);
  };

  const actualizarAgresion = (
    indice: number,
    campo: keyof Agresion,
    valor: string
  ) => {
    onAgresionesChange(
      agresiones.map((agresion, posicion) =>
        posicion === indice
          ? {
              ...agresion,
              [campo]: valor,
              ...(campo === "departamento" ? { municipio: "" } : {}),
            }
          : agresion
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-[#fefbfb] shadow-sm">
        <div className="bg-[#8e2329] px-6 py-4 text-white">
          <h2 className="font-bold">Información de las agresiones</h2>
          <p className="mt-1 text-xs text-white/80">
            Registre cada agresión que motiva la solicitud.
          </p>
        </div>

        <div className="space-y-6 p-6">
          {errores.agresiones && (
            <p className="text-sm font-medium text-red-700">{errores.agresiones}</p>
          )}

          {agresiones.map((agresion, indice) => {
            const prefijo = `agresiones.${indice}`;
            const municipiosDisponibles = municipios.opciones.filter((municipio) => municipio.departamento_id === agresion.departamento).map((municipio) => ({ value: municipio.id, label: municipio.nombre }));

            return (
              <section key={indice} className="rounded-lg border border-gray-200 bg-white p-5">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h3 className="font-bold text-[#8e2329]">Agresión {indice + 1}</h3>
                  <button type="button" onClick={() => onAgresionesChange(agresiones.filter((_, posicion) => posicion !== indice))} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-700 transition hover:bg-red-50" aria-label={`Eliminar agresión ${indice + 1}`} title="Eliminar agresión">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="max-w-sm">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Fecha de ocurrencia de la agresión <span className="text-[#8e2329]">*</span></label>
                    <input type="date" value={agresion.fecha_ocurrencia} onChange={(event) => actualizarAgresion(indice, "fecha_ocurrencia", event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#8e2329] focus:ring-2 focus:ring-[#8e2329]/20" />
                    {errores[`${prefijo}.fecha_ocurrencia`] && <p className="mt-1 text-sm text-red-700">{errores[`${prefijo}.fecha_ocurrencia`]}</p>}
                  </div>

                  <fieldset className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <legend className="px-2 text-sm font-bold text-[#8e2329]">Lugar de la agresión *</legend>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <CampoSelect label="Departamento" value={agresion.departamento} onChange={(valor) => actualizarAgresion(indice, "departamento", valor)} opciones={departamentos.opciones.map((item) => ({ value: item.id, label: item.nombre }))} required error={errores[`${prefijo}.departamento`]} />
                      <CampoSelect label="Municipio" value={agresion.municipio} onChange={(valor) => actualizarAgresion(indice, "municipio", valor)} opciones={municipiosDisponibles} required error={errores[`${prefijo}.municipio`]} />
                      <CampoTexto label="Vereda y/o comunidad" value={agresion.vereda_comunidad} onChange={(valor) => actualizarAgresion(indice, "vereda_comunidad", valor)} placeholder="Nombre de la vereda o comunidad" />
                      <CampoTexto label="Consejo comunitario/ resguardo o comunidad indigena." value={agresion.resguardo} onChange={(valor) => actualizarAgresion(indice, "resguardo", valor)} placeholder="Si aplica" />
                    </div>
                  </fieldset>

                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <label htmlFor={`modalidad-${indice}`} className="text-sm font-semibold text-gray-700">
                        Modalidad de agresión que motiva la solicitud
                        <span className="ml-1 text-[#8e2329]">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setAyudaAbierta(ayudaAbierta === indice ? null : indice)}
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[#8e2329] transition hover:bg-[#8e2329]/10"
                        aria-label="Explicar las modalidades de agresión"
                        aria-expanded={ayudaAbierta === indice}
                        title="¿Qué significa cada modalidad?"
                      >
                        <HelpCircle size={17} aria-hidden="true" />
                      </button>
                    </div>
                    <select
                      id={`modalidad-${indice}`}
                      value={modalidades.opciones.some((opcion) => opcion.id === agresion.modalidad) ? agresion.modalidad : agresion.modalidad ? "OTRA" : ""}
                      onChange={(event) => actualizarAgresion(indice, "modalidad", event.target.value === "OTRA" ? "Otra" : event.target.value)}
                      className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#8e2329] focus:ring-2 focus:ring-[#8e2329]/20 ${errores[`${prefijo}.modalidad`] ? "border-red-500" : "border-gray-300"}`}
                    >
                      <option value="">Seleccione una modalidad</option>
                      {modalidades.opciones.map((opcion) => <option key={opcion.id} value={opcion.id}>{opcion.nombre}</option>)}
                      <option value="OTRA">Otra</option>
                    </select>
                    {agresion.modalidad === "Otra" || (agresion.modalidad !== "" && !modalidades.opciones.some((opcion) => opcion.id === agresion.modalidad)) ? (
                      <CampoTexto label="Describa otra modalidad" value={agresion.modalidad === "Otra" ? "" : agresion.modalidad} onChange={(valor) => actualizarAgresion(indice, "modalidad", valor)} placeholder="Escriba la modalidad" required error={errores[`${prefijo}.modalidad`]} />
                    ) : errores[`${prefijo}.modalidad`] ? <p className="mt-1 text-xs text-red-600">{errores[`${prefijo}.modalidad`]}</p> : null}
                    {ayudaAbierta === indice && <div className="mt-3 space-y-2 rounded-lg border border-[#8e2329]/20 bg-[#fff8f8] p-4 text-xs leading-5 text-gray-700"><p className="font-semibold text-[#8e2329]">Definiciones de modalidades</p>{modalidadesAgresion.map((opcion) => <p key={opcion.value}><strong>{opcion.label}:</strong> {opcion.descripcion}</p>)}</div>}
                  </div>
                  <CampoTextarea label="Descripción de la agresión" value={agresion.descripcion} onChange={(valor) => actualizarAgresion(indice, "descripcion", valor)} placeholder="Describa lo ocurrido." required filas={5} error={errores[`${prefijo}.descripcion`]} />
                  <CampoTextarea label="Motivos de la agresión" value={agresion.motivos} onChange={(valor) => actualizarAgresion(indice, "motivos", valor)} placeholder="Describa los motivos de la agresión." required filas={4} error={errores[`${prefijo}.motivos`]} />

                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <label htmlFor={`presunto-responsable-${indice}`} className="text-sm font-semibold text-gray-700">
                        Presunto responsable
                        <span className="ml-1 text-[#8e2329]">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setAyudaResponsableAbierta(ayudaResponsableAbierta === indice ? null : indice)}
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[#8e2329] transition hover:bg-[#8e2329]/10"
                        aria-label="Explicar los presuntos responsables"
                        aria-expanded={ayudaResponsableAbierta === indice}
                        title="¿Qué significa cada presunto responsable?"
                      >
                        <HelpCircle size={17} aria-hidden="true" />
                      </button>
                    </div>
                    <select
                      id={`presunto-responsable-${indice}`}
                      value={presuntosResponsables.some((opcion) => opcion.value === agresion.presunto_responsable) ? agresion.presunto_responsable : agresion.presunto_responsable ? "OTRO" : ""}
                      onChange={(event) => actualizarAgresion(indice, "presunto_responsable", event.target.value === "OTRO" ? "Otro" : event.target.value)}
                      className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#8e2329] focus:ring-2 focus:ring-[#8e2329]/20 ${errores[`${prefijo}.presunto_responsable`] ? "border-red-500" : "border-gray-300"}`}
                    >
                      <option value="">Seleccione un presunto responsable</option>
                      {presuntosResponsables.map((opcion) => <option key={opcion.value} value={opcion.value}>{opcion.label}</option>)}
                      <option value="OTRO">Otro</option>
                    </select>
                    {agresion.presunto_responsable === "Otro" || (agresion.presunto_responsable !== "" && !presuntosResponsables.some((opcion) => opcion.value === agresion.presunto_responsable)) ? (
                      <CampoTexto label="Especifique el presunto responsable" value={agresion.presunto_responsable === "Otro" ? "" : agresion.presunto_responsable} onChange={(valor) => actualizarAgresion(indice, "presunto_responsable", valor)} placeholder="Escriba el presunto responsable" required error={errores[`${prefijo}.presunto_responsable`]} />
                    ) : errores[`${prefijo}.presunto_responsable`] ? <p className="mt-1 text-xs text-red-600">{errores[`${prefijo}.presunto_responsable`]}</p> : null}
                    {ayudaResponsableAbierta === indice && <div className="mt-3 space-y-2 rounded-lg border border-[#8e2329]/20 bg-[#fff8f8] p-4 text-xs leading-5 text-gray-700"><p className="font-semibold text-[#8e2329]">Definiciones de presuntos responsables</p>{presuntosResponsables.map((opcion) => <p key={opcion.value}><strong>{opcion.label}:</strong> {opcion.descripcion}</p>)}</div>}
                    <div className="mt-4">
                      <CampoTextarea
                        label={`Descripción del presunto responsable${presuntosResponsables.find((opcion) => opcion.value === agresion.presunto_responsable) ? ` (${presuntosResponsables.find((opcion) => opcion.value === agresion.presunto_responsable)?.label})` : ""}`}
                        value={agresion.presunto_responsable_descripcion}
                        onChange={(valor) => actualizarAgresion(indice, "presunto_responsable_descripcion", valor)}
                        placeholder="Amplíe la información sobre el presunto responsable identificado, si es seguro proporcionarla."
                        filas={3}
                      />
                    </div>
                  </div>
                </div>
              </section>
            );
          })}

          <button type="button" onClick={agregarAgresion} className="inline-flex items-center gap-2 rounded-lg border border-[#8e2329] px-4 py-2.5 text-sm font-semibold text-[#8e2329] transition hover:bg-[#8e2329]/5">
            <Plus size={18} /> Agregar agresión
          </button>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onVolver}
          className="rounded-lg border border-gray-300 bg-white px-7 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          ← Volver
        </button>

        <button
          type="button"
          onClick={onSiguiente}
          className="rounded-lg bg-[#8e2329] px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-[#701b20]"
        >
          Continuar →
        </button>
      </div>
    </div>
  );
}
