import Navbar from "./components/casos/navbar";
import Footer from "./components/casos/footer";
import Hero from "./components/home/hero";
import ReportesPublicos from "./components/home/reportes-publicos";
import ImpactoNacional from "./components/home/impacto-nacional";

export default function Home() {
  return (
    <div className="bg-[#f3eee7] font-sans">
      <Navbar />
      <main>
        <Hero />
        <ReportesPublicos />
        <ImpactoNacional />
      </main>
      <Footer />
    </div>
  );
}

