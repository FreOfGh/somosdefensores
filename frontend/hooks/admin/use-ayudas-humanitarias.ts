"use client";

import { useCallback, useEffect, useState } from "react";
import { AyudaHumanitaria } from "@/types/admin/ayuda-humanitaria.types";
import { listarAyudasHumanitarias } from "@/services/admin/ayuda-humanitaria.service";

export function useAyudasHumanitarias() {
  const [ayudas, setAyudas] = useState<AyudaHumanitaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const obtenerAyudas = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setAyudas(await listarAyudasHumanitarias());
    } catch (error) {
      console.error(error);
      setError("No fue posible cargar las solicitudes de ayuda humanitaria.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    obtenerAyudas();
  }, [obtenerAyudas]);

  return { ayudas, loading, error, obtenerAyudas };
}
