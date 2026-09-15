import FormularioAyudaHumanitaria from "@/app/components/formularios/ayuda_humanitaria/main";
function FormularioPage() {
return (
  <div className="flex flex-col items-center justify-center min-h-screen py-2">
    <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
      <h1 className="text-6xl font-bold">
        Formulario de Ayuda Humanitaria
      </h1>
      <p className="mt-3 text-2xl">
        Complete la información de la víctima.
      </p>
      <div className="mt-6 w-full max-w-4xl">
        <FormularioAyudaHumanitaria />
      </div>
    </main>
  </div>
); 
};

export default FormularioPage;