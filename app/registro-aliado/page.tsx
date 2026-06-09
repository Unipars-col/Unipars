import type { Metadata } from "next";
import AliadorForm from "./aliado-form";
import SiteFooter from "@/app/components/site-footer";

export const metadata: Metadata = {
  title: "Únete a Uniparceros | Totalpars",
  description: "Registra tu taller mecánico y únete a nuestra red de aliados de confianza.",
};

export default function RegistroAliadoPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f6]">
      {/* Hero */}
      <section className="bg-[#1a2530] py-12">
        <div className="mx-auto max-w-2xl px-5 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ed8435]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#ed8435]">
            Uniparceros
          </span>
          <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">
            Únete a nuestra red de talleres aliados
          </h1>
          <p className="mt-3 text-gray-400">
            Regístrate gratis. Recibe más clientes, visibilidad y respaldo de Totalpars.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-5 text-sm">
            {["Más visibilidad", "Más clientes", "Respaldo Totalpars", "Capacitaciones"].map((b) => (
              <span key={b} className="flex items-center gap-1.5 text-gray-300">
                <span className="text-[#ed8435]">✓</span> {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-12">
        <div className="mx-auto max-w-2xl px-5">
          <AliadorForm />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
