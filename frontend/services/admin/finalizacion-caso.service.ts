export type TipoFinalizacionCaso = "ayuda_humanitaria" | "pasantia" | "proteccion_colectiva";
import { adminFetch } from "@/lib/api/admin-fetch";

export async function enviarInvitacionFinalizacion(tipo: TipoFinalizacionCaso, casoId: string): Promise<void> {
  const response = await adminFetch(`/api/revision/casos/${tipo}/${casoId}/finalizacion`, { method: "POST" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No fue posible enviar la invitación de finalización.");
}