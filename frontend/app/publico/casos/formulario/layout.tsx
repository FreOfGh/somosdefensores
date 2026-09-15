import type { Metadata } from "next";
import {metaDataSeccionFormularios} from "@/lib/data/informacion";

export const metadata: Metadata = {
    title: metaDataSeccionFormularios.title,
    description: metaDataSeccionFormularios.description,
    keywords: metaDataSeccionFormularios.keywords,
};
export default function RootLayout({ children }: LayoutProps<"/">) {
  return children;
}
