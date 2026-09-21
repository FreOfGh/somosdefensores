"use client";

import { useEffect, useState } from "react";

export type OpcionCatalogo = {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  departamento_id?: string;
};

export function useCatalogo(catalogo: string, enabled = true) {
  const [opciones, setOpciones] = useState<OpcionCatalogo[]>([]);
  const [cargando, setCargando] = useState(enabled);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const controller = new AbortController();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

    void Promise.resolve().then(() => fetch(`${apiUrl}/api/publico/catalogos/${catalogo}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    }))
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message ?? "No se pudo cargar el catálogo.");
        return data as OpcionCatalogo[];
      })
      .then((data) => setOpciones(Array.isArray(data) ? data : []))
      .catch((requestError: Error) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => setCargando(false));

    return () => controller.abort();
  }, [catalogo, enabled]);

  return { opciones, cargando, error };
}

export function useUbicaciones(departamentoId: string) {
  const departamentos = useCatalogoGeografico("departamentos");
  const municipios = useCatalogoGeografico(
    departamentoId ? `departamentos/${departamentoId}/municipios` : "",
    Boolean(departamentoId),
  );

  return { departamentos, municipios };
}

export function useMunicipiosCatalogo() {
  return useCatalogoGeografico("municipios");
}

function useCatalogoGeografico(recurso: string, enabled = true) {
  const [opciones, setOpciones] = useState<OpcionCatalogo[]>([]);
  const [cargando, setCargando] = useState(enabled);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const controller = new AbortController();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
    void Promise.resolve().then(() => fetch(`${apiUrl}/api/publico/catalogos/${recurso}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    }))
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message ?? "No se pudo cargar la ubicación.");
        return data as OpcionCatalogo[];
      })
      .then((data) => setOpciones(Array.isArray(data) ? data : []))
      .catch((requestError: Error) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => setCargando(false));

    return () => controller.abort();
  }, [recurso, enabled]);

  return { opciones, cargando, error };
}
