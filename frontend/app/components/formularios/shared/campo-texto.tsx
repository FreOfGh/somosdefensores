interface CampoTextoProps {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  type?: string;
}

export default function CampoTexto({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  type = "text",
}: CampoTextoProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="ml-1 text-[#8e2329]">*</span>}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#8e2329] focus:ring-2 focus:ring-[#8e2329]/20 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
