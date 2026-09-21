"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { KeyRound, Pencil, RefreshCw, Trash2, UserPlus } from "lucide-react";
import { adminFetch } from "@/lib/api/admin-fetch";

type Role = "validador" | "revisor";
type User = { id: string; name: string; email: string; roles: Array<{ name: string }> };
type FormState = { name: string; email: string; password: string; password_confirmation: string; rol: Role };
type CatalogForm = { catalogo: string; codigo: string; nombre: string; descripcion: string };
type CatalogOption = CatalogForm & { id: string; activo: boolean };

const emptyForm: FormState = {
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  rol: "revisor",
};

const catalogOptions = [
  ["catalogo_tipos_documento", "Tipos de documento"],
  ["catalogo_generos", "Géneros"],
  ["catalogo_grupos_poblacionales", "Grupos poblacionales"],
  ["catalogo_tipo_liderazgo", "Tipos de liderazgo"],
  ["catalogo_modalidades_agresion", "Modalidades de agresión"],
  ["catalogo_estados_civiles", "Estados civiles"],
  ["catalogo_parentescos", "Parentescos"],
  ["catalogo_tipo_pasantia", "Tipos de pasantía"],
  ["catalogo_tipo_representante", "Tipos de representante"],
  ["catalogo_respuestas_binarias", "Respuestas binarias"],
] as const;

async function errorMessage(response: Response, fallback: string) {
  const data: { message?: string; errors?: Record<string, string[]> } = await response.json().catch(() => ({}));
  return data.errors ? Object.values(data.errors)[0]?.[0] ?? fallback : data.message ?? fallback;
}

