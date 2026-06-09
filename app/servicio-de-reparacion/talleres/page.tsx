import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/app/components/site-footer";
import Buscador from "./buscador";
import PopupAliado from "./popup-aliado";
import { type Taller } from "./talleres-grid";

export const metadata: Metadata = {
  title: "Uniparceros — Aliados en cada ruta | Totalpars",
  description: "Red de talleres mecánicos aliados. Encuentra el taller de confianza más cercano para frenos, motor, pintura, suspensión y más.",
};

const HOW_IT_WORKS = [
  {
    step: "1",
    icon: (
      <svg viewBox="0 0 40 40" className="h-9 w-9" fill="none">
        <circle cx="18" cy="18" r="10" stroke="#ed8435" strokeWidth="2.5" />
        <path d="M26 26l6 6" stroke="#ed8435" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Busca tu servicio",
    desc: "Encuentra el servicio que necesitas para tu vehículo.",
  },
  {
    step: "2",
    icon: (
      <svg viewBox="0 0 40 40" className="h-9 w-9" fill="none">
        <rect x="6" y="8" width="28" height="24" rx="3" stroke="#ed8435" strokeWidth="2.5" />
        <path d="M6 14h28" stroke="#ed8435" strokeWidth="2.5" />
        <path d="M13 6v4M27 6v4" stroke="#ed8435" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Elige tu taller",
    desc: "Compara talleres verificados y elige el que más te convenga.",
  },
  {
    step: "3",
    icon: (
      <svg viewBox="0 0 40 40" className="h-9 w-9" fill="none">
        <circle cx="20" cy="20" r="13" stroke="#ed8435" strokeWidth="2.5" />
        <path d="M20 13v8l5 3" stroke="#ed8435" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Agenda o visita",
    desc: "Agenda tu cita o visita el taller directamente.",
  },
  {
    step: "4",
    icon: (
      <svg viewBox="0 0 40 40" className="h-9 w-9" fill="none">
        <path d="M8 20l8 8 16-16" stroke="#ed8435" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Repuesto + Instalación",
    desc: "Compra tu repuesto e instálalo con nuestros talleres aliados.",
  },
];

const TALLERES: Taller[] = [
  {
    nombre: "Taller Diesel Pro",
    logo: "DP",
    color: "#16384f",
    foto: "/servicio-reparacion/taller-1.png",
    rating: 4.9,
    reviews: 128,
    servicios: ["Motor", "Frenos", "Suspensión", "Electricidad"],
    ciudad: "Bogotá, D.C.",
    distancia: "1.2 km",
    verificado: true,
    descripcion: "Especialistas en motores diésel para buses y camiones. Más de 15 años de experiencia con flotas de transporte público.",
    telefono: "3001234567",
    horario: "Lun–Sáb 7am–6pm",
    direccion: "Cra 30 #15-40, Puente Aranda",
    experiencia: "15 años",
    clientes: "3.500+",
  },
  {
    nombre: "Frenos Bogotá",
    logo: "FB",
    color: "#ed8435",
    foto: "/servicio-reparacion/taller-2.jpg",
    rating: 4.8,
    reviews: 95,
    servicios: ["Frenos", "ABS", "Suspensión", "Dirección"],
    ciudad: "Bogotá, D.C.",
    distancia: "2.3 km",
    verificado: true,
    descripcion: "Centro especializado en sistemas de frenos y ABS para vehículos de carga y transporte. Diagnóstico computarizado.",
    telefono: "3109876543",
    horario: "Lun–Vie 8am–5pm · Sáb 8am–1pm",
    direccion: "Av Caracas #52-18, Teusaquillo",
    experiencia: "10 años",
    clientes: "2.800+",
  },
  {
    nombre: "Mecánica del Sur",
    logo: "MS",
    color: "#38454f",
    foto: "/servicio-reparacion/taller-1.png",
    rating: 4.7,
    reviews: 86,
    servicios: ["Mecánica General", "Electricidad", "Diagnóstico"],
    ciudad: "Bogotá, D.C.",
    distancia: "3.1 km",
    verificado: true,
    descripcion: "Taller integral de mecánica general y electricidad automotriz. Atención rápida y garantía en todos los servicios.",
    telefono: "3153334455",
    horario: "Lun–Sáb 7am–7pm",
    direccion: "Cll 40 Sur #72-20, Kennedy",
    experiencia: "8 años",
    clientes: "1.900+",
  },
  {
    nombre: "Latonería Express",
    logo: "LE",
    color: "#16384f",
    foto: "/servicio-reparacion/taller-2.jpg",
    rating: 4.6,
    reviews: 72,
    servicios: ["Latonería", "Pintura", "Detallado"],
    ciudad: "Bogotá, D.C.",
    distancia: "4.5 km",
    verificado: true,
    descripcion: "Expertos en latonería, pintura automotriz y detallado profesional. Usamos pintura horneable de alta durabilidad.",
    telefono: "3204445566",
    horario: "Lun–Vie 7:30am–5:30pm",
    direccion: "Cra 68 #22-10, Fontibón",
    experiencia: "12 años",
    clientes: "1.400+",
  },
  {
    nombre: "AutoElectric Pro",
    logo: "AE",
    color: "#1d6fa4",
    foto: "/servicio-reparacion/taller-1.png",
    rating: 4.8,
    reviews: 103,
    servicios: ["Electricidad", "Alarmas", "Diagnóstico"],
    ciudad: "Medellín",
    distancia: "0.8 km",
    verificado: true,
    descripcion: "Diagnóstico electrónico avanzado, instalación de alarmas y sistemas eléctricos para vehículos comerciales y de pasajeros.",
    telefono: "3006667788",
    horario: "Lun–Sáb 8am–6pm",
    direccion: "Cra 45 #80-12, Laureles",
    experiencia: "9 años",
    clientes: "2.200+",
  },
  {
    nombre: "Transmisiones Norte",
    logo: "TN",
    color: "#5c3d8f",
    foto: "/servicio-reparacion/taller-2.jpg",
    rating: 4.7,
    reviews: 61,
    servicios: ["Transmisión", "Caja de cambios", "Diferencial"],
    ciudad: "Bogotá, D.C.",
    distancia: "5.2 km",
    verificado: true,
    descripcion: "Especialistas en transmisiones automáticas, mecánicas y diferenciales para buses articulados y camiones de alto tonelaje.",
    telefono: "3118889900",
    horario: "Lun–Vie 8am–5pm",
    direccion: "Cll 127 #54-30, Suba",
    experiencia: "11 años",
    clientes: "980+",
  },
  {
    nombre: "Refrigeración Total",
    logo: "RT",
    color: "#0d7e6a",
    foto: "/servicio-reparacion/taller-1.png",
    rating: 4.5,
    reviews: 58,
    servicios: ["Aire acondicionado", "Radiador", "Enfriamiento"],
    ciudad: "Cali",
    distancia: "1.5 km",
    verificado: true,
    descripcion: "Servicio completo de sistemas de refrigeración y aire acondicionado vehicular. Recarga de gas y reparación de radiadores.",
    telefono: "3162223344",
    horario: "Lun–Sáb 7am–5pm",
    direccion: "Av 3N #28-15, Granada",
    experiencia: "7 años",
    clientes: "850+",
  },
  {
    nombre: "Neumáticos Medellín",
    logo: "NM",
    color: "#c0392b",
    foto: "/servicio-reparacion/taller-2.jpg",
    rating: 4.9,
    reviews: 145,
    servicios: ["Neumáticos", "Alineación", "Balanceo"],
    ciudad: "Medellín",
    distancia: "2.0 km",
    verificado: true,
    descripcion: "Centro especializado en neumáticos para toda clase de vehículos. Alineación computarizada y balanceo de precisión.",
    telefono: "3045556677",
    horario: "Lun–Dom 7am–7pm",
    direccion: "Cll 33 #66-40, El Poblado",
    experiencia: "14 años",
    clientes: "4.200+",
  },
  {
    nombre: "Vidrios & Panorámicos",
    logo: "VP",
    color: "#2980b9",
    foto: "/servicio-reparacion/taller-1.png",
    rating: 4.6,
    reviews: 49,
    servicios: ["Vidrios", "Parabrisas", "Polarizado"],
    ciudad: "Bogotá, D.C.",
    distancia: "3.8 km",
    verificado: false,
    descripcion: "Especialistas en reemplazo de parabrisas, vidrios laterales y polarizado de alta calidad para buses y camiones.",
    telefono: "3177778899",
    horario: "Lun–Sáb 8am–5pm",
    direccion: "Cra 22 #45-60, Chapinero",
    experiencia: "6 años",
    clientes: "720+",
  },
  {
    nombre: "Servicentro Integral",
    logo: "SI",
    color: "#d35400",
    foto: "/servicio-reparacion/taller-2.jpg",
    rating: 4.7,
    reviews: 92,
    servicios: ["Mantenimiento preventivo", "Cambio de aceite", "Filtros"],
    ciudad: "Bucaramanga",
    distancia: "1.1 km",
    verificado: true,
    descripcion: "Mantenimientos preventivos y correctivos completos. Cambio de aceite, filtros y revisión técnico-mecánica con certificación.",
    telefono: "3191112233",
    horario: "Lun–Sáb 7am–6pm",
    direccion: "Cra 27 #58-20, Cabecera",
    experiencia: "13 años",
    clientes: "2.100+",
  },
];

export default function UniparceroPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f6] text-[#16384f]">
      <PopupAliado />

      {/* ── HERO BANNER ── */}
      <section className="w-full">
        <Link href="#buscar" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/servicio-reparacion/banner-uniparceros-v2.jpg"
            alt="Uniparceros, aliados en cada ruta — Encuentra talleres aliados de confianza en todo el país"
            className="w-full h-auto object-cover"
          />
        </Link>
      </section>

      <Buscador talleres={TALLERES} />

      {/* ── CÓMO FUNCIONA ── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">

          {/* Header */}
          <div className="mb-16 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#8b8d91]">Proceso simple</p>
            <h2 className="text-3xl font-bold text-[#16384f] md:text-4xl">¿Cómo <span className="text-[#ed8435]">funciona?</span></h2>
            <p className="mt-3 text-sm text-[#8b8d91]">De la búsqueda al taller en 4 pasos</p>
          </div>

          {/* Pasos */}
          <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

            {/* Línea conectora */}
            <div className="absolute left-[12.5%] right-[12.5%] top-10 hidden h-0.5 bg-gradient-to-r from-[#ed8435]/20 via-[#ed8435] to-[#ed8435]/20 lg:block" />

            {HOW_IT_WORKS.map((item, i) => (
              <div key={item.step} className="step-card group relative flex flex-col items-center text-center">

                {/* Círculo con número */}
                <div className="relative z-10 mb-6">
                  <div className="step-circle flex h-20 w-20 items-center justify-center rounded-full bg-[#ed8435] shadow-[0_8px_32px_rgba(237,132,53,0.35)] transition-transform duration-300 group-hover:scale-110">
                    <span className="text-3xl font-black text-white">{item.step}</span>
                  </div>
                  {/* Anillo pulsante */}
                  <div className="step-ring absolute inset-0 rounded-full border-4 border-[#ed8435]" />
                </div>

                {/* Ícono pequeño */}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff5ec] transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#ed8435]/15">
                  {item.icon}
                </div>

                {/* Texto */}
                <h3 className="text-lg font-bold text-[#16384f] transition-colors duration-200 group-hover:text-[#ed8435]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#8b8d91]">{item.desc}</p>

                {/* Flecha */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="absolute -right-4 top-9 z-20 hidden text-[#ed8435] lg:block">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ALIADOS ── */}
      <section className="bg-[#1a2530] py-12">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-[#ed8435]">
                <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none">
                  <path d="M6 26V14l10-8 10 8v12H20v-7h-8v7H6z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-black text-white sm:text-2xl">
                  ¿Eres mecánico o tienes un taller?
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  Únete a nuestra red de aliados y haz crecer tu negocio.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="flex gap-6">
                {[
                  { icon: "◎", label: "Más visibilidad" },
                  { icon: "★", label: "Más clientes" },
                  { icon: "✓", label: "Respaldo Totalpars" },
                  { icon: "▲", label: "Capacitaciones" },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1">
                    <span className="text-lg text-[#ed8435]">{icon}</span>
                    <span className="text-[10px] font-semibold uppercase text-gray-400">{label}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-center gap-1">
                <Link
                  href="/registro-aliado"
                  className="rounded-full bg-[#ed8435] px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-[#d67024]"
                >
                  Quiero ser aliado
                </Link>
                <span className="text-[11px] text-gray-500">Es gratis registrarse</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Aliados existentes (logos) */}
      <section className="border-t border-black/6 bg-white">
        <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-center text-xl font-semibold tracking-[-0.04em] text-[#38454f] sm:text-2xl">
            Nuestros aliados
          </h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/servicio-reparacion/logos.png"
            alt="Marcas aliadas de Totalpars"
            className="mx-auto h-auto w-full max-w-4xl object-contain"
          />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
