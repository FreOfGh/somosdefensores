export interface AyudaHumanitaria {
  id: string;
  nombre_victima: string;
  apellido_victima: string;
  numero_identificacion: string;
  correo_victima: string;
  numero_whatsapp: string | null;
  estado: string;
  token: string;
  pago_unico: string;
  created_at: string;
  updated_at: string;
}
