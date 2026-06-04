import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteFooter from "@/app/components/site-footer";

export const metadata: Metadata = {
  title: "Servicios Unipars — Talleres, Arriendo y Maquinaria",
  description: "Encuentra talleres aliados, arrienda buses y camiones o alquila maquinaria pesada con Unipars.",
};

const services = [
  {
    href: "/servicio-de-reparacion/talleres",
    tag: "Red Uniparceros",
    title: "Talleres y mecánicos",
    description:
      "Más de 1.500 talleres verificados especializados en transporte masivo y de carga. Agenda, compara y confía.",
    cta: "Buscar taller",
    accent: "#ed8435",
    bg: "#fff4ea",
    hoverBorder: "hover:border-[#ed8435]/30",
    hoverShadow: "hover:shadow-[0_8px_32px_rgba(237,132,53,0.12)]",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    features: ["Verificados", "Cerca de ti", "Expertos", "Rápido"],
  },
  {
    href: "/servicio-de-reparacion/arriendo",
    tag: "Flota disponible",
    title: "Arriendo de vehículos",
    description:
      "Buses urbanos, intermunicipales y camiones de carga disponibles en todo Colombia, con o sin conductor.",
    cta: "Ver flota",
    accent: "#16a34a",
    bg: "#f0fdf4",
    hoverBorder: "hover:border-green-500/30",
    hoverShadow: "hover:shadow-[0_8px_32px_rgba(22,163,74,0.12)]",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 5v3h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    features: ["Bus urbano", "Intermunicipal", "Camión de carga", "Con conductor"],
  },
  {
    href: "/servicio-de-reparacion/maquinaria",
    tag: "Alquiler",
    title: "Maquinaria pesada",
    description:
      "Retroexcavadoras, grúas, compactadoras y más. Equipos certificados con o sin operador, por día o proyecto.",
    cta: "Ver maquinaria",
    accent: "#d97706",
    bg: "#fffbeb",
    hoverBorder: "hover:border-amber-500/30",
    hoverShadow: "hover:shadow-[0_8px_32px_rgba(217,119,6,0.12)]",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20h20M6 20V10l6-7 6 7v10M10 20v-5h4v5M17 8h4v5" />
      </svg>
    ),
    features: ["Retroexcavadora", "Grúa", "Compactadora", "Con operador"],
  },
];

export default function ServiciosPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f5] text-[#111]">

      {/* Banner principal */}
      <div className="w-full overflow-hidden">
        <Image
          src="/banner-servicios-unipars.jpg"
          alt="Movilidad que avanza contigo — Unipars"
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

        {/* Tarjetas — estilo Unipars */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className={`group flex flex-col rounded-2xl border border-black/6 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 ${s.hoverBorder} ${s.hoverShadow}`}
            >
              {/* Icono */}
              <div
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: s.bg, color: s.accent }}
              >
                {s.icon}
              </div>

              {/* Tag */}
              <p
                className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em]"
                style={{ color: `${s.accent}b3` }}
              >
                {s.tag}
              </p>

              {/* Título */}
              <h2 className="mb-2 text-lg font-bold text-[#0d1b2a]">{s.title}</h2>

              {/* Descripción */}
              <p className="mb-5 text-sm leading-6 text-[#6b7280]">{s.description}</p>

              {/* Features pills */}
              <div className="mb-6 flex flex-wrap gap-2">
                {s.features.map((f) => (
                  <span
                    key={f}
                    className="rounded-full px-3 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: s.bg, color: s.accent }}
                  >
                    {f}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div
                className="mt-auto flex items-center gap-2 text-sm font-semibold"
                style={{ color: s.accent }}
              >
                {s.cta}
                <svg
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
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
