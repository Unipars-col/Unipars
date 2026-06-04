import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteFooter from "@/app/components/site-footer";
import MaquinariaGrid from "./maquinaria-grid";

export const metadata: Metadata = {
  title: "Alquiler de maquinaria pesada — Unipars",
  description: "Alquila retroexcavadoras, grúas, compactadoras y más. Equipos certificados con o sin operador en Colombia.",
};

const equipos = [
  {
    tipo: "Retroexcavadora",
    emoji: "🚜",
    usos: ["Excavación", "Movimiento de tierras", "Demolición ligera"],
    precio: "Desde $850.000 / día",
    disponible: true,
  },
  {
    tipo: "Grúa telescópica",
    emoji: "🏗️",
    usos: ["Izaje de cargas", "Construcción", "Montajes industriales"],
    precio: "Desde $1.200.000 / día",
    disponible: true,
  },
  {
    tipo: "Compactadora vibradora",
    emoji: "🛞",
    usos: ["Compactación de suelos", "Obras viales", "Pavimentación"],
    precio: "Desde $480.000 / día",
    disponible: true,
  },
  {
    tipo: "Minicargador Skid Steer",
    emoji: "🚧",
    usos: ["Espacios reducidos", "Cargue de material", "Agricultura"],
    precio: "Desde $550.000 / día",
    disponible: true,
  },
  {
    tipo: "Plataforma elevadora",
    emoji: "⬆️",
    usos: ["Trabajos en altura", "Mantenimiento", "Instalaciones"],
    precio: "Desde $320.000 / día",
    disponible: true,
  },
  {
    tipo: "Volqueta",
    emoji: "🚛",
    usos: ["Transporte de escombros", "Material de construcción", "Minería"],
    precio: "Cotizar",
    disponible: false,
  },
];

const pasos = [
  { n: "01", title: "Selecciona el equipo", desc: "Elige el tipo de maquinaria según tu proyecto y requerimientos técnicos." },
  { n: "02", title: "Define el período", desc: "Por día, semana o mes. También manejamos proyectos de largo plazo." },
  { n: "03", title: "Operador incluido o no", desc: "Puedes alquilar solo el equipo o con operador certificado incluido." },
  { n: "04", title: "Recibe y opera", desc: "Entregamos en obra o punto acordado. Soporte técnico durante el alquiler." },
];

export default function MaquinariaPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f5]">

      {/* Breadcrumb */}
      <div className="border-b border-black/8 bg-white px-6 py-3 text-xs text-[#6b7280]">
        <Link href="/servicio-de-reparacion" className="hover:text-[#0d1b2a]">Servicios</Link>
        <span className="mx-2">›</span>
        <span className="text-[#0d1b2a]">Maquinaria pesada</span>
      </div>

      {/* Banner */}
      <div className="w-full overflow-hidden">
        <Image
          src="/banner-maquinaria-pesada.png"
          alt="Maquinaria pesada — Alquiler Unipars"
          width={1920}
          height={540}
          className="w-full object-cover"
          priority
        />
      </div>

      {/* CTA rápido */}
      <div className="flex justify-center border-b border-black/6 bg-white py-5">
        <a
          href="https://wa.me/573057249454?text=Hola%2C%20quiero%20información%20sobre%20alquiler%20de%20maquinaria%20pesada"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl px-8 py-3 font-semibold text-white transition-all hover:shadow-lg"
          style={{ backgroundColor: "#d97706" }}
        >
          Solicitar cotización por WhatsApp ›
        </a>
      </div>

      {/* Equipos — tarjetas tipo proveedor */}
      <section className="mx-auto max-w-[1440px] px-6 py-14 lg:px-8">
        <div className="mb-8 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold text-[#0d1b2a]">Proveedores de maquinaria</h2>
          <span className="text-sm text-[#6b7280]">4 proveedores encontrados</span>
        </div>
        <MaquinariaGrid />
      </section>

      {/* Cómo funciona */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-[1000px]">
          <h2 className="mb-10 text-center text-2xl font-bold text-[#0d1b2a]">
            Cómo funciona el alquiler
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pasos.map((p) => (
              <div key={p.n} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-xl font-black text-amber-600">
                  {p.n}
                </div>
                <h3 className="mb-2 font-semibold text-[#0d1b2a]">{p.title}</h3>
                <p className="text-sm leading-6 text-[#6b7280]">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section
        className="px-6 py-14 text-center"
        style={{ background: "linear-gradient(135deg, #0d1b2a 0%, #78350f 100%)" }}
      >
        <h2 className="mb-3 text-2xl font-bold text-white">¿Necesitas un equipo específico?</h2>
        <p className="mb-8 text-white/60">Cuéntanos tu proyecto y buscamos el equipo ideal para ti.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="https://wa.me/573057249454?text=Hola%2C%20quiero%20alquilar%20maquinaria%20pesada"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-amber-600 px-8 py-3.5 font-semibold text-white transition-all hover:bg-amber-700"
          >
            Contactar por WhatsApp
          </a>
          <Link
            href="/servicio-de-reparacion"
            className="rounded-xl border border-white/25 bg-white/10 px-8 py-3.5 font-semibold text-white transition-all hover:bg-white/20"
          >
            Ver otros servicios
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
