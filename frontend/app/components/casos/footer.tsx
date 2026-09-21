import Link from "next/link";
import Image from "next/image";

import {
  contactoInstitucional,
  informacionContactoDesarrollador,
  politicasInstitucionales,
  redesSocialesSomosDefensores,
  iconosRedes,
} from "@/lib/data/informacion";

import { branding } from "@/lib/data/rutas";

export default function Footer() {
  return (
    <footer className="mt-auto border-t-4 border-[#a82d35] bg-white text-slate-600">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_1.2fr] lg:px-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-slate-950 transition-colors hover:text-[#a82d35] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a82d35]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#172936] text-lg font-bold text-white">
              <Image src={branding.logo} alt="Logo" width={40} height={40} className="h-10 w-10" />
            </span>
            <span className="text-lg font-bold">Somos Defensores</span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
            Sistema de información para registrar, consultar y comprender casos relacionados con la defensa de los derechos humanos.
          </p>
          <div className="mt-5 flex items-center gap-4" aria-label="Redes sociales de Somos Defensores">
            {redesSocialesSomosDefensores.map((red) => {
              const IconoRed = iconosRedes[red.nombre as keyof typeof iconosRedes];

              return IconoRed ? <a key={red.nombre} href={red.url} target="_blank" rel="noreferrer" aria-label={red.nombre} className="text-slate-500 transition-colors hover:text-[#a82d35] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a82d35]"><IconoRed aria-hidden="true" size={18} /></a> : null;
            })}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#a82d35]">Políticas institucionales</h2>
          <nav className="mt-4 flex flex-col items-start gap-3" aria-label="Políticas institucionales">
            {politicasInstitucionales.map((politica) => <Link key={politica.href} className="text-sm transition-colors hover:text-[#a82d35]" href={politica.href}>{politica.nombre}</Link>)}
          </nav>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#a82d35]">Contacto</h2>
          <div className="mt-4 space-y-3 text-sm leading-6">
            <p>{contactoInstitucional.direccion}</p>
            <p>{contactoInstitucional.telefonos}</p>
            <div className="space-y-1">
              {contactoInstitucional.correos.map((correo) => <a key={correo} className="block break-all transition-colors hover:text-[#a82d35]" href={`mailto:${correo}`}>{correo}</a>)}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Somos Defensores. Todos los derechos reservados.</p>
          {informacionContactoDesarrollador.map((contacto) => <p key={contacto.valor} className="text-[0.65rem] text-slate-400">Desarrollo independiente: {contacto.nombre} · <a className="hover:text-[#a82d35]" href={`mailto:${contacto.valor}`}>{contacto.valor}</a> · No hace parte de Somos Defensores.</p>)}
        </div>
      </div>
    </footer>
  );
}
