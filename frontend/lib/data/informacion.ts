// Información de contacto y redes sociales

import { FaFacebook, FaInstagram, FaTwitter, FaWhatsapp } from "react-icons/fa6";

const informacionContactoDesarrollador = [
  {
    nombre: "Simón Torres S",
    valor: "sitorress@unal.edu.co",
    whatsapp: "https://wa.me/573127355474",
  }
];
const redesSocialesSomosDefensores = [
  {
    nombre: "Facebook",
    url: "https://www.facebook.com/somosdefensores",
  },
  {
    nombre: "Twitter",
    url: "https://twitter.com/somosdefensores",
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
  Twitter: FaTwitter,
  Instagram: FaInstagram,
  Whatsapp: FaWhatsapp,
};

const slidesHero= [
  {
    id: 1,
    image: '/foto1.jpeg',
    title: 'Consulta',
    subtitle: 'Pública',
    desc: 'Accede en tiempo real a las métricas disponibles, con reportes dinámicos y mapas de calor.'
  },
  {
    id: 2,
    image: '/foto2.jpeg',
    title: 'Campaña',
    subtitle: 'imprescindibles.',
    desc: '.'
  },
  {
    id: 3,
    image: '/foto3.jpeg',
    title: 'El derecho a',
    subtitle: 'Defender derechos',
    desc: 'Para la protección de los defensores de derechos humanos dentro de su labor.'
  }
];

export { informacionContactoDesarrollador,metaDataSeccionFormularios, redesSocialesSomosDefensores, slidesHero, iconosRedes, metaDataAdministrador };