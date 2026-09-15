"use client";

import { useEffect, useState } from "react";
import { Metricas } from "@/types/home/metricas.types";
import { getDashboardStats } from "@/services/home/metricas.service";

export function useDashboardStats() {
  const [data, setData] = useState<Metricas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      setError(null);

      const result = await getDashboardStats();

      if (!result) {
        setError("No se pudieron obtener las estadísticas");
      }

      setData(result);
      setLoading(false);
    }

    loadStats();
  }, []);

  return {
    data,
    loading,
    error,
  };
}