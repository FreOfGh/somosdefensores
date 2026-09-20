import Navbar from "../components/casos/navbar";
import Footer from "../components/casos/footer";
import VisorMapas from "../components/geografia/visor-mapas";

export default function GeografiaPublicaPage() {
  return (
    <div className="flex min-h-full flex-col bg-[#f3eee7]">
      <Navbar />
      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#a82d35]">Consulta pública</p>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">Reporte geográfico de casos</h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">Explora la distribución territorial de la información disponible en Colombia y consulta el detalle municipal por departamento.</p>
          </div>
          <VisorMapas />
        </div>
      </main>
      <Footer />
    </div>
  );
}
