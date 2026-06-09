import type { Metadata } from "next";
import Image from "next/image";
import SiteFooter from "@/app/components/site-footer";
import ServiceCards from "./service-cards";

export const metadata: Metadata = {
  title: "Servicios Totalpars — Talleres, Arriendo y Maquinaria",
  description: "Encuentra talleres aliados, arrienda buses y camiones o alquila maquinaria pesada con Totalpars.",
};

export default function ServiciosPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f5] text-[#111]">

      {/* Banner principal */}
      <div className="w-full overflow-hidden">
        <Image
          src="/banner-principal-nuevo.jpg"
          alt="Movilidad que avanza contigo — Totalpars"
          width={1920}
          height={540}
          className="w-full object-cover"
          priority
        />
      </div>

      {/* Selector de servicio */}
      <section className="mx-auto max-w-[1440px] px-6 py-14 lg:px-8">
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#8b8d91]">
            Uniparceros
          </p>
          <h1 className="text-3xl font-bold text-[#ed8435] md:text-4xl">
            ¿Qué necesitas hoy?
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#6b7280]">
            Elige el servicio y te conectamos con las mejores opciones disponibles en Colombia.
          </p>
        </div>

        <ServiceCards />
      </section>

      {/* Trust strip */}
      <section className="border-t border-black/6 bg-white px-6 py-12">
        <div className="mx-auto max-w-[1060px] grid gap-8 sm:grid-cols-3">
          {[
            {
              icon: (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              ),
              title: "Aliados verificados",
              desc: "Todos los servicios pasan un proceso de validación antes de aparecer en la plataforma.",
            },
            {
              icon: (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                </svg>
              ),
              title: "Respuesta en 2 horas",
              desc: "Cotizaciones y confirmaciones en tiempo real con nuestro equipo comercial.",
            },
            {
              icon: (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
              ),
              title: "Cobertura nacional",
              desc: "Presencia en las principales ciudades y departamentos de Colombia.",
            },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-4">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fff4ea] text-[#ed8435]">
                {item.icon}
              </div>
              <div>
                <p className="mb-1 text-sm font-semibold text-[#0d1b2a]">{item.title}</p>
                <p className="text-[13px] leading-5 text-[#6b7280]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
