"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Send } from "lucide-react";

export default function SeguimientoCasoPage() {
  const { token } = useParams<{ token: string }>();
  const [valido, setValido] = useState<boolean | null>(null);
  const [vence, setVence] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const [situacionActual, setSituacionActual] = useState("");
  const [apoyoRecibido, setApoyoRecibido] = useState("");
  const [descripcionApoyo, setDescripcionApoyo] = useState("");
  const [situacionSeguridad, setSituacionSeguridad] = useState("");
  const [comentarios, setComentarios] = useState("");

  useEffect(() => {
    if (!token) return;
    void (async () => {
      try {
        const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/publico/seguimiento/${encodeURIComponent(token)}`, { cache: "no-store" });
        const datos = await respuesta.json();
        if (!respuesta.ok) throw new Error(datos.message || "El enlace no es válido.");
        setValido(true);
        setVence(datos.expires_at ?? "");
      } catch (error) {
        setMensaje(error instanceof Error ? error.message : "El enlace no es válido.");
        setValido(false);
      }
    })();
  }, [token]);

  const enviar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setEnviando(true);
      setMensaje("");
      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/publico/seguimiento/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          situacion_actual: situacionActual,
          apoyo_recibido: apoyoRecibido || null,
          descripcion_apoyo: descripcionApoyo || null,
          situacion_seguridad: situacionSeguridad || null,
          comentarios: comentarios.trim() || null,
        }),
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.message || "No fue posible enviar el seguimiento.");
      setEnviado(true);
      setMensaje("El formulario de seguimiento fue enviado correctamente. Gracias por su respuesta.");
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : "No fue posible enviar el seguimiento.");
    } finally {
      setEnviando(false);
    }
  };

  if (valido === null) return <main className="min-h-screen bg-[#f5f5f5] p-12 text-center text-black">Validando enlace...</main>;
  if (!valido) return <main className="min-h-screen bg-[#f5f5f5] p-12 text-center text-black">{mensaje || "El enlace no está disponible."}</main>;

  const claseInput = "mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#92212a] focus:ring-2 focus:ring-[#92212a]/20";

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <header className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b-4 border-[#ed5a0b] bg-[#92212a] px-6 py-7 text-white">
            <h1 className="text-2xl font-bold">Formulario de seguimiento del caso</h1>
            <p className="mt-1 text-sm text-white/90">
              Cuéntenos cómo va su situación después del apoyo recibido.
              {vence && ` Este enlace vence el ${new Date(vence).toLocaleDateString("es-CO")}.`}
            </p>
          </div>
        </header>

        {mensaje && (
          <p className={`mt-5 rounded-lg border-l-4 p-4 text-sm shadow-sm ${enviado ? "border-green-700 bg-green-50 text-black" : "border-[#92212a] bg-white text-black"}`}>
            {mensaje}
          </p>
        )}

        {!enviado && (
          <form onSubmit={enviar} className="mt-6 space-y-6">
            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="bg-[#92212a] px-6 py-3"><h2 className="text-sm font-bold uppercase tracking-wide text-white">Situación actual</h2></div>
              <div className="space-y-5 p-6">
                <label className="block text-sm font-semibold text-black">
                  Describa su situación actual
                  <span className="ml-1 text-[#92212a]">*</span>
                  <textarea value={situacionActual} onChange={(e) => setSituacionActual(e.target.value)} rows={5} required maxLength={5000} placeholder="Describa cómo se encuentra actualmente y cualquier cambio relevante desde la aprobación del caso." className={claseInput} />
                </label>

                <div>
                  <span className="block text-sm font-semibold text-black">¿Recibió el apoyo o desembolso previsto?</span>
                  <div className="mt-3 flex flex-wrap gap-6">
                    {[["si", "Sí"], ["parcial", "Parcialmente"], ["no", "No"]].map(([valor, texto]) => (
                      <label key={valor} className="flex items-center gap-2 text-sm text-black">
                        <input type="radio" name="apoyo_recibido" value={valor} checked={apoyoRecibido === valor} onChange={(e) => setApoyoRecibido(e.target.value)} className="accent-[#92212a]" />
                        {texto}
                      </label>
                    ))}
                  </div>
                </div>

                {apoyoRecibido && apoyoRecibido !== "si" && (
                  <label className="block text-sm font-semibold text-black">
                    Describa la situación con el apoyo
                    <textarea value={descripcionApoyo} onChange={(e) => setDescripcionApoyo(e.target.value)} rows={4} maxLength={5000} placeholder="Explique qué falta o qué dificultades hubo con el apoyo." className={claseInput} />
                  </label>
                )}
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="bg-[#92212a] px-6 py-3"><h2 className="text-sm font-bold uppercase tracking-wide text-white">Seguridad y comentarios</h2></div>
              <div className="space-y-5 p-6">
                <div>
                  <span className="block text-sm font-semibold text-black">¿Cómo califica su situación de seguridad actual?</span>
                  <div className="mt-3 flex flex-wrap gap-6">
                    {[["mejoro", "Mejoró"], ["igual", "Permanece igual"], ["empeoro", "Empeoró"]].map(([valor, texto]) => (
                      <label key={valor} className="flex items-center gap-2 text-sm text-black">
                        <input type="radio" name="situacion_seguridad" value={valor} checked={situacionSeguridad === valor} onChange={(e) => setSituacionSeguridad(e.target.value)} className="accent-[#92212a]" />
                        {texto}
                      </label>
                    ))}
                  </div>
                </div>

                <label className="block text-sm font-semibold text-black">
                  Comentarios adicionales
                  <textarea value={comentarios} onChange={(e) => setComentarios(e.target.value)} rows={4} maxLength={5000} placeholder="Agregue cualquier comentario adicional que considere pertinente." className={claseInput} />
                </label>
              </div>
            </section>

            <div className="flex justify-end">
              <button type="submit" disabled={enviando} className="inline-flex items-center gap-2 rounded-lg bg-[#92212a] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#701b20] disabled:opacity-60">
                <Send className="h-4 w-4" />
                {enviando ? "Enviando..." : "Enviar seguimiento"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
