import Link from "next/link";

import {
  informacionContactoDesarrollador,
  redesSocialesSomosDefensores,
  iconosRedes,
} from "@/lib/data/informacion";

import { branding } from "@/lib/data/rutas";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-white transition-colors hover:text-blue-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white">
              <img src={branding.logo} alt="Logo" className="h-10 w-10" />
            </span>
            <span className="text-lg font-bold">Casos Sociales</span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
            Un espacio para registrar casos y consultar su estado de manera clara y segura.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Navegación</h2>
          <nav className="mt-4 flex flex-col items-start gap-3" aria-label="Navegación del pie de página">
            <Link className="text-sm transition-colors hover:text-white" href="/casos/formulario">
              Registrar caso
            </Link>
            <Link className="text-sm transition-colors hover:text-white" href="/casos/consultar">
              Consultar caso
            </Link>
          </nav>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Contáctanos</h2>
          <div className="mt-4 space-y-3 text-sm">
            {informacionContactoDesarrollador.map((contacto) => (
              <div key={contacto.valor}>
                <p className="font-medium text-slate-200">{contacto.nombre}</p>
                <a className="mt-1 block transition-colors hover:text-white" href={`mailto:${contacto.valor}`}>
                  {contacto.valor}
                </a>
                <a
                  className="mt-2 inline-flex items-center gap-2 transition-colors hover:text-white"
                  href={contacto.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                >
                  <iconosRedes.Whatsapp aria-hidden="true" />
                  WhatsApp
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Casos Sociales. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4" aria-label="Redes sociales de Somos Defensores">
            {redesSocialesSomosDefensores.map((red) => {
              const IconoRed = iconosRedes[red.nombre as keyof typeof iconosRedes];

              return IconoRed ? (
                <a
                  key={red.nombre}
                  href={red.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={red.nombre}
                  className="text-slate-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
                >
                  <IconoRed aria-hidden="true" size={18} />
                </a>
              ) : null;
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
