import Navbar from "../components/casos/navbar";
import Footer from "../components/casos/footer";

const policies = [
  { id: "privacidad", title: "Política de privacidad" },
  { id: "tratamiento-de-datos", title: "Tratamiento de datos personales" },
  { id: "terminos-de-uso", title: "Términos de uso" },
];

export default function PoliticasPage() {
  return (
    <div className="flex min-h-full flex-col bg-[#f3eee7]">
      <Navbar />
      <main className="flex-1 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#a82d35]">Información institucional</p>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Políticas institucionales</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">En este espacio se publicarán los documentos institucionales oficiales de Somos Defensores.</p>
          <div className="mt-10 space-y-5">
            {policies.map((policy) => (
              <section key={policy.id} id={policy.id} className="scroll-mt-28 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-8">
                <h2 className="text-2xl font-bold text-slate-950">{policy.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">Documento institucional en actualización. La versión oficial estará disponible próximamente.</p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}