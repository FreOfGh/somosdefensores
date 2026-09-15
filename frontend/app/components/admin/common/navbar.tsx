"use client";

import Link from "next/link";
import Image from "next/image"; // 1. Imported Next.js Image
import { usePathname } from "next/navigation";
import { adminNavItems as rawNavItems, branding } from "@/lib/data/rutas";

type NavItem = { href: string; name: string };

export default function Navbar() {
    const pathname = usePathname();
    const navItems: NavItem[] = rawNavItems as NavItem[];

    return (
        <nav className="border-b border-slate-200 bg-white" aria-label="Navegación principal">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">

                <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-3 text-slate-900 transition-colors hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
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
                {navItems.length > 0 && (
                    <ul className="flex flex-wrap items-center gap-2 m-0 p-0 list-none">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        aria-current={isActive ? "page" : undefined}
                                        className={`block rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${isActive
                                                ? "bg-red-900 text-white"
                                                : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                                            }`}
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}

            </div>
        </nav>
    );
}