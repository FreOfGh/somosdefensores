export interface FormularioProteccionIndividual {
  fecha_remision: string;

  nombre_apellidos: string;
  tipo_documento: string;
  cedula: string;
  edad: string;
  genero: string;

  telefono: string;
  correo: string;
  grupo_etnico: string;
  tipo_liderazgo: string;
  tipo_liderazgo_otro: string;

  tiene_discapacidad: string;
  cual_discapacidad: string;

  tiene_condicion_salud: string;
  cual_condicion_salud: string;

  procedencia_departamento: string;
  procedencia_municipio: string;
  procedencia_vereda_comunidad: string;
  procedencia_resguardo: string;

  residencia_departamento: string;
  residencia_municipio: string;
  residencia_vereda_comunidad: string;
  residencia_resguardo: string;

  nombre_organizacion: string;

  organizacion_remite: string;
  persona_organizacion_nombre: string;
  persona_organizacion_correo: string;
  persona_organizacion_celular: string;

  motivo_solicitud: string;
  tipo_pasantia: string;

  estado_civil: string;
  otra_composicion_familiar: string;

  tiene_hijos: string;
  numero_hijos: string;
  edades_hijos: string;

  personas_conviven: string;
  total_grupo_familiar: string;

  fecha_lugar_descripcion_caso: string;

  riesgo_motivos_amenaza: string;
  agresiones: string;

}

export interface Agresion {
  fecha_ocurrencia: string;
  departamento: string;
  municipio: string;
  vereda_comunidad: string;
  resguardo: string;
  modalidad: string;
  descripcion: string;
  motivos: string;
  presunto_responsable: string;
}

export interface DocumentosAdjuntos {
  certificacion_cuenta_bancaria: File | null;
  documento_identidad: File | null;
  carta_organizacion: File | null;
  carta_aceptacion_pasantia: File | null;

  evidencias_soportes: File[];

  denuncias_organismos_estado: File[];

  otros_documentos: File[];

}

export const formularioProteccionIndividualInicial: FormularioProteccionIndividual = {
  fecha_remision: "",

  nombre_apellidos: "",
  tipo_documento: "",
  cedula: "",
  edad: "",
  genero: "",

  telefono: "",
  correo: "",
  grupo_etnico: "",
  tipo_liderazgo: "",
  tipo_liderazgo_otro: "",

  tiene_discapacidad: "",
  cual_discapacidad: "",

  tiene_condicion_salud: "",
  cual_condicion_salud: "",

  procedencia_departamento: "",
  procedencia_municipio: "",
  procedencia_vereda_comunidad: "",
  procedencia_resguardo: "",

  residencia_departamento: "",
  residencia_municipio: "",
  residencia_vereda_comunidad: "",
  residencia_resguardo: "",

  nombre_organizacion: "",

  organizacion_remite: "",
  persona_organizacion_nombre: "",
  persona_organizacion_correo: "",
  persona_organizacion_celular: "",

  motivo_solicitud: "",
  tipo_pasantia: "",

  estado_civil: "",
  otra_composicion_familiar: "",

  tiene_hijos: "",
  numero_hijos: "",
  edades_hijos: "",

  personas_conviven: "",
  total_grupo_familiar: "",

  fecha_lugar_descripcion_caso: "",

  riesgo_motivos_amenaza: "",
  agresiones: "[]",

};

export const documentosProteccionIndividualIniciales: DocumentosAdjuntos = {
  certificacion_cuenta_bancaria: null,
  documento_identidad: null,
  carta_organizacion: null,
  carta_aceptacion_pasantia: null,

  evidencias_soportes: [],

  denuncias_organismos_estado: [],

  otros_documentos: [],

};
