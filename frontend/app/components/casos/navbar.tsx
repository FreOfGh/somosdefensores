"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Database,
  FilePlus2,
  Home,
  LogIn,
  Map,
  Menu,
  X,
} from "lucide-react";
import { branding, navLinks } from "@/lib/data/rutas";

const Navbarsinauth = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();



  return (
    <nav className="sticky top-0 z-50 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.08)]">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[76px] items-center justify-between gap-4">
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-700"
          >
            <span className="flex h-11 w-20 shrink-0 items-center justify-center overflow-hidden  transition-transform group-hover:scale-105">
              <Image src={branding.navbar} alt="Isotipo Somos Defensores" width={44} height={44} className="h-full w-full object-contain" />
            </span>
            <div className="flex flex-col">
            <span className="text-lg col-1 font-bold text-red-900">Somos</span>
            <span className="text-lg col-2 font-bold text-slate-900">Defensores</span>
            </div>
            <span className="min-w-0">

            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <NavLink key={link.name} link={link} pathname={pathname} />
            ))}


          </div>

          <button
            type="button"
            aria-label={isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 lg:hidden"
          >
            {isOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-slate-200 bg-slate-50 lg:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-3 sm:px-6 lg:px-8">
            {navLinks.map((link) => (
              <MobileNavLink key={link.name} link={link} pathname={pathname} onClick={() => setIsOpen(false)} />
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

function NavLink({ link, pathname }: { link: { name: string; href: string; icon: typeof Home }; pathname: string | null }) {
  const Icon = link.icon;
  const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));

  return (
    <Link
      href={link.href}
      className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
        isActive ? "bg-red-50 text-red-900" : "text-red-900 hover:bg-slate-100 hover:text-slate-900"
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon size={17} aria-hidden="true" />
      {link.name}
    </Link>
  );
}

function MobileNavLink({
  link,
  pathname,
  onClick,
}: {
  link: { name: string; href: string; icon: typeof Home };
  pathname: string | null;
  onClick: () => void;
}) {
  const Icon = link.icon;
  const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));

  return (
    <Link
      href={link.href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold transition-colors ${
        isActive ? "bg-blue-100 text-blue-700" : "text-slate-700 hover:bg-white hover:text-blue-700"
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon size={18} aria-hidden="true" />
      {link.name}
    </Link>
  );
}

export default Navbarsinauth;
