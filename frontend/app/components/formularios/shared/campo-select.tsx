interface Opcion {
  value: string;
  label: string;
}

interface CampoSelectProps {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  opciones: Opcion[];
  required?: boolean;
  error?: string;
}

export default function CampoSelect({
  label,
  value,
  onChange,
  opciones,
  required = false,
  error,
}: CampoSelectProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="ml-1 text-[#8e2329]">*</span>}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#8e2329] focus:ring-2 focus:ring-[#8e2329]/20 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      >
        <option value="">Seleccione una opción</option>

        {opciones.map((opcion) => (
          <option key={opcion.value} value={opcion.value}>
            {opcion.label}
          </option>
        ))}
      </select>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
