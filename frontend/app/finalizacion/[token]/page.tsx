"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type EstadoEnlace = "cargando" | "valido" | "invalido" | "finalizado";

export default function FinalizacionCasoPage() {
  const { token } = useParams<{ token: string }>();
  const [estado, setEstado] = useState<EstadoEnlace>("cargando");
  const [respuesta, setRespuesta] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!token) return;

    const validarEnlace = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/publico/finalizacion/${encodeURIComponent(token)}`
        );

        if (!response.ok) {
          const data = await response.json();
          setMensaje(data.message || "El enlace de finalizacion no es valido.");
          setEstado("invalido");
          return;
        }

        setEstado("valido");
      } catch {
        setMensaje("No fue posible validar el enlace. Intente nuevamente.");
        setEstado("invalido");
      }
    };

    validarEnlace();
  }, [token]);

  const enviarFormulario = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!respuesta.trim()) {
      setMensaje("Escriba una respuesta antes de finalizar el caso.");
      return;
    }

    setEnviando(true);
    setMensaje("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/publico/finalizacion/${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ respuesta: respuesta.trim() }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        setMensaje(data.message || "No fue posible finalizar el caso.");
        setEstado("invalido");
        return;
      }

      setEstado("finalizado");
    } catch {
      setMensaje("No fue posible enviar el formulario. Intente nuevamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-4 py-10 sm:px-6">
      <section className="mx-auto max-w-2xl border border-stone-200 bg-white shadow-sm">
        <header className="border-b-4 border-[#ed5a0b] bg-[#92212a] px-6 py-7 text-white sm:px-9">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/80">Somos Defensores</p>
          <h1 className="mt-2 text-2xl font-bold">Finalizacion de caso</h1>
        </header>

        <div className="p-6 sm:p-9">
          {estado === "cargando" && <p className="text-slate-600">Validando enlace...</p>}

          {estado === "invalido" && (
            <div className="border-l-4 border-red-700 bg-red-50 p-4 text-red-900" role="alert">
              {mensaje}
            </div>
          )}

          {estado === "finalizado" && (
            <div className="border-l-4 border-[#ed5a0b] bg-orange-50 p-5 text-slate-800">
              <h2 className="text-lg font-bold text-[#92212a]">Caso finalizado</h2>
              <p className="mt-2">Su respuesta fue registrada correctamente. Este enlace ya no puede volver a utilizarse.</p>
            </div>
          )}

          {estado === "valido" && (
            <form onSubmit={enviarFormulario}>
              <p className="text-base leading-7 text-slate-700">Comparta una breve respuesta sobre el cierre del caso. Al enviarla, el caso quedara finalizado y el enlace expirara.</p>

              <label htmlFor="respuesta" className="mt-6 block text-sm font-bold text-slate-800">
                Respuesta de finalizacion
              </label>
              <textarea
                id="respuesta"
                value={respuesta}
                onChange={(event) => setRespuesta(event.target.value)}
                rows={7}
                maxLength={5000}
                required
                className="mt-2 block w-full border border-stone-300 bg-white px-3 py-3 text-slate-900 outline-none focus:border-[#92212a] focus:ring-2 focus:ring-[#92212a]/20"
              />

              {mensaje && <p className="mt-3 text-sm text-red-700">{mensaje}</p>}

              <button
                type="submit"
                disabled={enviando}
                className="mt-6 bg-[#92212a] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#731920] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {enviando ? "Finalizando caso..." : "Finalizar caso"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}