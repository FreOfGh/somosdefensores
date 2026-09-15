// el logo esta enla carpeta public del proyecto, se puede cambiar por cualquier otro logo que se desee

const adminNavItems = [
  { name: "Ayuda humanitaria", href: "/admin/ayuda_humanitaria", id:"ayuda_humanitaria" },
  { name: "Pasantía", href: "/admin/pasantias", id:"pasantia" },
  { name: "Protección colectiva", href: "/admin/proteccion_colectiva", id:"proteccion_colectiva" },
  { name: "Usuarios", href: "/admin/usuarios", id:"usuarios" },
];

const navFormulario= [
  { name: "Formulario de ayuda humanitaria", href: "/publico/casos/formulario/ayuda_humanitaria", id:"ayuda_humanitaria", descripcion:"Formulario para solicitar ayuda humanitaria en situaciones de emergencia o crisis." },
  { name: "Formulario de pasantía", href: "/publico/casos/formulario/pasantia", id:"pasantia", descripcion:"Formulario para solicitar una pasantía en la organización." },
  { name: "Formulario de protección colectiva", href: "/publico/casos/formulario/proteccion_colectiva", id:"proteccion_colectiva", descripcion:"Formulario para solicitar protección colectiva." },
]

const navItems: Array<{ name: string; href: string }> = [];

const branding= {
    "logo": "/logo.png",
}
export { adminNavItems, navItems, branding, navFormulario }
