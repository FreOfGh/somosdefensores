import { AyudaHumanitaria } from "@/types/admin/ayuda-humanitaria.types";
import { adminFetch } from "@/lib/api/admin-fetch";

export async function listarAyudasHumanitarias(): Promise<AyudaHumanitaria[]> {
  const response = await adminFetch("/api/admin/listar/humanitaria", { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Error al obtener las ayudas humanitarias");
  }

  return response.json();
}
