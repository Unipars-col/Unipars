"use client";

import { useState } from "react";

type Equipo = {
  nombre: string;
  logo: string;
  color: string;
  foto: string;
  rating: number;
  reviews: number;
  tipos: string[];
  ciudad: string;
  precio: string;
  verificado: boolean;
  descripcion: string;
  telefono: string;
  capacidad: string;
  disponibilidad: string;
};

export const EQUIPOS: Equipo[] = [
  {
    nombre: "HeavyMaq Colombia",
    logo: "HM",
    color: "#d97706",
    foto: "/hero-banner-2.png",
    rating: 4.9,
    reviews: 73,
    tipos: ["Retroexcavadora", "Grúa telescópica"],
    ciudad: "Bogotá, D.C.",
    precio: "Desde $850.000/día",
    verificado: true,
    descripcion: "Empresa líder en alquiler de maquinaria pesada con más de 18 años de experiencia. Operadores certificados y equipos con mantenimiento preventivo mensual.",
    telefono: "3121234567",
    capacidad: "Hasta 35 ton",
    disponibilidad: "Inmediata",
  },
  {
    nombre: "Compacta Vías S.A.S",
    logo: "CV",
    color: "#b45309",
    foto: "/hero-banner-3.png",
    rating: 4.8,
    reviews: 55,
    tipos: ["Compactadora", "Minicargador"],
    ciudad: "Medellín",
    precio: "Desde $480.000/día",
    verificado: true,
    descripcion: "Especialistas en obras viales y pavimentación. Equipos para compactación de suelos con soporte técnico en sitio.",
    telefono: "3049876543",
    capacidad: "Hasta 12 ton",
    disponibilidad: "1-2 días",
  },
  {
    nombre: "Altura & Izaje Ltda.",
    logo: "AI",
    color: "#92400e",
    foto: "/hero-banner-transmilenio-v2.jpg",
    rating: 4.7,
    reviews: 41,
    tipos: ["Plataforma elevadora", "Grúa telescópica"],
    ciudad: "Cali",
    precio: "Desde $320.000/día",
    verificado: true,
    descripcion: "Soluciones para trabajo en altura y montajes industriales. Operadores certificados en trabajo seguro en alturas.",
    telefono: "3154321098",
    capacidad: "Hasta 30m altura",
    disponibilidad: "Inmediata",
  },
  {
    nombre: "AgroCarga Nacional",
    logo: "AN",
    color: "#78350f",
    foto: "/hero-banner-2.png",
    rating: 4.6,
    reviews: 29,
    tipos: ["Minicargador", "Retroexcavadora"],
    ciudad: "Barranquilla",
    precio: "Desde $550.000/día",
    verificado: true,
    descripcion: "Maquinaria para proyectos agrícolas, construcción e industria. Disponibilidad en la Costa Caribe.",
    telefono: "3187654321",
    capacidad: "Hasta 5 ton",
    disponibilidad: "2-3 días",
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 text-[#FFA72F]" fill="currentColor">
      <path d="M8 1l1.9 3.8 4.2.6-3 3 .7 4.2L8 10.5l-3.8 2.1.7-4.2-3-3 4.2-.6z" />
    </svg>
  );
}

function Modal({ item, onClose }: { item: Equipo; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative h-40 w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.foto} alt={item.nombre} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button onClick={onClose} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/40">✕</button>
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[#FFA72F] px-2.5 py-1 text-[10px] font-bold text-white">
            ✓ EQUIPO CERTIFICADO
          </span>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-black text-[#16384f]">{item.nombre}</h3>
            <div className="flex shrink-0 items-center gap-1">
              <Stars rating={item.rating} />
              <span className="text-sm font-bold text-[#16384f]">{item.rating}</span>
              <span className="text-xs text-gray-400">({item.reviews})</span>
            </div>
          </div>
          <p className="mt-1 text-xs font-semibold text-[#FFA72F]">✦ Proveedor Certificado Totalpars</p>
          <p className="mt-3 text-sm leading-6 text-gray-500">{item.descripcion}</p>
          <div className="mt-4 space-y-2">
            {[
              { label: "Ciudad", value: item.ciudad },
              { label: "Capacidad", value: item.capacidad },
              { label: "Disponib.", value: item.disponibilidad },
              { label: "Precio", value: item.precio },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-3 rounded-xl bg-gray-50 px-3 py-2">
                <span className="w-20 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</span>
                <span className="text-sm text-gray-700">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {item.tipos.map((t) => (
              <span key={t} className="rounded-full border border-[#FFD08A] bg-[#FFF8EC] px-2.5 py-1 text-xs font-medium text-[#e8920a]">{t}</span>
            ))}
          </div>
          <a
            href={`https://wa.me/57${item.telefono}?text=Hola,%20vi%20su%20maquinaria%20en%20Totalpars%20y%20quisiera%20cotizar`}
            target="_blank" rel="noreferrer"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFA72F] py-3 text-sm font-bold text-white transition-colors hover:bg-[#e8920a]"
          >
            Solicitar cotización por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

export default function MaquinariaGrid({ equipos = EQUIPOS }: { equipos?: Equipo[] }) {
  const [selected, setSelected] = useState<Equipo | null>(null);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {equipos.map((eq) => (
          <button
            key={eq.nombre}
            type="button"
            onClick={() => setSelected(eq)}
            className="group flex flex-col rounded-2xl border border-black/6 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            {/* Foto */}
            <div className="relative h-40 w-full overflow-hidden rounded-t-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={eq.foto} alt={eq.nombre} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[#FFA72F] px-2 py-0.5 text-[10px] font-bold text-white">
                ✓ EQUIPO CERTIFICADO
              </span>
            </div>

            {/* Avatar sobre la imagen */}
            <div className="relative px-4">
              <div
                className="-mt-5 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-xs font-black text-white shadow-md"
                style={{ backgroundColor: eq.color }}
              >
                {eq.logo}
              </div>
            </div>

            {/* Contenido */}
            <div className="flex flex-1 flex-col px-4 pb-4 pt-2">
              <div className="flex items-start justify-between gap-1">
                <p className="font-black text-[#16384f] leading-tight">{eq.nombre}</p>
                <div className="flex shrink-0 items-center gap-0.5">
                  <Stars rating={eq.rating} />
                  <span className="text-sm font-bold text-[#16384f]">{eq.rating}</span>
                </div>
              </div>
              <p className="mt-0.5 text-xs text-gray-400">({eq.reviews} reseñas)</p>
              <p className="mt-1 text-xs font-semibold text-[#FFA72F]">✦ Proveedor Certificado Totalpars</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {eq.tipos.map((t) => (
                  <span key={t} className="flex items-center gap-1 rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-600">{t}</span>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-black/6 pt-3">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  📍 {eq.ciudad}
                </span>
                <span className="text-xs font-bold text-[#FFA72F]">{eq.precio}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selected && <Modal item={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
