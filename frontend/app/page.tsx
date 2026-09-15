import Image from "next/image";
import Metricas from "@/app/components/home/metricas";
import { branding } from "@/lib/data/rutas";
import Navbar from "./components/casos/navbar";
import SeleccionFormulario from "./components/home/formcard";
import Footer from "./components/casos/footer";
export default function Home() {
  return (
    <div className=" bg-zinc-50 font-sans">
      <Navbar />
      <SeleccionFormulario />
      <Footer />
    </div>
  );
}

