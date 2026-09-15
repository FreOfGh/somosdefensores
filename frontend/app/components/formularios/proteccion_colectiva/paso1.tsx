import { FormularioProteccionColectiva } from "@/types/formularios/proteccion-colectiva.types";
import CampoTexto from "@/app/components/formularios/shared/campo-texto";

interface Paso1Props {
  formulario: FormularioProteccionColectiva;
  errores: Record<string, string>;
  onCampoChange: (campo: keyof FormularioProteccionColectiva, valor: string) => void;
  onSiguiente: () => void;
}

export default function PasoInformacionGeneral({
  formulario,
  errores,
  onCampoChange,
  onSiguiente,
}: Paso1Props) {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-[#fefbfb] shadow-sm">
        <div className="bg-[#8e2329] px-6 py-4 text-white">
          <h2 className="font-bold">1. Información general del caso</h2>
          <p className="mt-1 text-xs text-white/80">
            Información básica de la organización y persona representante.
          </p>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Fecha de remisión del caso
              <span className="ml-1 text-[#8e2329]">*</span>
            </label>

            <input
              type="date"
              value={formulario.fecha_remision_caso}
              onChange={(e) => onCampoChange("fecha_remision_caso", e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#8e2329] focus:ring-2 focus:ring-[#8e2329]/20 md:w-1/2"
            />

            {errores.fecha_remision_caso && (
              <p className="mt-1 text-xs text-red-600">{errores.fecha_remision_caso}</p>
            )}
          </div>

          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-700">
              ¿Tiene personería jurídica?
              <span className="ml-1 text-[#8e2329]">*</span>
            </label>

            <div className="flex flex-wrap gap-4">
              <label className="flex cursor-pointer text-black items-center gap-2">
                <input
                  type="radio"
                  name="personeria"
                  value="1"
                  checked={formulario.tiene_personeria_juridica === "1"}
                  onChange={(e) => onCampoChange("tiene_personeria_juridica", e.target.value)}
                  className="h-4 w-4 accent-[#8e2329]"
                />
                <span className="text-sm">Sí</span>
              </label>

              <label className="flex cursor-pointer text-black items-center gap-2">
                <input
                  type="radio"
                  name="personeria"
                  value="0"
                  checked={formulario.tiene_personeria_juridica === "0"}
                  onChange={(e) => onCampoChange("tiene_personeria_juridica", e.target.value)}
                  className="h-4 w-4 accent-[#8e2329]"
                />
                <span className="text-sm">No</span>
              </label>
            </div>

            {formulario.tiene_personeria_juridica === "1" && (
              <div className="mt-4 max-w-md">
                <CampoTexto
                  label="RUT"
                  value={formulario.rut}
                  onChange={(v) => onCampoChange("rut", v)}
                  placeholder="Ingrese el RUT"
                />
              </div>
            )}

            {errores.tiene_personeria_juridica && (
              <p className="mt-1 text-xs text-red-600">
                {errores.tiene_personeria_juridica}
              </p>
            )}
          </div>

          <CampoTexto
            label="Nombre de la organización/colectivo/comunidad"
            value={formulario.nombre_organizacion}
            onChange={(v) => onCampoChange("nombre_organizacion", v)}
            placeholder="Nombre completo"
            required
            error={errores.nombre_organizacion}
          />

          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-700">
              Nombres y apellidos de la persona representante
              legal/directora/persona autorizada
              <span className="ml-1 text-[#8e2329]">*</span>
            </label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <CampoTexto
                label="Nombres"
                value={formulario.representante_nombre}
                onChange={(v) => onCampoChange("representante_nombre", v)}
                placeholder="Nombres"
                required
                error={errores.representante_nombre}
              />

              <CampoTexto
                label="Apellidos"
                value={formulario.representante_apellido}
                onChange={(v) => onCampoChange("representante_apellido", v)}
                placeholder="Apellidos"
                required
                error={errores.representante_apellido}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Cargo o condición de representación
            </label>

            <select
              value={formulario.representante_tipo}
              onChange={(e) => onCampoChange("representante_tipo", e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#8e2329] focus:ring-2 focus:ring-[#8e2329]/20"
            >
              <option value="">Seleccione una opción</option>
              <option value="representante_legal">Representante legal</option>
              <option value="director">Director/a</option>
              <option value="persona_autorizada">Persona autorizada</option>
              <option value="coordinador">Coordinador/a</option>
              <option value="asamblea">Asamblea o equivalente</option>
            </select>
          </div>

          <CampoTexto
            label="C.C."
            value={formulario.cedula}
            onChange={(v) => onCampoChange("cedula", v)}
            placeholder="Número de identificación"
            required
            error={errores.cedula}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <CampoTexto
              label="Teléfono / Celular"
              value={formulario.telefono}
              onChange={(v) => onCampoChange("telefono", v)}
              placeholder="Número de contacto"
              required
              error={errores.telefono}
            />

            <CampoTexto
              label="Correo electrónico"
              value={formulario.correo}
              onChange={(v) => onCampoChange("correo", v)}
              placeholder="correo@ejemplo.com"
              type="email"
              required
              error={errores.correo}
            />
          </div>

          <div>
            <h3 className="mb-4 border-b border-gray-200 pb-2 font-bold text-[#8e2329]">
              Ubicación territorial
            </h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <CampoTexto
                label="Departamento(s)"
                value={formulario.departamento}
                onChange={(v) => onCampoChange("departamento", v)}
                placeholder="Departamento"
                required
                error={errores.departamento}
              />

              <CampoTexto
                label="Municipio(s)"
                value={formulario.municipio}
                onChange={(v) => onCampoChange("municipio", v)}
                placeholder="Municipio"
                required
                error={errores.municipio}
              />

              <CampoTexto
                label="Vereda"
                value={formulario.vereda}
                onChange={(v) => onCampoChange("vereda", v)}
                placeholder="Vereda"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
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
