import { FormularioProteccionColectiva } from "@/types/formularios/proteccion-colectiva.types";

export async function enviarProteccionColectiva(
  formulario: FormularioProteccionColectiva
): Promise<void> {
  const payload = {
    ...formulario,
    tiene_personeria_juridica: formulario.tiene_personeria_juridica === "1",
  };

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/publico/casos/proteccion_colectiva/agregar`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("No fue posible enviar el formulario.");
  }
}
