"use client";

import { useState } from "react";
import TalleresGrid, { type Taller } from "./talleres-grid";

const CIUDADES = ["Todas", "Bogotá, D.C.", "Medellín", "Cali", "Barranquilla", "Bucaramanga", "Manizales"];
const VEHICULOS = ["Todos", "Camión", "Bus", "Buseta", "Van de carga", "Automóvil"];
const SERVICIOS = [
  "Todos",
  "Frenos",
  "Motor",
  "Suspensión",
  "Electricidad",
  "Latonería y Pintura",
  "ABS",
  "Transmisión",
  "Aire acondicionado",
  "Neumáticos",
  "Vidrios",
  "Mantenimiento preventivo",
];

const SERVICIO_MAP: Record<string, string[]> = {
  "Frenos": ["Frenos", "ABS"],
  "Motor": ["Motor"],
  "Suspensión": ["Suspensión"],
  "Electricidad": ["Electricidad", "Alarmas", "Diagnóstico"],
  "Latonería y Pintura": ["Latonería", "Pintura", "Detallado"],
  "ABS": ["ABS", "Frenos"],
  "Transmisión": ["Transmisión", "Caja de cambios", "Diferencial"],
  "Aire acondicionado": ["Aire acondicionado", "Radiador", "Enfriamiento"],
  "Neumáticos": ["Neumáticos", "Alineación", "Balanceo"],
  "Vidrios": ["Vidrios", "Parabrisas", "Polarizado"],
  "Mantenimiento preventivo": ["Mantenimiento preventivo", "Cambio de aceite", "Filtros"],
};

export default function Buscador({ talleres }: { talleres: Taller[] }) {
  const [ciudad, setCiudad] = useState("Todas");
  const [vehiculo, setVehiculo] = useState("Todos");
  const [servicio, setServicio] = useState("Todos");
  const [resultados, setResultados] = useState<Taller[]>(talleres);
  const [buscado, setBuscado] = useState(false);

  function buscar() {
    let filtrados = talleres;

    if (ciudad !== "Todas") {
      filtrados = filtrados.filter((t) => t.ciudad === ciudad);
    }

    if (servicio !== "Todos") {
      const palabras = SERVICIO_MAP[servicio] ?? [servicio];
      filtrados = filtrados.filter((t) =>
        t.servicios.some((s) =>
          palabras.some((p) => s.toLowerCase().includes(p.toLowerCase()))
        )
      );
    }

    setResultados(filtrados);
    setBuscado(true);

    document.getElementById("resultados")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      {/* ── BUSCADOR ── */}
      <section id="buscar" className="bg-white shadow-sm">
        <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-6 lg:px-8">
          <h2 className="mb-5 text-xl font-bold text-[#16384f]">Encuentra tu aliado</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Ciudad
              </label>
              <select
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[#16384f] focus:border-[#ed8435] focus:outline-none"
              >
                {CIUDADES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Tipo de vehículo
              </label>
              <select
                value={vehiculo}
                onChange={(e) => setVehiculo(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[#16384f] focus:border-[#ed8435] focus:outline-none"
              >
                {VEHICULOS.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Servicio
              </label>
              <select
                value={servicio}
                onChange={(e) => setServicio(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[#16384f] focus:border-[#ed8435] focus:outline-none"
              >
                {SERVICIOS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <button
              onClick={buscar}
              className="flex-shrink-0 rounded-lg bg-[#ed8435] px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-[#d67024]"
            >
              Buscar Taller
            </button>
          </div>
        </div>
      </section>

      {/* ── TALLERES RECOMENDADOS ── */}
      <section id="resultados" className="bg-white py-14">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#16384f] sm:text-3xl">
              {buscado ? "Resultados de búsqueda" : "Talleres recomendados para ti"}
            </h2>
            <span className="text-sm text-gray-400">
              {resultados.length} taller{resultados.length !== 1 ? "es" : ""} encontrado{resultados.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Filtros activos */}
          {buscado && (ciudad !== "Todas" || servicio !== "Todos") && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-400">Filtros:</span>
              {ciudad !== "Todas" && (
                <span className="flex items-center gap-1 rounded-full bg-[#f0f9ff] px-3 py-1 text-xs font-medium text-[#16384f]">
                  📍 {ciudad}
                </span>
              )}
              {servicio !== "Todos" && (
                <span className="flex items-center gap-1 rounded-full bg-[#fff7ed] px-3 py-1 text-xs font-medium text-[#ed8435]">
                  🔧 {servicio}
                </span>
              )}
              <button
                onClick={() => {
                  setCiudad("Todas");
                  setVehiculo("Todos");
                  setServicio("Todos");
                  setResultados(talleres);
                  setBuscado(false);
                }}
                className="text-xs text-gray-400 underline hover:text-gray-600"
              >
                Limpiar filtros
              </button>
            </div>
          )}

          {resultados.length === 0 ? (
            <div className="mt-16 flex flex-col items-center justify-center text-center">
              <span className="text-5xl">🔍</span>
              <h3 className="mt-4 text-lg font-bold text-[#16384f]">No encontramos talleres con esos filtros</h3>
              <p className="mt-2 text-sm text-gray-500">Intenta cambiar la ciudad o el servicio buscado.</p>
              <button
                onClick={() => {
                  setCiudad("Todas");
                  setVehiculo("Todos");
                  setServicio("Todos");
                  setResultados(talleres);
                  setBuscado(false);
                }}
                className="mt-5 rounded-full bg-[#ed8435] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#d67024]"
              >
                Ver todos los talleres
              </button>
            </div>
          ) : (
            <TalleresGrid talleres={resultados} />
          )}
        </div>
      </section>
    </>
  );
}
