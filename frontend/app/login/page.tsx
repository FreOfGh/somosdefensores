"use client";

import { FormEvent, useState } from "react";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  const iniciarSesion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setEnviando(true); setMensaje("");
      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ email, password, device_name: "administracion-web" }) });
      const datos: { token?: string; message?: string; errors?: Record<string, string[]> } = await respuesta.json();
      const primerError = datos.errors && Object.values(datos.errors)[0]?.[0];
      if (!respuesta.ok) throw new Error(primerError ?? datos.message ?? "No fue posible iniciar sesión.");
      if (!datos.token) throw new Error("El servidor no devolvió un token de acceso.");
      window.localStorage.setItem("revisor_token", datos.token);
      router.replace("/admin/dashboard");
    } catch (error) { setMensaje(error instanceof Error ? error.message : "No fue posible iniciar sesión."); }
    finally { setEnviando(false); }
  };

  return <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-4"><form onSubmit={iniciarSesion} className="w-full max-w-md border border-gray-300 bg-white p-7 shadow-sm"><h1 className="text-2xl font-bold text-black">Iniciar sesión</h1><p className="mt-2 text-sm text-black">Acceso exclusivo para usuarios con rol revisor.</p>{mensaje && <p className="mt-5 border-l-4 border-red-700 bg-red-50 p-3 text-sm text-black">{mensaje}</p>}<label className="mt-6 block text-sm font-semibold text-black">Correo electrónico<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="mt-2 w-full border border-gray-400 px-3 py-2.5 text-black outline-none focus:border-[#8e2329]" /></label><label className="mt-5 block text-sm font-semibold text-black">Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required className="mt-2 w-full border border-gray-400 px-3 py-2.5 text-black outline-none focus:border-[#8e2329]" /></label><button type="submit" disabled={enviando} className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-[#8e2329] px-4 py-3 font-semibold text-white disabled:opacity-60"><LogIn className="h-4 w-4" />{enviando ? "Ingresando..." : "Ingresar"}</button></form></main>;
}
