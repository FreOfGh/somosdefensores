"use client";

import { FormEvent, useState } from "react";

interface FormData {
  nombre_victima: string;
  apellido_victima: string;
  numero_identificacion: string;
  correo_victima: string;
  numero_whatsapp: string;
}

export default function AgregarCasoForm() {
  const [formData, setFormData] = useState<FormData>({
    nombre_victima: "",
    apellido_victima: "",
    numero_identificacion: "",
    correo_victima: "",
    numero_whatsapp: "",
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo al modificarlo
    if (errors[name]) {
      setErrors((prev) => {
        const nuevosErrores = { ...prev };
        delete nuevosErrores[name];
        return nuevosErrores;
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setMensaje("");
    setErrors({});

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/publico/casos/crear`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422) {
          setErrors(data.errors || {});
        } else {
          setMensaje(
            data.message || "Ocurrió un error al registrar el caso."
          );
        }

        return;
      }

      setMensaje("Caso agregado exitosamente.");

      // Limpiar formulario
      setFormData({
        nombre_victima: "",
        apellido_victima: "",
        numero_identificacion: "",
        correo_victima: "",
        numero_whatsapp: "",
      });
    } catch (error) {
      console.error(error);
      setMensaje(
        "No se pudo conectar con el servidor."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Registrar caso
        </h1>

        <p className="text-gray-500 mb-6">
          Complete la información de la víctima.
        </p>

        {mensaje && (
          <div className="mb-6 rounded-lg bg-green-100 p-4 text-green-700">
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Nombre */}
          <div>
            <label
              htmlFor="nombre_victima"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre de la víctima *
            </label>

            <input
              id="nombre_victima"
              name="nombre_victima"
              type="text"
              value={formData.nombre_victima}
              onChange={handleChange}
              required
              maxLength={255}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Ingrese el nombre"
            />

            {errors.nombre_victima && (
              <p className="mt-1 text-sm text-red-600">
                {errors.nombre_victima[0]}
              </p>
            )}
          </div>

          {/* Apellido */}
          <div>
            <label
              htmlFor="apellido_victima"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Apellido de la víctima *
            </label>

            <input
              id="apellido_victima"
              name="apellido_victima"
              type="text"
              value={formData.apellido_victima}
              onChange={handleChange}
              required
              maxLength={255}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Ingrese el apellido"
            />

            {errors.apellido_victima && (
              <p className="mt-1 text-sm text-red-600">
                {errors.apellido_victima[0]}
              </p>
            )}
          </div>

          {/* Identificación */}
          <div>
            <label
              htmlFor="numero_identificacion"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Número de identificación *
            </label>

            <input
              id="numero_identificacion"
              name="numero_identificacion"
              type="text"
              value={formData.numero_identificacion}
              onChange={handleChange}
              required
              maxLength={255}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Ingrese el número de identificación"
            />

            {errors.numero_identificacion && (
              <p className="mt-1 text-sm text-red-600">
                {errors.numero_identificacion[0]}
              </p>
            )}
          </div>

          {/* Correo */}
          <div>
            <label
              htmlFor="correo_victima"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Correo electrónico *
            </label>

            <input
              id="correo_victima"
              name="correo_victima"
              type="email"
              value={formData.correo_victima}
              onChange={handleChange}
              required
              maxLength={255}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="ejemplo@correo.com"
            />

            {errors.correo_victima && (
              <p className="mt-1 text-sm text-red-600">
                {errors.correo_victima[0]}
              </p>
            )}
          </div>

          {/* WhatsApp */}
          <div>
            <label
              htmlFor="numero_whatsapp"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Número de WhatsApp
            </label>

            <input
              id="numero_whatsapp"
              name="numero_whatsapp"
              type="tel"
              value={formData.numero_whatsapp}
              onChange={handleChange}
              maxLength={20}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="3001234567"
            />

            <p className="mt-1 text-xs text-gray-500">
              Este campo es opcional.
            </p>

            {errors.numero_whatsapp && (
              <p className="mt-1 text-sm text-red-600">
                {errors.numero_whatsapp[0]}
              </p>
            )}
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? "Registrando..." : "Registrar caso"}
          </button>
        </form>
      </div>
    </div>
  );
}