import Footer  from "@/app/components/casos/footer";
import  Navbar  from "@/app/components/casos/navbar";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
      <div className="flex min-h-full flex-col">
        <Navbar />
        {children}
        <Footer />
      </div>
  );
}
