import type { Metadata } from "next";
import Footer  from "@/app/components/casos/footer";
import Navbar from "../components/admin/common/navbar";
import AdminAccessGuard from "../components/admin/common/admin-access-guard";
import { informacionContactoDesarrollador, metaDataAdministrador } from "@/lib/data/informacion";

export const metadata: Metadata = {
  title: metaDataAdministrador.title,
  description: metaDataAdministrador.description,
  keywords: metaDataAdministrador.keywords,
  authors: [
    {
      name: informacionContactoDesarrollador[0].nombre,
      url: informacionContactoDesarrollador[0].whatsapp,
    },
  ],
};
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
      <AdminAccessGuard>
      <div className="flex min-h-full flex-col">
        <Navbar />
        {children}
        <Footer />
      </div>
      </AdminAccessGuard>
  );
}
