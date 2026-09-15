import { Metricas } from "@/types/home/metricas.types";

export async function getDashboardStats(): Promise<Metricas | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/publico/home/metricas`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error obteniendo las estadísticas");
    }

    const json = await response.json();

    if (!Array.isArray(json) || json.length === 0) {
      return null;
    }

    return json[0];
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    return null;
  }
}