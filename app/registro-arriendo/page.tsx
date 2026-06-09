import type { Metadata } from "next";
import ArriendoForm from "./arriendo-form";
import SiteFooter from "@/app/components/site-footer";

export const metadata: Metadata = {
  title: "Registra tu flota | Totalpars",
  description: "Ofrece tus vehículos en arriendo a través de la red Totalpars.",
};

export default function RegistroArriendoPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f6]">
      <section className="bg-[#1a2530] py-12">
        <div className="mx-auto max-w-2xl px-5 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#16a34a]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#16a34a]">
            Flota disponible
          </span>
          <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">
            Registra tu flota de vehículos
          </h1>
          <p className="mt-3 text-gray-400">
            Conéctate con empresas que necesitan buses y camiones. Gratis y sin complicaciones.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-5 text-sm">
            {["Mayor visibilidad", "Más contratos", "Red nacional", "Sin costo"].map((b) => (
              <span key={b} className="flex items-center gap-1.5 text-gray-300">
                <span className="text-[#16a34a]">✓</span> {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-2xl px-5">
          <ArriendoForm />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
