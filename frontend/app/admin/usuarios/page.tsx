"use client";

import { FormEvent, useEffect, useState } from "react";
import { KeyRound, RefreshCw, Trash2, UserPlus } from "lucide-react";
import { adminFetch } from "@/lib/api/admin-fetch";

type Campo = "name" | "email" | "password" | "password_confirmation" | "rol";
type Formulario = Record<Campo, string>;
type Rol = "" | "validador" | "revisor";
type Usuario = { id: number; name: string; email: string; roles: Array<{ id: number; name: string }> };

const inicial: Formulario = { name: "", email: "", password: "", password_confirmation: "", rol: "" };

function validar(campo: Campo, valor: string, formulario: Formulario): string {
  if (!valor.trim()) return "Este campo es obligatorio.";
  if (campo === "email" && !/^\S+@\S+\.\S+$/.test(valor)) return "Ingrese un correo válido.";
  if (campo === "password" && valor.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  if (campo === "password_confirmation" && valor !== formulario.password) return "Las contraseñas no coinciden.";
  return "";
}

async function obtenerError(respuesta: Response, respaldo: string): Promise<string> {
  const datos: { message?: string; errors?: Record<string, string[]> } = await respuesta.json().catch(() => ({}));
  return datos.errors && Object.values(datos.errors)[0]?.[0] || datos.message || respaldo;
}

export default function UsuariosPage() {
  const [formulario, setFormulario] = useState<Formulario>(inicial);
  const [errores, setErrores] = useState<Partial<Formulario>>({});
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [rolFiltro, setRolFiltro] = useState<Rol>("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [usuarioContrasena, setUsuarioContrasena] = useState<Usuario | null>(null);
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmacion, setConfirmacion] = useState("");

  const cargar = async (rol = rolFiltro) => {
    try {
      setCargando(true);
      const respuesta = await adminFetch(`/api/admin/usuarios${rol ? `?rol=${rol}` : ""}`, { cache: "no-store" });
      if (!respuesta.ok) throw new Error(await obtenerError(respuesta, "No fue posible cargar los usuarios."));
      setUsuarios(await respuesta.json());
    } catch (error) { setMensaje(error instanceof Error ? error.message : "No fue posible cargar los usuarios."); }
    finally { setCargando(false); }
  };

  useEffect(() => { void cargar(); }, []);

  const cambiar = (campo: Campo, valor: string) => {
    const siguiente = { ...formulario, [campo]: valor };
    setFormulario(siguiente);
    setErrores((actual) => ({ ...actual, [campo]: validar(campo, valor, siguiente), ...(campo === "password" ? { password_confirmation: validar("password_confirmation", siguiente.password_confirmation, siguiente) } : {}) }));
  };

  const crear = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nuevosErrores = Object.fromEntries((Object.keys(formulario) as Campo[]).map((campo) => [campo, validar(campo, formulario[campo], formulario)]));
    setErrores(nuevosErrores);
    if (Object.values(nuevosErrores).some(Boolean)) return;
    try {
      setGuardando(true); setMensaje("");
      const respuesta = await adminFetch("/api/admin/usuarios/crear", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formulario) });
      if (!respuesta.ok) throw new Error(await obtenerError(respuesta, "No fue posible crear el usuario."));
      setFormulario(inicial); setErrores({}); setMensaje("Usuario creado correctamente."); await cargar();
    } catch (error) { setMensaje(error instanceof Error ? error.message : "No fue posible crear el usuario."); }
    finally { setGuardando(false); }
  };

  const actualizarContrasena = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!usuarioContrasena) return;
    if (nuevaContrasena.length < 8 || nuevaContrasena !== confirmacion) { setMensaje(nuevaContrasena.length < 8 ? "La contraseña debe tener al menos 8 caracteres." : "Las contraseñas no coinciden."); return; }
    try {
      setGuardando(true); setMensaje("");
      const respuesta = await adminFetch(`/api/admin/usuarios/${usuarioContrasena.id}/contrasena`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: nuevaContrasena, password_confirmation: confirmacion }) });
      if (!respuesta.ok) throw new Error(await obtenerError(respuesta, "No fue posible actualizar la contraseña."));
      setUsuarioContrasena(null); setNuevaContrasena(""); setConfirmacion(""); setMensaje("Contraseña actualizada correctamente.");
    } catch (error) { setMensaje(error instanceof Error ? error.message : "No fue posible actualizar la contraseña."); }
    finally { setGuardando(false); }
  };

  const eliminar = async (usuario: Usuario) => {
    if (!window.confirm(`¿Eliminar a ${usuario.name}?`)) return;
    try {
      setGuardando(true); setMensaje("");
      const respuesta = await adminFetch(`/api/admin/usuarios/${usuario.id}`, { method: "DELETE" });
      if (!respuesta.ok) throw new Error(await obtenerError(respuesta, "No fue posible eliminar el usuario."));
      setMensaje("Usuario eliminado correctamente."); await cargar();
    } catch (error) { setMensaje(error instanceof Error ? error.message : "No fue posible eliminar el usuario."); }
    finally { setGuardando(false); }
  };

  return <main className="min-h-screen bg-[#f5f5f5] px-4 py-8 md:px-8"><div className="mx-auto max-w-6xl"><header className="mb-8"><h1 className="text-3xl font-bold text-[#8e2329]">Usuarios</h1><p className="mt-1 text-gray-600">Gestione el equipo de validación y revisión.</p></header>{mensaje && <p className="mb-5 border-l-4 border-[#8e2329] bg-red-50 p-4 text-sm text-slate-800">{mensaje}</p>}<div className="grid gap-8 lg:grid-cols-[360px_1fr]"><form onSubmit={crear} className="space-y-5 border border-gray-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-[#8e2329]">Crear usuario</h2>{([['name', 'Nombre completo', 'text'], ['email', 'Correo electrónico', 'email'], ['password', 'Contraseña', 'password'], ['password_confirmation', 'Confirmar contraseña', 'password']] as Array<[Campo, string, string]>).map(([campo, etiqueta, tipo]) => <label key={campo} className="block text-sm font-semibold text-gray-700">{etiqueta}<input type={tipo} value={formulario[campo]} onChange={(event) => cambiar(campo, event.target.value)} className="mt-2 w-full border border-gray-300 px-3 py-2.5 font-normal text-gray-900 outline-none focus:border-[#8e2329]" />{errores[campo] && <span className="mt-1 block text-xs font-normal text-red-700">{errores[campo]}</span>}</label>)}<label className="block text-sm font-semibold text-gray-700">Rol<select value={formulario.rol} onChange={(event) => cambiar("rol", event.target.value)} className="mt-2 w-full border border-gray-300 px-3 py-2.5 font-normal text-gray-900 outline-none focus:border-[#8e2329]"><option value="">Seleccione un rol</option><option value="validador">Validador</option><option value="revisor">Revisor</option></select>{errores.rol && <span className="mt-1 block text-xs font-normal text-red-700">{errores.rol}</span>}</label><button type="submit" disabled={guardando} className="inline-flex items-center gap-2 bg-[#8e2329] px-5 py-3 text-sm font-semibold text-white hover:bg-[#701b20] disabled:opacity-60"><UserPlus className="h-4 w-4" />Crear usuario</button></form><section className="border border-gray-200 bg-white shadow-sm"><header className="flex items-center justify-between gap-3 border-b border-gray-200 p-5"><h2 className="font-bold text-gray-900">Listado de usuarios</h2><div className="flex gap-2"><select value={rolFiltro} onChange={(event) => { const rol = event.target.value as Rol; setRolFiltro(rol); void cargar(rol); }} className="border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"><option value="">Todos los roles</option><option value="validador">Validador</option><option value="revisor">Revisor</option></select><button type="button" onClick={() => void cargar()} className="inline-flex h-10 w-10 items-center justify-center border border-[#8e2329] text-[#8e2329]" title="Actualizar listado"><RefreshCw className="h-4 w-4" /><span className="sr-only">Actualizar listado</span></button></div></header>{cargando ? <p className="p-12 text-center text-sm text-gray-600">Cargando usuarios...</p> : <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-[#92212a] text-white"><tr><th className="px-5 py-3">Nombre</th><th className="px-5 py-3">Correo</th><th className="px-5 py-3">Rol</th><th className="px-5 py-3 text-right">Acciones</th></tr></thead><tbody className="divide-y divide-gray-200">{usuarios.map((usuario) => <tr key={usuario.id}><td className="px-5 py-4 font-semibold text-gray-900">{usuario.name}</td><td className="px-5 py-4">{usuario.email}</td><td className="px-5 py-4">{usuario.roles.map((rol) => rol.name).join(", ") || "Sin rol"}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => { setUsuarioContrasena(usuario); setMensaje(""); }} className="inline-flex h-9 w-9 items-center justify-center border border-[#8e2329] text-[#8e2329]" title="Cambiar contraseña"><KeyRound className="h-4 w-4" /><span className="sr-only">Cambiar contraseña</span></button><button type="button" onClick={() => void eliminar(usuario)} disabled={guardando} className="inline-flex h-9 w-9 items-center justify-center border border-red-700 text-red-700 disabled:opacity-50" title="Eliminar usuario"><Trash2 className="h-4 w-4" /><span className="sr-only">Eliminar usuario</span></button></div></td></tr>)}{!usuarios.length && <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-500">No hay usuarios para este filtro.</td></tr>}</tbody></table></div>}</section></div>{usuarioContrasena && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><form onSubmit={actualizarContrasena} className="w-full max-w-md border border-gray-200 bg-white p-6 shadow-xl"><h2 className="text-lg font-bold text-[#8e2329]">Cambiar contraseña</h2><p className="mt-1 text-sm text-gray-600">{usuarioContrasena.name}</p><label className="mt-5 block text-sm font-semibold text-gray-700">Nueva contraseña<input type="password" value={nuevaContrasena} onChange={(event) => setNuevaContrasena(event.target.value)} className="mt-2 w-full border border-gray-300 px-3 py-2.5" /></label><label className="mt-4 block text-sm font-semibold text-gray-700">Confirmar contraseña<input type="password" value={confirmacion} onChange={(event) => setConfirmacion(event.target.value)} className="mt-2 w-full border border-gray-300 px-3 py-2.5" /></label><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setUsuarioContrasena(null)} className="border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">Cancelar</button><button type="submit" disabled={guardando} className="bg-[#8e2329] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Guardar contraseña</button></div></form></div>}</div></main>;
}
