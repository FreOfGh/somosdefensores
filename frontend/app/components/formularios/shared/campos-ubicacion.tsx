import {
  DEPARTAMENTOS_COLOMBIA,
  MUNICIPIOS_POR_DEPARTAMENTO,
} from "@/lib/data/colombia";
import CampoSelect from "@/app/components/formularios/shared/campo-select";
import CampoTexto from "@/app/components/formularios/shared/campo-texto";

type SufijoUbicacion =
  | "departamento"
  | "municipio"
  | "vereda_comunidad"
  | "resguardo";

type PrefijoUbicacion = "procedencia" | "residencia";

export type CampoUbicacion = `${PrefijoUbicacion}_${SufijoUbicacion}`;

interface CamposUbicacionProps {
  titulo: string;
  prefijo: PrefijoUbicacion;
  valores: Record<CampoUbicacion, string>;
  errores: Record<string, string>;
  onCampoChange: (campo: CampoUbicacion, valor: string) => void;
  required?: boolean;
}

const opcionesDepartamentos = DEPARTAMENTOS_COLOMBIA.map((departamento) => ({
  value: departamento,
  label: departamento,
}));

export default function CamposUbicacion({
  titulo,
  prefijo,
  valores,
  errores,
  onCampoChange,
  required = false,
}: CamposUbicacionProps) {
  const campoDepartamento = `${prefijo}_departamento` as CampoUbicacion;
  const campoMunicipio = `${prefijo}_municipio` as CampoUbicacion;
  const campoVereda = `${prefijo}_vereda_comunidad` as CampoUbicacion;
  const campoResguardo = `${prefijo}_resguardo` as CampoUbicacion;

  const opcionesMunicipios = (
    MUNICIPIOS_POR_DEPARTAMENTO[valores[campoDepartamento]] ?? []
  ).map((municipio) => ({ value: municipio, label: municipio }));

  return (
    <fieldset className="rounded-xl border border-gray-200 bg-white p-5">
      <legend className="px-2 text-sm font-bold text-[#8e2329]">
        {titulo}
        {required && <span className="ml-1">*</span>}
      </legend>

      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CampoSelect
            label="Departamento"
            value={valores[campoDepartamento]}
            onChange={(v) => {
              onCampoChange(campoDepartamento, v);
              onCampoChange(campoMunicipio, "");
            }}
            opciones={opcionesDepartamentos}
            required={required}
            error={errores[campoDepartamento]}
          />

          <div>
            <CampoSelect
              label="Municipio"
              value={valores[campoMunicipio]}
              onChange={(v) => onCampoChange(campoMunicipio, v)}
              opciones={opcionesMunicipios}
              required={required}
              error={errores[campoMunicipio]}
            />
            {!valores[campoDepartamento] && (
              <p className="mt-1 text-xs text-gray-500">
                Seleccione primero un departamento.
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CampoTexto
            label="Vereda y/o comunidad"
            value={valores[campoVereda]}
            onChange={(v) => onCampoChange(campoVereda, v)}
            placeholder="Nombre de la vereda o comunidad"
            error={errores[campoVereda]}
          />

          <CampoTexto
            label="Consejo comunitario  o consejo comunitario / resguardo o comunidad indigena."
            value={valores[campoResguardo]}
            onChange={(v) => onCampoChange(campoResguardo, v)}
            placeholder="Nombre del consejo comunitario  (si aplica)"
            error={errores[campoResguardo]}
          />
        </div>
      </div>
    </fieldset>
  );
}
