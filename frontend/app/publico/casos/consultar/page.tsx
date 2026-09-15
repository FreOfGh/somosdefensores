"use client";

import { useState } from "react";

export default function ConsultarCaso() {
  const [numero, setNumero] = useState("");
  const [estado, setEstado] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const consultarCaso = async () => {
    if (!numero.trim()) {
      setError("Ingrese el número de identificación.");
      return;
    }

    setLoading(true);
    setError("");
    setEstado("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/publico/casos/estado/${encodeURIComponent(numero)}`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudo consultar el caso.");
        return;
      }

      setEstado(data.estado);
    } catch (error) {
      console.error(error);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">
        Consultar estado del caso
      </h1>

      <p className="text-gray-500 mb-6">
        Ingrese su número de identificación.
      </p>

      <input
        type="text"
        value={numero}
        onChange={(e) => setNumero(e.target.value)}
        placeholder="Número de identificación"
        className="w-full border rounded-lg px-4 py-3 mb-4"
      />

      <button
        onClick={consultarCaso}
        disabled={loading}
        className="w-full bg-blue-600 text-white rounded-lg px-4 py-3"
      >
        {loading ? "Consultando..." : "Consultar caso"}
      </button>

      {error && (
        <div className="mt-4 bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {estado && (
        <div className="mt-4 bg-green-100 text-green-700 p-4 rounded-lg">
          <strong>Estado del caso:</strong>
          <p className="mt-1">{estado}</p>
        </div>
      )}
    </div>
  );
}