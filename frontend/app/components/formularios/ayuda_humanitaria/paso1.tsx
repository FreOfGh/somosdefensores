import { FormularioProteccionIndividual } from "@/types/formularios/proteccion-individual.types";
import CampoTexto from "@/app/components/formularios/shared/campo-texto";
import CampoTextarea from "@/app/components/formularios/shared/campo-textarea";
import CampoSelect from "@/app/components/formularios/shared/campo-select";
import CamposUbicacion, {
  CampoUbicacion,
} from "@/app/components/formularios/shared/campos-ubicacion";
import { PARENTESCOS, TIPOS_DOCUMENTO_IDENTIDAD } from "@/lib/data/colombia";

interface PersonaConvive {
  parentesco: string;
}

interface Paso1Props {
  formulario: FormularioProteccionIndividual;
  errores: Record<string, string>;
  edadesHijos: string[];
  personasConviven: PersonaConvive[];
  onCampoChange: (
    campo: keyof FormularioProteccionIndividual,
    valor: string
  ) => void;
  onEdadesHijosChange: (edades: string[]) => void;
  onPersonasConvivenChange: (personas: PersonaConvive[]) => void;
  onSiguiente: () => void;
  esPasantia?: boolean;
}

function soloNumeros(valor: string): string {
  return valor.replace(/\D/g, "");
}

