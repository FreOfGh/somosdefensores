"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminAccessGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    if (!window.localStorage.getItem("revisor_token")) {
      router.replace("/login");
      return;
    }

    setAutorizado(true);
  }, [router]);

  return autorizado ? children : <main className="min-h-screen bg-[#f5f5f5] p-12 text-center text-black">Verificando sesión...</main>;
}