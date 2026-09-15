import { FormularioProteccionColectiva } from "@/types/formularios/proteccion-colectiva.types";
import CampoTextarea from "@/app/components/formularios/shared/campo-textarea";

interface Paso2Props {
  formulario: FormularioProteccionColectiva;
  errores: Record<string, string>;
  onCampoChange: (campo: keyof FormularioProteccionColectiva, valor: string) => void;
  onVolver: () => void;
  enviando: boolean;
}

export default function PasoSeguridadYProteccion({
  formulario,
  errores,
  onCampoChange,
  onVolver,
  enviando,
}: Paso2Props) {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-[#fefbfb] shadow-sm">
        <div className="bg-[#8e2329] px-6 py-4 text-white">
          <h2 className="font-bold">2. Información de la organización</h2>
          <p className="mt-1 text-xs text-white/80">
            Describa la organización, colectivo o comunidad.
          </p>
        </div>

        <div className="space-y-6 p-6">
          <CampoTextarea
            label="Descripción de la organización"
            value={formulario.descripcion_organizacion}
            onChange={(v) => onCampoChange("descripcion_organizacion", v)}
            placeholder="Describa cuántas personas o familias conforman la organización, cómo se encuentran estructuradas, sus reivindicaciones y los derechos que defienden."
            required
            filas={8}
            error={errores.descripcion_organizacion}
          />

          <CampoTextarea
            label="Trabajos que realiza la organización/colectivo/comunidad"
            value={formulario.trabajos_realiza}
            onChange={(v) => onCampoChange("trabajos_realiza", v)}
            placeholder="Describa las actividades, trabajos y labores que realiza la organización."
            required
            filas={7}
            error={errores.trabajos_realiza}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-[#fefbfb] shadow-sm">
        <div className="bg-[#8e2329] px-6 py-4 text-white">
          <h2 className="font-bold">3. Situación de seguridad</h2>
          <p className="mt-1 text-xs text-white/80">
            Describa los riesgos y situaciones de seguridad que enfrenta la
            organización.
          </p>
        </div>

        <div className="space-y-6 p-6">
          <CampoTextarea
            label="Describa los riesgos de seguridad y agresiones que enfrenta la organización"
            value={formulario.riesgos_seguridad}
            onChange={(v) => onCampoChange("riesgos_seguridad", v)}
            placeholder="Incluya detalles de los incidentes de seguridad y agresiones."
            required
            filas={8}
            error={errores.riesgos_seguridad}
          />

          <CampoTextarea
            label="Detalle de los incidentes de seguridad"
            value={formulario.incidentes}
            onChange={(v) => onCampoChange("incidentes", v)}
            placeholder="Describa los incidentes ocurridos, fechas, circunstancias y demás información relevante."
            filas={7}
          />

          <CampoTextarea
            label="¿Cómo afectan estos riesgos y agresiones el trabajo de la organización?"
            value={formulario.afectacion_trabajo}
            onChange={(v) => onCampoChange("afectacion_trabajo", v)}
            placeholder="Explique cómo la situación de seguridad afecta las actividades de la organización."
            filas={6}
          />

          <CampoTextarea
            label="Actores que generan el riesgo"
            value={formulario.actores_riesgo}
            onChange={(v) => onCampoChange("actores_riesgo", v)}
            placeholder="Indique, cuando sea posible y seguro hacerlo, los actores que generan los riesgos."
            filas={5}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-[#fefbfb] shadow-sm">
        <div className="bg-[#8e2329] px-6 py-4 text-white">
          <h2 className="font-bold">4. Medidas de protección colectiva</h2>
          <p className="mt-1 text-xs text-white/80">
            Indique las medidas de protección que considera necesarias.
          </p>
        </div>

        <div className="space-y-6 p-6">
          <CampoTextarea
            label="Medidas de protección colectiva solicitadas"
            value={formulario.medidas_proteccion}
            onChange={(v) => onCampoChange("medidas_proteccion", v)}
            placeholder="Describa las medidas de protección colectiva que solicita."
            required
            filas={8}
            error={errores.medidas_proteccion}
          />

          <CampoTextarea
            label="Explique cómo y por qué las medidas solicitadas pueden aportar a mejorar la situación de seguridad y reducir los riesgos"
            value={formulario.justificacion_medidas}
            onChange={(v) => onCampoChange("justificacion_medidas", v)}
            placeholder="Explique los motivos por los cuales considera que las medidas solicitadas contribuirían a mejorar la situación."
            required
            filas={8}
            error={errores.justificacion_medidas}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-[#fefbfb] shadow-sm">
        <div className="bg-[#8e2329] px-6 py-4 text-white">
          <h2 className="font-bold">5. Información adicional</h2>
        </div>

        <div className="p-6">
          <CampoTextarea
            label="Anexe cualquier información que considere pertinente para esta solicitud"
            value={formulario.informacion_adicional}
            onChange={(v) => onCampoChange("informacion_adicional", v)}
            placeholder="Ingrese información adicional que considere importante."
            filas={8}
          />
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
