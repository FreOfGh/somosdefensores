import { FormularioProteccionIndividual } from "@/types/formularios/proteccion-individual.types";
import CampoTexto from "@/app/components/formularios/shared/campo-texto";

interface PasoRemisionProps {
  formulario: FormularioProteccionIndividual;
  errores: Record<string, string>;
  onCampoChange: (
    campo: keyof FormularioProteccionIndividual,
    valor: string
  ) => void;
  onVolver: () => void;
  onSiguiente: () => void;
}

function soloNumeros(valor: string): string {
  return valor.replace(/\D/g, "");
}

export default function PasoRemisionSolicitud({
  formulario,
  errores,
  onCampoChange,
  onVolver,
  onSiguiente,
}: PasoRemisionProps) {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-[#fefbfb] shadow-sm">
        <div className="bg-[#8e2329] px-6 py-4 text-white">
          <h2 className="font-bold">Remisión de la solicitud</h2>
          <p className="mt-1 text-xs text-white/80">
            Información de la persona de la organización que presenta o remite
            la solicitud.
          </p>
        </div>

        <div className="space-y-6 p-6">
          <CampoTexto
            label="Organización que remite el caso"
            value={formulario.organizacion_remite}
            onChange={(v) => onCampoChange("organizacion_remite", v)}
            placeholder="Nombre de la organización que remite"
            required
            error={errores.organizacion_remite}
          />

          <div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <CampoTexto
                label="Nombre de quien remite el caso"
                value={formulario.persona_organizacion_nombre}
                onChange={(v) =>
                  onCampoChange("persona_organizacion_nombre", v)
                }
                placeholder="Nombre completo"
                error={errores.persona_organizacion_nombre}
              />

              <CampoTexto
                label="Correo electrónico de quien remite el caso"
                value={formulario.persona_organizacion_correo}
                onChange={(v) =>
                  onCampoChange("persona_organizacion_correo", v)
                }
                placeholder="correo@ejemplo.com"
                type="email"
                error={errores.persona_organizacion_correo}
              />

              <CampoTexto
                label="Número de celular de quien remite el caso"
                value={formulario.persona_organizacion_celular}
                onChange={(v) =>
                  onCampoChange("persona_organizacion_celular", soloNumeros(v))
                }
                placeholder="Solo números"
                type="tel"
                error={errores.persona_organizacion_celular}
              />
            </div>
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
