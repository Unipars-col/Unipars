import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteFooter from "@/app/components/site-footer";
import BuscadorArriendo from "./buscador-arriendo";

export const metadata: Metadata = {
  title: "Arriendo de buses y camiones — Unipars",
  description: "Arrienda buses urbanos, intermunicipales y camiones de carga en todo Colombia. Flota verificada, con o sin conductor.",
};

const flota = [
  {
    tipo: "Bus urbano",
    emoji: "🚌",
    capacidad: "Hasta 45 pasajeros",
    usos: ["Transporte escolar", "Excursiones", "Rutas empresariales"],
    precio: "Desde $350.000 / día",
    disponible: true,
  },
  {
    tipo: "Bus intermunicipal",
    emoji: "🚍",
    capacidad: "Hasta 50 pasajeros",
    usos: ["Viajes interdepartamentales", "Eventos", "Grupos grandes"],
    precio: "Desde $600.000 / día",
    disponible: true,
  },
  {
    tipo: "Camión de carga",
    emoji: "🚛",
    capacidad: "Hasta 10 toneladas",
    usos: ["Mudanzas", "Carga industrial", "Distribución"],
    precio: "Desde $450.000 / día",
    disponible: true,
  },
  {
    tipo: "Camioneta doble cabina",
    emoji: "🛻",
    capacidad: "Hasta 1 tonelada",
    usos: ["Carga liviana", "Mensajería", "Logística urbana"],
    precio: "Desde $180.000 / día",
    disponible: true,
  },
  {
    tipo: "Microbus",
    emoji: "🚐",
    capacidad: "Hasta 19 pasajeros",
    usos: ["Traslados ejecutivos", "Turismo", "Eventos corporativos"],
    precio: "Desde $220.000 / día",
    disponible: true,
  },
  {
    tipo: "Tractocamión",
    emoji: "🚚",
    capacidad: "Hasta 35 toneladas",
    usos: ["Carga pesada", "Proyectos de obra", "Logística nacional"],
    precio: "Cotizar",
    disponible: false,
  },
];

const pasos = [
  { n: "01", title: "Elige el vehículo", desc: "Selecciona el tipo de vehículo según tu necesidad de capacidad y uso." },
  { n: "02", title: "Define fechas y ruta", desc: "Indica las fechas, origen, destino y si necesitas conductor incluido." },
  { n: "03", title: "Solicita cotización", desc: "Nuestro equipo te envía una propuesta en menos de 2 horas hábiles." },
  { n: "04", title: "Confirma y opera", desc: "Firma el contrato, recibe el vehículo y úsalo con total respaldo." },
];

export default function ArriendoPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f5]">

      {/* Breadcrumb */}
      <div className="border-b border-black/8 bg-white px-6 py-3 text-xs text-[#6b7280]">
        <Link href="/servicio-de-reparacion" className="hover:text-[#0d1b2a]">Servicios</Link>
        <span className="mx-2">›</span>
        <span className="text-[#0d1b2a]">Arriendo de vehículos</span>
      </div>

      {/* Banner */}
      <div className="w-full overflow-hidden">
        <Image
          src="/banner-arriendo-vehiculos.jpg"
          alt="Movemos tu carga de principio a fin — Arriendo de vehículos Unipars"
          width={1920}
          height={540}
          className="w-full object-cover"
          priority
        />
      </div>


      <BuscadorArriendo />

      {/* Cómo funciona */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-[1000px]">
          <h2 className="mb-10 text-center text-2xl font-bold text-[#0d1b2a]">
            Cómo funciona el arriendo
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pasos.map((p) => (
              <div key={p.n} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-xl font-black text-green-600">
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
        style={{ background: "#16384f" }}
      >
        <h2 className="mb-3 text-2xl font-bold text-white">¿Listo para arrendar?</h2>
        <p className="mb-8 text-white/60">Nuestro equipo te ayuda a encontrar el vehículo ideal para tu operación.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="https://wa.me/573057249454?text=Hola%2C%20quiero%20arrendar%20un%20vehículo"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-green-600 px-8 py-3.5 font-semibold text-white transition-all hover:bg-green-700"
          >
            Contactar por WhatsApp
          </a>
          <Link
            href="/registro-arriendo"
            className="rounded-xl border border-white/25 bg-white/10 px-8 py-3.5 font-semibold text-white transition-all hover:bg-white/20"
          >
            ¿Tienes flota? Regístrala gratis →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
