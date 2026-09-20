// el logo esta enla carpeta public del proyecto, se puede cambiar por cualquier otro logo que se desee

import { Database, Home, Map, FilePlus2 } from "lucide-react";

const adminNavItems = [
  { name: "Ayuda humanitaria", href: "/admin/ayuda_humanitaria", id:"ayuda_humanitaria" },
  { name: "Pasantía", href: "/admin/pasantias", id:"pasantia" },
  { name: "Protección colectiva", href: "/admin/proteccion_colectiva", id:"proteccion_colectiva" },
  { name: "Usuarios", href: "/admin/usuarios", id:"usuarios" },
];

  const navLinks = [
    { name: "Inicio", href: "/", icon: Home },
    { name: "Fuente pública de datos", href: "/reportes", icon: Database },
    { name: "Reporte geográfico de casos", href: "/geografia-publica", icon: Map },
    { name: "Ingresa tu caso", href: "/formularios", icon: FilePlus2 },
];


const navItems: Array<{ name: string; href: string }> = [];

const branding= {
    "logo": "/logo.png",
    "navbar": "/navbar.jpg"
}

const homeHeroSlides = [
  {
    image: "/hero-consulta.svg",
    eyebrow: "Información pública",
    title: "Conocer para proteger",
    description: "Consulta datos y reportes que ayudan a comprender las realidades de quienes defienden los derechos humanos.",
  },
  {
    image: "/hero-acompanamiento.svg",
    eyebrow: "Acompañamiento",
    title: "Nadie defiende en soledad",
    description: "Conectamos historias, solicitudes y rutas de atención para fortalecer respuestas oportunas.",
  },
  {
    image: "/hero-comunidad.svg",
    eyebrow: "Acción colectiva",
    title: "La defensa es un derecho",
    description: "Registra tu caso y haz visible la realidad de las comunidades que sostienen la vida y la democracia.",
  },
] as const;

const impactMap = "/mapa-colombia.svg";

const publicReportsSection = {
  image: "/reportes-publicos.svg",
  href: "/reportes",
  eyebrow: "Datos abiertos",
  title: "Accede a nuestros reportes públicos en tiempo real",
  description: "Explora información actualizada sobre los casos registrados, sus tendencias y su distribución territorial. Una herramienta para consultar, comprender y tomar decisiones informadas.",
} as const;

const formOptions = [
  {
    id: "ayuda_humanitaria",
    title: "Ayuda humanitaria",
    description: "Solicita apoyo frente a situaciones que afectan tu vida, integridad o labor de defensa de derechos humanos.",
    href: "/publico/casos/formulario/ayuda_humanitaria",
  },
  {
    id: "pasantia",
    title: "Pasantía",
    description: "Registra una solicitud de pasantía y comparte la información necesaria para iniciar el proceso.",
    href: "/publico/casos/formulario/pasantia",
  },
  {
    id: "proteccion_colectiva",
    title: "Protección colectiva",
    description: "Solicita medidas de protección para una organización, colectivo o comunidad.",
    href: "/publico/casos/formulario/proteccion_colectiva",
  },
] as const;

export { adminNavItems, navItems, branding, navLinks, homeHeroSlides, impactMap, publicReportsSection, formOptions }
