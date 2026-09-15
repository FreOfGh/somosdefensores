import { Agresion } from "@/types/formularios/proteccion-individual.types";
import { DEPARTAMENTOS_COLOMBIA, MUNICIPIOS_POR_DEPARTAMENTO } from "@/lib/data/colombia";
import { Plus, Trash2 } from "lucide-react";
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
            const municipios = (MUNICIPIOS_POR_DEPARTAMENTO[agresion.departamento] ?? []).map((municipio) => ({ value: municipio, label: municipio }));

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
                      <CampoSelect label="Departamento" value={agresion.departamento} onChange={(valor) => actualizarAgresion(indice, "departamento", valor)} opciones={DEPARTAMENTOS_COLOMBIA.map((departamento) => ({ value: departamento, label: departamento }))} required error={errores[`${prefijo}.departamento`]} />
                      <CampoSelect label="Municipio" value={agresion.municipio} onChange={(valor) => actualizarAgresion(indice, "municipio", valor)} opciones={municipios} required error={errores[`${prefijo}.municipio`]} />
                      <CampoTexto label="Vereda y/o comunidad" value={agresion.vereda_comunidad} onChange={(valor) => actualizarAgresion(indice, "vereda_comunidad", valor)} placeholder="Nombre de la vereda o comunidad" />
                      <CampoTexto label="Consejo comunitario o resguardo" value={agresion.resguardo} onChange={(valor) => actualizarAgresion(indice, "resguardo", valor)} placeholder="Si aplica" />
                    </div>
                  </fieldset>

                  <CampoTexto label="Modalidad de agresión que motiva la solicitud" value={agresion.modalidad} onChange={(valor) => actualizarAgresion(indice, "modalidad", valor)} placeholder="Indique la modalidad de agresión" required error={errores[`${prefijo}.modalidad`]} />
                  <CampoTextarea label="Descripción de la agresión" value={agresion.descripcion} onChange={(valor) => actualizarAgresion(indice, "descripcion", valor)} placeholder="Describa lo ocurrido." required filas={5} error={errores[`${prefijo}.descripcion`]} />
                  <CampoTextarea label="Motivos de la agresión" value={agresion.motivos} onChange={(valor) => actualizarAgresion(indice, "motivos", valor)} placeholder="Describa los motivos de la agresión." required filas={4} error={errores[`${prefijo}.motivos`]} />
                  <CampoTextarea label="Presunto responsable" value={agresion.presunto_responsable} onChange={(valor) => actualizarAgresion(indice, "presunto_responsable", valor)} placeholder="Indique el presunto responsable, si es seguro proporcionar esta información." required filas={4} error={errores[`${prefijo}.presunto_responsable`]} />
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