export default function PasoEntrevistaInicial({
  formulario,
  errores,
  edadesHijos,
  personasConviven,
  onCampoChange,
  onEdadesHijosChange,
  onPersonasConvivenChange,
  onSiguiente,
  esPasantia = false,
}: Paso1Props) {
  const onUbicacionChange = (campo: CampoUbicacion, valor: string) => {
    onCampoChange(campo as keyof FormularioProteccionIndividual, valor);
  };

  const actualizarEdadHijo = (indice: number, edad: string) => {
    const nuevasEdades = [...edadesHijos];
    nuevasEdades[indice] = soloNumeros(edad);
    onEdadesHijosChange(nuevasEdades);
  };

  const actualizarParentesco = (indice: number, parentesco: string) => {
    const nuevasPersonas = [...personasConviven];
    nuevasPersonas[indice] = { parentesco };
    onPersonasConvivenChange(nuevasPersonas);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-[#fefbfb] p-6 shadow-sm">
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Fecha de ocurrencia del caso
          <span className="ml-1 text-[#8e2329]">*</span>
        </label>

        <input
          type="date"
          value={formulario.fecha_remision}
          onChange={(e) => onCampoChange("fecha_remision", e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#8e2329] focus:ring-2 focus:ring-[#8e2329]/20 md:w-1/2"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-[#fefbfb] shadow-sm">
        <div className="bg-[#8e2329] px-6 py-4 text-white">
          <h2 className="font-bold">Información personal</h2>
          <p className="mt-1 text-xs text-white/80">
            Información personal de la persona solicitante.
          </p>
        </div>

        <div className="space-y-6 p-6">
          <CampoTexto
            label="Nombres y apellidos"
            value={formulario.nombre_apellidos}
            onChange={(v) => onCampoChange("nombre_apellidos", v)}
            placeholder="Nombres y apellidos completos"
            required
            error={errores.nombre_apellidos}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <CampoSelect
              label="Tipo de documento"
              value={formulario.tipo_documento}
              onChange={(v) => onCampoChange("tipo_documento", v)}
              opciones={TIPOS_DOCUMENTO_IDENTIDAD}
              required
              error={errores.tipo_documento}
            />

            <CampoTexto
              label="Número de identificación"
              value={formulario.cedula}
              onChange={(v) => onCampoChange("cedula", soloNumeros(v))}
              placeholder="Solo números"
              required
              type="text"
              error={errores.cedula}
            />

            <CampoTexto
              label="Edad"
              value={formulario.edad}
              onChange={(v) => onCampoChange("edad", soloNumeros(v))}
              placeholder="Edad (0 a 100)"
              required
              type="number"
              error={errores.edad}
            />
          </div>

          <CampoSelect
            label="Género"
            value={formulario.genero}
            onChange={(v) => onCampoChange("genero", v)}
            required
            error={errores.genero}
            opciones={[
              { value: "F", label: "Femenino" },
              { value: "M", label: "Masculino" },
              { value: "LGBTIQ+", label: "LGBTIQ+ / OSIGD" },
              { value: "otro", label: "Otro" },
              { value: "no_responde", label: "Prefiero no responder" },
            ]}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <CampoTexto
              label="Teléfono / Celular"
              value={formulario.telefono}
              onChange={(v) => onCampoChange("telefono", soloNumeros(v))}
              placeholder="Solo números"
              required
              type="tel"
              error={errores.telefono}
            />

            <CampoTexto
              label="Correo electrónico"
              value={formulario.correo}
              onChange={(v) => onCampoChange("correo", v)}
              placeholder="correo@ejemplo.com"
              required
              type="email"
              error={errores.correo}
            />
          </div>

          <CampoSelect
            label="Grupo étnico y/o poblacional"
            value={formulario.grupo_etnico}
            onChange={(v) => onCampoChange("grupo_etnico", v)}
            opciones={[
              { value: "indigena", label: "Indígena" },
              { value: "afrodescendiente", label: "Afrodescendiente" },
              { value: "afrocolombiano", label: "Afrocolombiano/a" },
              { value: "campesino", label: "Campesino/a" },
              { value: "adulto_mayor", label: "Adulto Mayor" },
              { value: "mujeres", label: "Mujeres" },
              { value: "lgbiq_osigd", label: "Lgbiq+/OSIGD" },
              { value: "raizal", label: "Raizal" },
              { value: "palenquero", label: "Palenquero/a" },
              { value: "rom", label: "Rrom / Gitano" },
              { value: "ninguno", label: "Ninguno" },
              { value: "no_responde", label: "Prefiero no responder" },
            ]}
          />

          <CampoTexto
            label="Nombre de la organización a la cual pertenece"
            value={formulario.nombre_organizacion}
            onChange={(v) => onCampoChange("nombre_organizacion", v)}
            placeholder="Nombre de la organización"
            required
            error={errores.nombre_organizacion}
          />

          <CampoSelect
            label="Tipo de liderazgo o derechos que defiende"
            value={formulario.tipo_liderazgo}
            onChange={(v) => onCampoChange("tipo_liderazgo", v)}
            required
            error={errores.tipo_liderazgo}
            opciones={[
              { value: "comunal", label: "Comunal" },
              { value: "comunitario", label: "Comunitario" },
              { value: "campesino", label: "Campesino" },
              {
                value: "defensoras_derechos_mujeres",
                label: "Defensoras de los derechos de las mujeres",
              },
              { value: "afrodescendiente", label: "Afrodescendiente" },
              { value: "indigena", label: "Indígena" },
              { value: "sindical", label: "Sindical" },
              { value: "ambiental", label: "Ambiental" },
              { value: "liderazgo_victimas", label: "Liderazgo de víctimas" },
              { value: "lgtbi", label: "LGTBI" },
              { value: "juvenil", label: "Juvenil" },
              { value: "estudiantil", label: "Estudiantil" },
              { value: "activista_ddhh", label: "Activista de DD.HH" },
              { value: "mujer_buscadora", label: "Mujer buscadora" },
              { value: "otro", label: "Otro (debe describirlo)" },
            ]}
          />

          {formulario.tipo_liderazgo === "otro" && (
            <CampoTexto
              label="Especifique el tipo de liderazgo o derechos que defiende"
              value={formulario.tipo_liderazgo_otro}
              onChange={(v) => onCampoChange("tipo_liderazgo_otro", v)}
              placeholder="Describa el tipo de liderazgo o derechos que defiende"
              required
              error={errores.tipo_liderazgo_otro}
            />
          )}

          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-700">
              Condición de discapacidad
            </label>

            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="discapacidad"
                  value="si"
                  checked={formulario.tiene_discapacidad === "si"}
                  onChange={(e) =>
                    onCampoChange("tiene_discapacidad", e.target.value)
                  }
                  className="accent-[#8e2329]"
                />
                Sí
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="discapacidad"
                  value="no"
                  checked={formulario.tiene_discapacidad === "no"}
                  onChange={(e) =>
                    onCampoChange("tiene_discapacidad", e.target.value)
                  }
                  className="accent-[#8e2329]"
                />
                No
              </label>
            </div>

            {formulario.tiene_discapacidad === "si" && (
              <div className="mt-4">
                <CampoTexto
                  label="¿Cuál?"
                  value={formulario.cual_discapacidad}
                  onChange={(v) => onCampoChange("cual_discapacidad", v)}
                  placeholder="Describa la condición de discapacidad"
                />
              </div>
            )}
          </div>

          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-700">
              Condición especial en salud
            </label>

            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="salud"
                  value="si"
                  checked={formulario.tiene_condicion_salud === "si"}
                  onChange={(e) =>
                    onCampoChange("tiene_condicion_salud", e.target.value)
                  }
                  className="accent-[#8e2329]"
                />
                Sí
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="salud"
                  value="no"
                  checked={formulario.tiene_condicion_salud === "no"}
                  onChange={(e) =>
                    onCampoChange("tiene_condicion_salud", e.target.value)
                  }
                  className="accent-[#8e2329]"
                />
                No
              </label>
            </div>

            {formulario.tiene_condicion_salud === "si" && (
              <div className="mt-4">
                <CampoTextarea
                  label="¿Cuál?"
                  value={formulario.cual_condicion_salud}
                  onChange={(v) => onCampoChange("cual_condicion_salud", v)}
                  placeholder="Describa la condición especial en salud"
                  filas={3}
                />
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h3 className="mb-5 text-lg font-bold text-[#8e2329]">
              Composición del grupo familiar
            </h3>

            <CampoSelect
              label="Estado civil"
              value={formulario.estado_civil}
              onChange={(v) => onCampoChange("estado_civil", v)}
              opciones={[
                { value: "soltero", label: "Soltero/a" },
                { value: "casado", label: "Casado/a" },
                { value: "union_libre", label: "Unión libre" },
                { value: "separado", label: "Separado/a" },
                { value: "divorciado", label: "Divorciado/a" },
                { value: "viudo", label: "Viudo/a" },
                { value: "otra", label: "Otra" },
              ]}
            />

            {formulario.estado_civil === "otra" && (
              <div className="mt-4">
                <CampoTexto
                  label="Especifique"
                  value={formulario.otra_composicion_familiar}
                  onChange={(v) =>
                    onCampoChange("otra_composicion_familiar", v)
                  }
                  placeholder="Especifique"
                />
              </div>
            )}

            <div className="mt-6">
              <label className="mb-3 block text-sm font-semibold text-gray-700">
                ¿Tiene hijos/as?
              </label>

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="hijos"
                    value="si"
                    checked={formulario.tiene_hijos === "si"}
                    onChange={(e) =>
                      onCampoChange("tiene_hijos", e.target.value)
                    }
                    className="accent-[#8e2329]"
                  />
                  Sí
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="hijos"
                    value="no"
                    checked={formulario.tiene_hijos === "no"}
                    onChange={(e) =>
                      onCampoChange("tiene_hijos", e.target.value)
                    }
                    className="accent-[#8e2329]"
                  />
                  No
                </label>
              </div>
            </div>

            {formulario.tiene_hijos === "si" && (
              <div className="mt-5">
                <label className="mb-3 block text-sm font-semibold text-gray-700">
                  Edades de los hijos/as
                </label>

                {edadesHijos.length === 0 && (
                  <p className="mb-3 text-sm text-gray-500">
                    Aún no ha agregado hijos. Use el botón para registrar la
                    edad de cada hijo/a.
                  </p>
                )}

                <div className="space-y-3">
                  {edadesHijos.map((edad, indice) => (
                    <div
                      key={indice}
                      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
                    >
                      <span className="text-sm font-semibold text-gray-600">
                        Hijo/a {indice + 1}
                      </span>

                      <div className="flex-1">
                        <CampoTexto
                          label="Edad"
                          value={edad}
                          onChange={(v) => actualizarEdadHijo(indice, v)}
                          placeholder="Edad en años"
                          type="number"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          onEdadesHijosChange(
                            edadesHijos.filter((_, i) => i !== indice)
                          )
                        }
                        className="mt-6 rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => onEdadesHijosChange([...edadesHijos, ""])}
                  className="mt-3 rounded-lg bg-[#8e2329] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#701b20]"
                >
                  + Agregar hijo/a
                </button>
              </div>
            )}

            <div className="mt-6">
              <label className="mb-3 block text-sm font-semibold text-gray-700">
                Personas que viven con usted
              </label>

              {personasConviven.length === 0 && (
                <p className="mb-3 text-sm text-gray-500">
                  Si vive con más personas, agréguelas con el botón e indique
                  el parentesco de cada una.
                </p>
              )}

              <div className="space-y-3">
                {personasConviven.map((persona, indice) => (
                  <div
                    key={indice}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
                  >
                    <span className="text-sm font-semibold text-gray-600">
                      Persona {indice + 1}
                    </span>

                    <div className="flex-1">
                      <CampoSelect
                        label="Parentesco"
                        value={persona.parentesco}
                        onChange={(v) => actualizarParentesco(indice, v)}
                        opciones={PARENTESCOS}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onPersonasConvivenChange(
                          personasConviven.filter((_, i) => i !== indice)
                        )
                      }
                      className="mt-6 rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  onPersonasConvivenChange([
                    ...personasConviven,
                    { parentesco: "" },
                  ])
                }
                className="mt-3 rounded-lg bg-[#8e2329] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#701b20]"
              >
                + Agregar persona
              </button>
            </div>

            <div className="mt-6 md:w-1/3">
              <CampoTexto
                label="Total de personas del grupo familiar"
                value={formulario.total_grupo_familiar}
                onChange={(v) =>
                  onCampoChange("total_grupo_familiar", soloNumeros(v))
                }
                type="number"
                placeholder="Cantidad"
              />
            </div>
          </div>

          <CamposUbicacion
            titulo="Lugar de procedencia"
            prefijo="procedencia"
            valores={formulario}
            errores={errores}
            onCampoChange={onUbicacionChange}
            required
          />

          <CamposUbicacion
            titulo="Lugar de residencia"
            prefijo="residencia"
            valores={formulario}
            errores={errores}
            onCampoChange={onUbicacionChange}
            required
          />

          {esPasantia && (
            <CampoSelect
              label="Tipo de pasantía"
              value={formulario.tipo_pasantia}
              onChange={(v) => onCampoChange("tipo_pasantia", v)}
              required
              error={errores.tipo_pasantia}
              opciones={[
                { value: "nacional", label: "Nacional" },
                { value: "internacional", label: "Internacional" },
              ]}
            />
          )}
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
