"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems, branding } from "@/lib/data/rutas";


export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-slate-200 bg-white" aria-label="Navegación principal">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 text-slate-900 transition-colors hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
        >
          <span className="flex h-20 w-20 items-center justify-center  bg-primary text-lg font-bold text-white">
            <img src={branding.logo} alt="Logo" className="h-20 w-20" />
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-2" role="list">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 ${isActive ? "bg-red-900 text-white" : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"}`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
