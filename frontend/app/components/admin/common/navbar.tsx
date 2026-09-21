"use client";

import Link from "next/link";
import Image from "next/image"; // 1. Imported Next.js Image
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { adminNavItems as rawNavItems, branding } from "@/lib/data/rutas";
import { adminFetch } from "@/lib/api/admin-fetch";

type NavItem = { href: string; name: string };

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const navItems: NavItem[] = rawNavItems as NavItem[];
    const [esSuperUsuario, setEsSuperUsuario] = useState(false);

    useEffect(() => {
        adminFetch("/api/auth/me")
            .then((response) => response.ok ? response.json() : null)
            .then((data) => setEsSuperUsuario(Boolean(data?.user?.roles?.some((role: { name: string }) => role.name === "super usuario"))))
            .catch(() => setEsSuperUsuario(false));
    }, []);

    const items = esSuperUsuario
        ? [{ name: "Dashboard", href: "/admin/dashboard" }, { name: "Gestión de usuarios", href: "/admin/gestion-usuarios" }, { name: "Catálogos", href: "/admin/gestion-usuarios?tab=catalogos" }]
        : navItems;

    const cerrarSesion = async () => {
        try {
            await adminFetch("/api/auth/logout", { method: "POST" });
        } finally {
            window.localStorage.removeItem("revisor_token");
            router.replace("/login");
        }
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.08)]" aria-label="Navegación principal">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">

                <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-3 text-slate-900 transition-colors hover:text-red-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-700"
                >
                    <span className="flex h-20 w-20 items-center justify-center bg-primary text-lg font-bold text-white relative overflow-hidden">
                        {/* 2. Replaced <img> with <Image /> for optimization */}
                        <Image
                            src={branding.logo}
                            alt="Logo de la marca"
                            fill
                            className="object-contain" // Or object-cover depending on your logo
                            sizes="80px"
                        />
                    </span>
                </Link>

                {/* 3. Changed <div> to <ul> for proper semantic list rendering */}
                {/* Only map if items exist, otherwise render nothing */}
                {items.length > 0 && (
                    <ul className="flex flex-wrap items-center gap-2 m-0 p-0 list-none">
                        {items.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        aria-current={isActive ? "page" : undefined}
                                        className={`block rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${isActive
                                                ? "bg-red-50 text-red-900"
                                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                            }`}
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                        <li>
                            <button
                                type="button"
                                onClick={() => void cerrarSesion()}
                                className="inline-flex items-center gap-2 rounded-lg border border-[#8e2329] px-4 py-2 text-sm font-semibold text-[#8e2329] transition-colors hover:bg-[#8e2329] hover:text-white"
                            >
                                <LogOut size={16} aria-hidden="true" />
                                Cerrar sesión
                            </button>
                        </li>
                    </ul>
                )}

            </div>
        </nav>
    );
}