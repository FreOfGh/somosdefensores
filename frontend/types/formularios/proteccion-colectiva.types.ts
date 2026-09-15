export interface FormularioProteccionColectiva {
  fecha_remision_caso: string;
  tiene_personeria_juridica: string;
  rut: string;

  nombre_organizacion: string;

  representante_nombre: string;
  representante_apellido: string;
  representante_tipo: string;

  cedula: string;
  telefono: string;
  correo: string;

  departamento: string;
  municipio: string;
  vereda: string;

  descripcion_organizacion: string;
  estructura_organizacion: string;
  reivindicaciones: string;
  derechos_defiende: string;
  trabajos_realiza: string;

  riesgos_seguridad: string;
  incidentes: string;
  afectacion_trabajo: string;
  actores_riesgo: string;

  medidas_proteccion: string;
  justificacion_medidas: string;

  informacion_adicional: string;
}

export const formularioProteccionColectivaInicial: FormularioProteccionColectiva = {
  fecha_remision_caso: "",
  tiene_personeria_juridica: "",
  rut: "",

  nombre_organizacion: "",

  representante_nombre: "",
  representante_apellido: "",
  representante_tipo: "",

  cedula: "",
  telefono: "",
  correo: "",

  departamento: "",
  municipio: "",
  vereda: "",

  descripcion_organizacion: "",
  estructura_organizacion: "",
  reivindicaciones: "",
  derechos_defiende: "",
  trabajos_realiza: "",

  riesgos_seguridad: "",
  incidentes: "",
  afectacion_trabajo: "",
  actores_riesgo: "",

  medidas_proteccion: "",
  justificacion_medidas: "",

  informacion_adicional: "",
};