export default function GestionUsuariosPage() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<User | null>(null);
  const [emailConfirmation, setEmailConfirmation] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"usuarios" | "catalogos">(() => searchParams.get("tab") === "catalogos" ? "catalogos" : "usuarios");
  const [catalogForm, setCatalogForm] = useState<CatalogForm>({ catalogo: catalogOptions[0][0], codigo: "", nombre: "", descripcion: "" });
  const [catalogRows, setCatalogRows] = useState<CatalogOption[]>([]);
  const [editingCatalog, setEditingCatalog] = useState<CatalogOption | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    const response = await adminFetch("/api/admin/gestion-usuarios", { cache: "no-store" });
    if (response.ok) setUsers(await response.json());
    else setMessage(await errorMessage(response, "No fue posible cargar los usuarios."));
    setLoading(false);
  };

  useEffect(() => {
    void Promise.resolve().then(loadUsers);
  }, []);

  useEffect(() => {
    if (tab !== "catalogos") return;
    void adminFetch(`/api/admin/gestion-usuarios/catalogos/opciones?catalogo=${encodeURIComponent(catalogForm.catalogo)}`)
      .then(async (response) => { if (response.ok) setCatalogRows(await response.json()); })
      .catch(() => setMessage("No fue posible cargar las opciones del catálogo."));
  }, [tab, catalogForm.catalogo]);

  const saveUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing && (form.password.length < 8 || form.password !== form.password_confirmation)) {
      setMessage(form.password.length < 8 ? "La contraseña debe tener al menos 8 caracteres." : "Las contraseñas no coinciden.");
      return;
    }

    setSaving(true);
    setMessage("");
    const endpoint = editing ? `/api/admin/gestion-usuarios/${editing.id}` : "/api/admin/gestion-usuarios/crear";
    const response = await adminFetch(endpoint, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing ? { name: form.name, email: form.email, rol: form.rol } : form),
    });

    if (!response.ok) {
      setMessage(await errorMessage(response, "No fue posible guardar el usuario."));
    } else {
      setMessage(editing ? "Usuario actualizado correctamente." : "Usuario creado correctamente.");
      setForm(emptyForm);
      setEditing(null);
      await loadUsers();
    }
    setSaving(false);
  };

  const changeUserPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!passwordTarget) return;
    if (newPassword.length < 8 || newPassword !== passwordConfirmation) {
      setMessage(newPassword.length < 8 ? "La contraseña debe tener al menos 8 caracteres." : "Las contraseñas no coinciden.");
      return;
    }

    setSaving(true);
    const response = await adminFetch(`/api/admin/gestion-usuarios/${passwordTarget.id}/contrasena`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword, password_confirmation: passwordConfirmation }),
    });

    if (!response.ok) {
      setMessage(await errorMessage(response, "No fue posible cambiar la contraseña."));
    } else {
      setMessage("Contraseña actualizada correctamente.");
      setPasswordTarget(null);
      setNewPassword("");
      setPasswordConfirmation("");
    }
    setSaving(false);
  };

  const deleteUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!deleteTarget) return;

    setSaving(true);
    const response = await adminFetch(`/api/admin/gestion-usuarios/${deleteTarget.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email_confirmation: emailConfirmation }),
    });

    if (!response.ok) {
      setMessage(await errorMessage(response, "No fue posible eliminar el usuario."));
    } else {
      setMessage("Usuario eliminado correctamente.");
      setDeleteTarget(null);
      setEmailConfirmation("");
      await loadUsers();
    }
    setSaving(false);
  };

  const addCatalogOption = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const response = await adminFetch(editingCatalog ? `/api/admin/gestion-usuarios/catalogos/opciones/${editingCatalog.id}` : "/api/admin/gestion-usuarios/catalogos/opciones", {
      method: editingCatalog ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingCatalog ? { ...catalogForm, activo: true } : catalogForm),
    });
    if (!response.ok) {
      setMessage(await errorMessage(response, "No fue posible agregar la opción."));
    } else {
      setMessage(editingCatalog ? "Opción actualizada correctamente." : "Opción agregada al catálogo correctamente.");
      setCatalogForm({ ...catalogForm, codigo: "", nombre: "", descripcion: "" });
      setEditingCatalog(null);
      const refreshed = await adminFetch(`/api/admin/gestion-usuarios/catalogos/opciones?catalogo=${encodeURIComponent(catalogForm.catalogo)}`);
      if (refreshed.ok) setCatalogRows(await refreshed.json());
    }
    setSaving(false);
  };

  const deleteCatalogOption = async (option: CatalogOption) => {
    if (!window.confirm(`¿Eliminar la opción ${option.nombre}?`)) return;
    const response = await adminFetch(`/api/admin/gestion-usuarios/catalogos/opciones/${option.id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ catalogo: catalogForm.catalogo }) });
    setMessage(response.ok ? "Opción eliminada correctamente." : await errorMessage(response, "No fue posible eliminar la opción."));
    if (response.ok) setCatalogRows((current) => current.filter((item) => item.id !== option.id));
  };

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#8e2329]">Gestión de usuarios</h1>
            <p className="mt-1 text-gray-600">Área exclusiva para el superusuario.</p>
          </div>
          <button type="button" onClick={() => void loadUsers()} className="inline-flex h-10 w-10 items-center justify-center border border-[#8e2329] text-[#8e2329]" title="Actualizar usuarios">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Actualizar usuarios</span>
          </button>
        </header>

        {message && <p className="mb-5 border-l-4 border-[#8e2329] bg-red-50 p-4 text-sm text-slate-800">{message}</p>}

        <div className="mb-6 flex gap-2 border-b border-gray-300">
          <button type="button" onClick={() => setTab("usuarios")} className={`border-b-2 px-4 py-3 text-sm font-semibold ${tab === "usuarios" ? "border-[#8e2329] text-[#8e2329]" : "border-transparent text-gray-600"}`}>Usuarios</button>
          <button type="button" onClick={() => setTab("catalogos")} className={`border-b-2 px-4 py-3 text-sm font-semibold ${tab === "catalogos" ? "border-[#8e2329] text-[#8e2329]" : "border-transparent text-gray-600"}`}>Catálogos</button>
        </div>

        {tab === "catalogos" ? <><form onSubmit={addCatalogOption} className="max-w-2xl space-y-5 border border-gray-200 bg-white p-6 shadow-sm"><div><h2 className="text-lg font-bold text-[#8e2329]">{editingCatalog ? "Editar opción del catálogo" : "Agregar opción a un catálogo"}</h2><p className="mt-1 text-sm text-gray-600">La opción quedará disponible para los formularios que consultan este catálogo.</p></div><label className="block text-sm font-semibold text-gray-700">Catálogo<select disabled={Boolean(editingCatalog)} value={catalogForm.catalogo} onChange={(event) => setCatalogForm({ ...catalogForm, catalogo: event.target.value })} className="mt-2 w-full border border-gray-300 px-3 py-2.5 text-gray-900">{catalogOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="block text-sm font-semibold text-gray-700">Código<input required value={catalogForm.codigo} onChange={(event) => setCatalogForm({ ...catalogForm, codigo: event.target.value })} placeholder="Ejemplo: NUEVA_OPCION" className="mt-2 w-full border border-gray-300 px-3 py-2.5 text-gray-900" /></label><label className="block text-sm font-semibold text-gray-700">Nombre visible<input required value={catalogForm.nombre} onChange={(event) => setCatalogForm({ ...catalogForm, nombre: event.target.value })} placeholder="Nombre que verá la persona usuaria" className="mt-2 w-full border border-gray-300 px-3 py-2.5 text-gray-900" /></label><label className="block text-sm font-semibold text-gray-700">Descripción<input value={catalogForm.descripcion} onChange={(event) => setCatalogForm({ ...catalogForm, descripcion: event.target.value })} placeholder="Descripción opcional" className="mt-2 w-full border border-gray-300 px-3 py-2.5 text-gray-900" /></label><div className="flex gap-2"><button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-[#8e2329] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><Pencil size={16} aria-hidden="true" />{editingCatalog ? "Guardar cambios" : "Agregar opción"}</button>{editingCatalog && <button type="button" onClick={() => { setEditingCatalog(null); setCatalogForm({ ...catalogForm, codigo: "", nombre: "", descripcion: "" }); }} className="border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700">Cancelar</button>}</div></form><section className="mt-6 max-w-5xl border border-gray-200 bg-white shadow-sm"><header className="border-b border-gray-200 p-5"><h2 className="font-bold text-gray-900">Opciones registradas</h2></header><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-[#92212a] text-white"><tr><th className="px-5 py-3">Código</th><th className="px-5 py-3">Nombre</th><th className="px-5 py-3">Descripción</th><th className="px-5 py-3 text-right">Acciones</th></tr></thead><tbody className="divide-y divide-gray-200">{catalogRows.map((option) => <tr key={option.id}><td className="px-5 py-4 font-mono text-xs">{option.codigo}</td><td className="px-5 py-4 font-semibold">{option.nombre}</td><td className="px-5 py-4 text-gray-600">{option.descripcion || "-"}</td><td className="px-5 py-4 text-right"><button type="button" onClick={() => { setEditingCatalog(option); setCatalogForm({ catalogo: catalogForm.catalogo, codigo: option.codigo, nombre: option.nombre, descripcion: option.descripcion || "" }); }} className="mr-2 text-[#8e2329]" title="Editar opción"><Pencil size={16} /></button><button type="button" onClick={() => void deleteCatalogOption(option)} className="text-red-700" title="Eliminar opción"><Trash2 size={16} /></button></td></tr>)}{!catalogRows.length && <tr><td colSpan={4} className="p-10 text-center text-gray-500">No hay opciones en este catálogo.</td></tr>}</tbody></table></div></section></> : <div className="grid gap-8 lg:grid-cols-[22rem_1fr]">
          <form onSubmit={saveUser} className="space-y-4 border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#8e2329]">{editing ? "Editar usuario" : "Crear usuario"}</h2>
            {([['name', 'Nombre completo', 'text'], ['email', 'Correo electrónico', 'email']] as const).map(([field, label, type]) => (
              <label key={field} className="block text-sm font-semibold text-gray-700">
                {label}
                <input required type={type} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} className="mt-2 w-full border border-gray-300 px-3 py-2.5 text-gray-900" />
              </label>
            ))}
            {!editing && (
              <>
                <label className="block text-sm font-semibold text-gray-700">Contraseña<input required type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-2 w-full border border-gray-300 px-3 py-2.5 text-gray-900" /></label>
                <label className="block text-sm font-semibold text-gray-700">Confirmar contraseña<input required type="password" value={form.password_confirmation} onChange={(event) => setForm({ ...form, password_confirmation: event.target.value })} className="mt-2 w-full border border-gray-300 px-3 py-2.5 text-gray-900" /></label>
              </>
            )}
            <label className="block text-sm font-semibold text-gray-700">
              Rol
              <select value={form.rol} onChange={(event) => setForm({ ...form, rol: event.target.value as Role })} className="mt-2 w-full border border-gray-300 px-3 py-2.5 text-gray-900">
                <option value="revisor">Revisor</option>
                <option value="validador">Validador</option>
              </select>
            </label>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-[#8e2329] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><UserPlus className="h-4 w-4" aria-hidden="true" />{editing ? "Guardar cambios" : "Crear usuario"}</button>
              {editing && <button type="button" onClick={() => { setEditing(null); setForm(emptyForm); }} className="border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700">Cancelar</button>}
            </div>
          </form>

          <section className="border border-gray-200 bg-white shadow-sm">
            <header className="border-b border-gray-200 p-5"><h2 className="font-bold text-gray-900">Usuarios registrados</h2></header>
            {loading ? <p className="p-12 text-center text-sm text-gray-600">Cargando usuarios...</p> : <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-[#92212a] text-white"><tr><th className="px-5 py-3">Nombre</th><th className="px-5 py-3">Correo</th><th className="px-5 py-3">Rol</th><th className="px-5 py-3 text-right">Acciones</th></tr></thead><tbody className="divide-y divide-gray-200">{users.map((user) => <tr key={user.id}><td className="px-5 py-4 font-semibold text-gray-900">{user.name}</td><td className="px-5 py-4">{user.email}</td><td className="px-5 py-4">{user.roles.map((role) => role.name).join(", ")}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => { setEditing(user); setForm({ ...emptyForm, name: user.name, email: user.email, rol: user.roles[0]?.name === "validador" ? "validador" : "revisor" }); }} className="inline-flex h-9 w-9 items-center justify-center border border-[#8e2329] text-[#8e2329]" title="Editar usuario"><Pencil size={16} aria-hidden="true" /><span className="sr-only">Editar usuario</span></button><button type="button" onClick={() => { setPasswordTarget(user); setNewPassword(""); setPasswordConfirmation(""); }} className="inline-flex h-9 w-9 items-center justify-center border border-[#8e2329] text-[#8e2329]" title="Cambiar contraseña"><KeyRound size={16} aria-hidden="true" /><span className="sr-only">Cambiar contraseña</span></button><button type="button" onClick={() => { setDeleteTarget(user); setEmailConfirmation(""); }} className="inline-flex h-9 w-9 items-center justify-center border border-red-700 text-red-700" title="Eliminar usuario"><Trash2 size={16} aria-hidden="true" /><span className="sr-only">Eliminar usuario</span></button></div></td></tr>)}{!users.length && <tr><td colSpan={4} className="p-12 text-center text-gray-500">No hay usuarios registrados.</td></tr>}</tbody></table></div>}
          </section>
        </div>}
      </div>

      {passwordTarget && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><form onSubmit={changeUserPassword} className="w-full max-w-md bg-white p-6 shadow-xl"><h2 className="text-lg font-bold text-[#8e2329]">Cambiar contraseña</h2><p className="mt-2 text-sm text-gray-600">{passwordTarget.name}</p><input required minLength={8} type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Nueva contraseña" className="mt-4 w-full border border-gray-300 px-3 py-2.5 text-gray-900" /><input required minLength={8} type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} placeholder="Confirmar contraseña" className="mt-3 w-full border border-gray-300 px-3 py-2.5 text-gray-900" /><div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setPasswordTarget(null)} className="border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">Cancelar</button><button type="submit" disabled={saving} className="bg-[#8e2329] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Guardar contraseña</button></div></form></div>}
      {deleteTarget && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><form onSubmit={deleteUser} className="w-full max-w-md bg-white p-6 shadow-xl"><h2 className="text-lg font-bold text-red-700">Confirmar eliminación</h2><p className="mt-2 text-sm text-gray-600">Para eliminar a <strong>{deleteTarget.name}</strong>, copia su correo exacto:</p><p className="mt-3 break-all bg-gray-100 p-3 text-sm font-bold text-gray-900">{deleteTarget.email}</p><input required type="email" value={emailConfirmation} onChange={(event) => setEmailConfirmation(event.target.value)} placeholder="Copia aquí el correo" className="mt-4 w-full border border-gray-300 px-3 py-2.5 text-gray-900" /><div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setDeleteTarget(null)} className="border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">Cancelar</button><button type="submit" disabled={saving} className="bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Eliminar usuario</button></div></form></div>}
    </main>
  );
}
