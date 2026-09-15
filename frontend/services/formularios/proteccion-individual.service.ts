import {
  DocumentosAdjuntos,
  FormularioProteccionIndividual,
} from "@/types/formularios/proteccion-individual.types";

type TipoCasoIndividual = "ayuda_humanitaria" | "pasantia";

export async function enviarProteccionIndividual(
  formulario: FormularioProteccionIndividual,
  documentos: DocumentosAdjuntos,
  tipoCaso: TipoCasoIndividual
): Promise<void> {
  const formData = new FormData();

  Object.entries(formulario).forEach(([campo, valor]) => {
    formData.append(campo, valor);
  });

  if (documentos.certificacion_cuenta_bancaria) {
    formData.append(
      "certificacion_cuenta_bancaria",
      documentos.certificacion_cuenta_bancaria
    );
  }

  if (documentos.documento_identidad) {
    formData.append("documento_identidad", documentos.documento_identidad);
  }

  if (documentos.carta_organizacion) {
    formData.append("carta_organizacion", documentos.carta_organizacion);
  }

  if (documentos.carta_aceptacion_pasantia) {
    formData.append("carta_aceptacion_pasantia", documentos.carta_aceptacion_pasantia);
  }

  documentos.evidencias_soportes.forEach((archivo) =>
    formData.append("evidencias_soportes[]", archivo)
  );

  documentos.denuncias_organismos_estado.forEach((archivo) =>
    formData.append("denuncias_organismos_estado[]", archivo)
  );

  documentos.otros_documentos.forEach((archivo) =>
    formData.append("otros_documentos[]", archivo)
  );

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/publico/casos/${tipoCaso}/agregar`,
    {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData,
    }
  );

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const errors = payload?.errors as Record<string, string[]> | undefined;
    const firstError = errors && Object.values(errors)[0]?.[0];

    throw new Error(firstError ?? payload?.message ?? "No fue posible enviar la solicitud.");
  }
}
