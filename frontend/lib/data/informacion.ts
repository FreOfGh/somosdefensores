// Información de contacto y redes sociales

import { FaFacebook, FaInstagram, FaWhatsapp, FaXTwitter } from "react-icons/fa6";

const informacionContactoDesarrollador = [
  {
    nombre: "Simón Torres Saldarriaga",
    valor: "sitorress@unal.edu.co",
    whatsapp: "https://wa.me/573127355474",
  }
];
const contactoInstitucional = {
  direccion: "Transversal 26B # 40A-86, barrio La Soledad, Bogotá D.C. - Colombia",
  telefonos: "(057 1) 2814010 - 2813048",
  correos: [
    "proteccion@somosdefensores.org",
    "responsablesistema@somosdefensores.org",
    "comunicaciones@somosdefensores.org",
  ],
};
const politicasInstitucionales = [
  { nombre: "Política de privacidad", href: "/politicas#privacidad" },
  { nombre: "Tratamiento de datos personales", href: "/politicas#tratamiento-de-datos" },
  { nombre: "Términos de uso", href: "/politicas#terminos-de-uso" },
];
const redesSocialesSomosDefensores = [
  {
    nombre: "Facebook",
    url: "https://www.facebook.com/somosdef",
  },
  {
    nombre: "X",
    url: "https://x.com/SomosDef",
  },
  {
    nombre: "Instagram",
    url: "https://www.instagram.com/somosdefensores/",
  }
];

const metaDataSeccionFormularios = {
  title: "Formulario de registro de casos",
  description: "Formulario para registrar casos de ayuda humanitaria, pasantía y protección colectiva.",
  keywords: "formulario, registro, casos, ayuda humanitaria, pasantía, protección colectiva",
};

const metaDataAdministrador = {
  title: "Administrador de casos",
  description: "Panel de administración para gestionar casos de ayuda humanitaria, pasantía y protección colectiva.",
  keywords: "administrador, panel, gestión, casos, ayuda humanitaria, pasantía, protección colectiva",
};
const iconosRedes = {
  Facebook: FaFacebook,
  X: FaXTwitter,
  Instagram: FaInstagram,
  Whatsapp: FaWhatsapp,
};

const slidesHero= [
  {
    id: 1,
    image: '/hero1.jpeg',
    title: 'Consulta',
    subtitle: 'Pública',
    desc: 'Accede en tiempo real a las métricas disponibles, con reportes dinámicos y mapas de calor.'
  },
  {
    id: 2,
    image: '/hero2.jpeg',
    title: 'Campaña',
    subtitle: 'imprescindibles.',
    desc: '.'
  },
  {
    id: 3,
    image: '/hero3.jpeg',
    title: 'El derecho a',
    subtitle: 'Defender derechos',
    desc: 'Para la protección de los defensores de derechos humanos dentro de su labor.'
  }
];

export { contactoInstitucional, informacionContactoDesarrollador, metaDataSeccionFormularios, politicasInstitucionales, redesSocialesSomosDefensores, slidesHero, iconosRedes, metaDataAdministrador };