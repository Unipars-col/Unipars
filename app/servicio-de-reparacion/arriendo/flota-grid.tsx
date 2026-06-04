"use client";

import { useState } from "react";

type Vehiculo = {
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

const VEHICULOS: Vehiculo[] = [
  {
    nombre: "Flota Urbana Bogotá",
    logo: "FU",
    color: "#16a34a",
    foto: "/hero-banner-transmilenio-v2.jpg",
    rating: 4.9,
    reviews: 84,
    tipos: ["Bus urbano", "Intermunicipal"],
    ciudad: "Bogotá, D.C.",
    precio: "Desde $350.000/día",
    verificado: true,
    descripcion: "Flota de buses modernos para transporte urbano y servicios especiales. Conductores certificados y vehículos con soat y tecnicomecánica al día.",
    telefono: "3101234567",
    capacidad: "Hasta 45 pasajeros",
    disponibilidad: "Inmediata",
  },
  {
    nombre: "Trans Andina S.A.S",
    logo: "TA",
    color: "#15803d",
    foto: "/hero-banner-2.png",
    rating: 4.8,
    reviews: 61,
    tipos: ["Bus intermunicipal", "Camión de carga"],
    ciudad: "Medellín",
    precio: "Desde $600.000/día",
    verificado: true,
    descripcion: "Empresa con más de 20 años en transporte intermunicipal y carga. Cobertura en Antioquia y eje cafetero.",
    telefono: "3209876543",
    capacidad: "Hasta 50 pasajeros",
    disponibilidad: "1-2 días",
  },
  {
    nombre: "LogiCarga Nacional",
    logo: "LC",
    color: "#166534",
    foto: "/hero-banner-3.png",
    rating: 4.7,
    reviews: 49,
    tipos: ["Camión de carga", "Tractocamión"],
    ciudad: "Cali",
    precio: "Desde $450.000/día",
    verificado: true,
    descripcion: "Soluciones de logística y carga para empresas. Camiones con seguimiento GPS y seguro de mercancía incluido.",
    telefono: "3154321098",
    capacidad: "Hasta 10 toneladas",
    disponibilidad: "Inmediata",
  },
  {
    nombre: "Microbus Express",
    logo: "ME",
    color: "#14532d",
    foto: "/hero-banner-transmilenio-v2.jpg",
    rating: 4.6,
    reviews: 37,
    tipos: ["Microbús", "Camioneta doble cabina"],
    ciudad: "Bogotá, D.C.",
    precio: "Desde $180.000/día",
    verificado: true,
    descripcion: "Especialistas en traslados corporativos y eventos. Vehículos confortables con conductor profesional.",
    telefono: "3187654321",
    capacidad: "Hasta 19 pasajeros",
    disponibilidad: "Inmediata",
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 text-[#ed8435]" fill="currentColor">
      <path d="M8 1l1.9 3.8 4.2.6-3 3 .7 4.2L8 10.5l-3.8 2.1.7-4.2-3-3 4.2-.6z" />
    </svg>
  );
}

function Modal({ item, onClose }: { item: Vehiculo; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative h-40 w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.foto} alt={item.nombre} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button onClick={onClose} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/40">✕</button>
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-green-700 px-2.5 py-1 text-[10px] font-bold text-white">
            ✓ FLOTA VERIFICADA
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
          <p className="mt-1 text-xs font-semibold text-green-700">✦ Aliado Verificado Unipars</p>
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
              <span key={t} className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">{t}</span>
            ))}
          </div>
          <a
            href={`https://wa.me/57${item.telefono}?text=Hola,%20vi%20su%20flota%20en%20Unipars%20y%20quisiera%20cotizar`}
            target="_blank" rel="noreferrer"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 py-3 text-sm font-bold text-white transition-colors hover:bg-green-800"
          >
            Solicitar cotización por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

export default function FlotaGrid() {
  const [selected, setSelected] = useState<Vehiculo | null>(null);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {VEHICULOS.map((v) => (
          <button
            key={v.nombre}
            type="button"
            onClick={() => setSelected(v)}
            className="group flex flex-col overflow-hidden rounded-2xl border border-black/6 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            {/* Foto */}
            <div className="relative h-40 w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={v.foto} alt={v.nombre} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-green-700 px-2 py-0.5 text-[10px] font-bold text-white">
                ✓ FLOTA VERIFICADA
              </span>
              {/* Logo círculo */}
              <div
                className="absolute -bottom-5 left-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-xs font-black text-white shadow-md"
                style={{ backgroundColor: v.color }}
              >
                {v.logo}
              </div>
            </div>

            {/* Contenido */}
            <div className="flex flex-1 flex-col px-4 pb-4 pt-7">
              <div className="flex items-start justify-between gap-1">
                <p className="font-black text-[#16384f] leading-tight">{v.nombre}</p>
                <div className="flex shrink-0 items-center gap-0.5">
                  <Stars rating={v.rating} />
                  <span className="text-sm font-bold text-[#16384f]">{v.rating}</span>
                </div>
              </div>
              <p className="mt-0.5 text-xs text-gray-400">({v.reviews} reseñas)</p>
              <p className="mt-1 text-xs font-semibold text-green-700">✦ Aliado Verificado Unipars</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {v.tipos.map((t) => (
                  <span key={t} className="flex items-center gap-1 rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-600">{t}</span>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-black/6 pt-3">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  📍 {v.ciudad}
                </span>
                <span className="text-xs font-bold text-green-700">{v.precio}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selected && <Modal item={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
