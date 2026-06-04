import type { Metadata } from "next";
import MaquinariaForm from "./maquinaria-form";
import SiteFooter from "@/app/components/site-footer";

export const metadata: Metadata = {
  title: "Registra tu maquinaria | Unipars",
  description: "Ofrece tu maquinaria pesada en alquiler a través de la red Unipars.",
};

export default function RegistroMaquinariaPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f6]">
      <section className="bg-[#1a2530] py-12">
        <div className="mx-auto max-w-2xl px-5 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d97706]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#d97706]">
            Alquiler
          </span>
          <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">
            Registra tu maquinaria pesada
          </h1>
          <p className="mt-3 text-gray-400">
            Conecta tu equipo con proyectos que lo necesitan. Gratis y sin complicaciones.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-5 text-sm">
            {["Mayor visibilidad", "Más proyectos", "Red nacional", "Sin costo"].map((b) => (
              <span key={b} className="flex items-center gap-1.5 text-gray-300">
                <span className="text-[#d97706]">✓</span> {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-2xl px-5">
          <MaquinariaForm />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
