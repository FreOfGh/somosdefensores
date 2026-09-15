interface CampoArchivoProps {
  label: string;
  descripcion?: string;
  multiple?: boolean;
  required?: boolean;
  error?: string;
  value: File | File[] | null;
  onChange: (archivos: FileList | null) => void;
}

export default function CampoArchivo({
  label,
  descripcion,
  multiple = false,
  required = false,
  error,
  value,
  onChange,
}: CampoArchivoProps) {
  const archivos = Array.isArray(value) ? value : value ? [value] : [];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-800">
          {label}
          {required && <span className="ml-1 text-[#8e2329]">*</span>}
        </h3>
        {descripcion && (
          <p className="mt-1 text-xs leading-5 text-gray-500">{descripcion}</p>
        )}
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center transition hover:border-[#8e2329] hover:bg-[#8e2329]/5">
        <div className="mb-2 text-3xl">📎</div>
        <span className="text-sm font-semibold text-[#8e2329]">
          Seleccionar archivo
        </span>
        <span className="mt-1 text-xs text-gray-500">
          PDF, JPG, PNG, DOC o DOCX
        </span>

        <input
          type="file"
          multiple={multiple}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={(e) => onChange(e.target.files)}
        />
      </label>

      {archivos.length > 0 && (
        <div className="mt-3 rounded-lg bg-green-50 p-3">
          <p className="text-sm font-semibold text-green-800">
            {archivos.length} archivo{archivos.length !== 1 ? "s" : ""}{" "}
            seleccionado{archivos.length !== 1 ? "s" : ""}
          </p>

          <div className="mt-2 space-y-1">
            {archivos.map((archivo, index) => (
              <p
                key={`${archivo.name}-${index}`}
                className="truncate text-xs text-green-700"
              >
                • {archivo.name}
              </p>
            ))}
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
