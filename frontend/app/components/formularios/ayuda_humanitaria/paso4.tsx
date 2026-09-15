import {
  DocumentosAdjuntos,
  FormularioProteccionIndividual,
} from "@/types/formularios/proteccion-individual.types";
import CampoArchivo from "@/app/components/formularios/shared/campo-archivo";

type CampoArchivoMultiple =
  | "evidencias_soportes"
  | "denuncias_organismos_estado"
  | "otros_documentos";

interface PasoDocumentosProps {
  formulario: FormularioProteccionIndividual;
  errores: Record<string, string>;
  documentos: DocumentosAdjuntos;
  onArchivoChange: (
    campo:
      | "certificacion_cuenta_bancaria"
      | "documento_identidad"
      | "carta_organizacion"
      | "carta_aceptacion_pasantia",
    archivos: FileList | null
  ) => void;
  onArchivosMultiplesChange: (
    campo: CampoArchivoMultiple,
    archivos: FileList | null
  ) => void;
  onVolver: () => void;
  enviando: boolean;
}

export default function PasoDocumentos({
  formulario,
  errores,
  documentos,
  onArchivoChange,
  onArchivosMultiplesChange,
  onVolver,
  enviando,
}: PasoDocumentosProps) {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-[#fefbfb] shadow-sm">
        <div className="bg-[#8e2329] px-6 py-4 text-white">
          <h2 className="font-bold">Documentos adjuntos</h2>
          <p className="mt-1 text-xs leading-5 text-white/80">
            Los primeros documentos obligatorios son la carta de la organización,
            el documento de identidad y la certificación bancaria. Los demás se
            pueden adjuntar en cualquier orden.
          </p>
        </div>

        <div className="space-y-5 p-6">
          <CampoArchivo
            label="1. Carta de la organización que presenta el caso"
            descripcion="Carta de la organización que presenta o remite el caso."
            value={documentos.carta_organizacion}
            required
            error={errores.carta_organizacion}
            onChange={(archivos) =>
              onArchivoChange("carta_organizacion", archivos)
            }
          />

          <CampoArchivo
            label="2. Documento de identidad"
            descripcion="Documento de identidad de la persona amenazada."
            value={documentos.documento_identidad}
            required
            error={errores.documento_identidad}
            onChange={(archivos) =>
              onArchivoChange("documento_identidad", archivos)
            }
          />

          <CampoArchivo
            label="3. Certificación de cuenta bancaria"
            descripcion="Certificación de cuenta bancaria para realizar la transferencia. Puede ser de cualquier banco, Nequi o Daviplata. Se recomienda que no tenga una antigüedad superior a 30 días."
            value={documentos.certificacion_cuenta_bancaria}
            required
            error={errores.certificacion_cuenta_bancaria}
            onChange={(archivos) =>
              onArchivoChange("certificacion_cuenta_bancaria", archivos)
            }
          />

          {formulario.tipo_pasantia && formulario.tipo_pasantia !== "internacional" && (
            <CampoArchivo
              label="4. Carta de aceptación de la pasantía"
              descripcion="Carta de aceptación emitida por la institución donde se realizará la pasantía."
              value={documentos.carta_aceptacion_pasantia}
              required
              error={errores.carta_aceptacion_pasantia}
              onChange={(archivos) =>
                onArchivoChange("carta_aceptacion_pasantia", archivos)
              }
            />
          )}

          <CampoArchivo
            label="5. Evidencias o soportes"
            descripcion="Adjunte fotografías, documentos, capturas, comunicaciones u otros soportes relacionados con la situación."
            value={documentos.evidencias_soportes}
            multiple
            onChange={(archivos) =>
              onArchivosMultiplesChange("evidencias_soportes", archivos)
            }
          />

          <CampoArchivo
            label="6. Denuncias ante organismos del Estado"
            descripcion="Si existen denuncias ante organismos del Estado, puede adjuntarlas aquí."
            value={documentos.denuncias_organismos_estado}
            multiple
            onChange={(archivos) =>
              onArchivosMultiplesChange("denuncias_organismos_estado", archivos)
            }
          />

          <CampoArchivo
            label="7. Otros documentos pertinentes"
            descripcion="Adjunte cualquier otro documento que considere relevante para esta solicitud."
            value={documentos.otros_documentos}
            multiple
            onChange={(archivos) =>
              onArchivosMultiplesChange("otros_documentos", archivos)
            }
          />

        </div>
      </div>

      <div className="rounded-xl border border-[#8e2329]/20 bg-[#8e2329]/5 p-5">
        <div className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8e2329] text-sm font-bold text-white">
            !
          </div>

          <div>
            <h3 className="font-bold text-[#8e2329]">Antes de enviar</h3>
            <p className="mt-1 text-sm leading-6 text-gray-700">
              Revise que la información suministrada sea correcta y que los
              documentos adjuntos correspondan a la solicitud.
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Los documentos pueden ser enviados en formato PDF, JPG, PNG, DOC
              o DOCX.
            </p>
          </div>
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
          type="submit"
          disabled={enviando}
          className="rounded-lg bg-[#8e2329] px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-[#701b20] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {enviando ? "Enviando solicitud..." : "Enviar solicitud"}
        </button>
      </div>
    </div>
  );
}
