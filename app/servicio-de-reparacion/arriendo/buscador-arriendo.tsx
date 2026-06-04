"use client";

import { useState } from "react";
import FlotaGrid, { VEHICULOS } from "./flota-grid";

const CIUDADES = ["Todas", "Bogotá, D.C.", "Medellín", "Cali", "Barranquilla", "Bucaramanga", "Manizales"];
const TIPOS = ["Todos", "Bus urbano", "Bus intermunicipal", "Buseta", "Minibús", "Camión de carga", "Camioneta"];
const CONDUCTOR = ["Todos", "Con conductor", "Sin conductor"];

export default function BuscadorArriendo() {
  const [ciudad, setCiudad] = useState("Todas");
  const [tipo, setTipo] = useState("Todos");
  const [conductor, setConductor] = useState("Todos");
  const [resultados, setResultados] = useState(VEHICULOS);
  const [buscado, setBuscado] = useState(false);

  function buscar() {
    let filtrados = VEHICULOS;
    if (ciudad !== "Todas") filtrados = filtrados.filter((v) => v.ciudad === ciudad);
    if (tipo !== "Todos") filtrados = filtrados.filter((v) => v.tipos.some((t) => t.toLowerCase().includes(tipo.toLowerCase())));
    setResultados(filtrados);
    setBuscado(true);
    document.getElementById("resultados-arriendo")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function limpiar() {
    setCiudad("Todas"); setTipo("Todos"); setConductor("Todos");
    setResultados(VEHICULOS); setBuscado(false);
  }

  const accentGreen = "#16a34a";

  return (
    <>
      <section className="relative overflow-hidden py-16" style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d2010 50%, #0a1628 100%)" }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full blur-[100px]" style={{ backgroundColor: `${accentGreen}18` }} />
          <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-[80px]" style={{ backgroundColor: `${accentGreen}14` }} />
          <div className="absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-green-600/30 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="mb-10 text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.3em] text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              Flota disponible
            </span>
            <h2 className="mt-4 text-4xl font-black leading-tight tracking-tight text-white md:text-5xl">
              Encuentra el vehículo
              <span className="block text-green-400">ideal para tu operación.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/50">
              Flota <strong className="text-white/80">verificada y disponible</strong> en todo el país con o sin conductor.
            </p>
          </div>

          <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-[0_32px_80px_rgba(0,0,0,0.4)] backdrop-blur-md">
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-green-500 to-transparent" />
            <div className="p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end">
                <div className="flex-1">
                  <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50">
                    <svg className="h-3.5 w-3.5 text-green-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    Ciudad
                  </label>
                  <select value={ciudad} onChange={(e) => setCiudad(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/8 px-4 py-4 text-sm font-semibold text-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/25">
                    {CIUDADES.map((c) => <option key={c} className="bg-[#0d1b2a]">{c}</option>)}
                  </select>
                </div>
                <div className="hidden h-14 w-px bg-white/10 lg:block" />
                <div className="flex-1">
                  <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50">
                    <svg className="h-3.5 w-3.5 text-green-400" fill="currentColor" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
                    Tipo de vehículo
                  </label>
                  <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/8 px-4 py-4 text-sm font-semibold text-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/25">
                    {TIPOS.map((t) => <option key={t} className="bg-[#0d1b2a]">{t}</option>)}
                  </select>
                </div>
                <div className="hidden h-14 w-px bg-white/10 lg:block" />
                <div className="flex-1">
                  <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50">
                    <svg className="h-3.5 w-3.5 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    Conductor
                  </label>
                  <select value={conductor} onChange={(e) => setConductor(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/8 px-4 py-4 text-sm font-semibold text-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/25">
                    {CONDUCTOR.map((c) => <option key={c} className="bg-[#0d1b2a]">{c}</option>)}
                  </select>
                </div>
                <button onClick={buscar} className="flex-shrink-0 rounded-xl bg-green-600 px-10 py-4 text-sm font-black uppercase tracking-wider text-white shadow-[0_8px_32px_rgba(22,163,74,0.5)] transition-all hover:-translate-y-1 hover:bg-green-700 active:translate-y-0">
                  Buscar
                  <svg className="ml-2 inline h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="resultados-arriendo" className="bg-white py-14">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#16384f] sm:text-3xl">
              {buscado ? "Resultados de búsqueda" : "Flota disponible"}
            </h2>
            <span className="text-sm text-gray-400">{resultados.length} proveedores encontrados</span>
          </div>

          {buscado && (ciudad !== "Todas" || tipo !== "Todos") && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-400">Filtros:</span>
              {ciudad !== "Todas" && <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">📍 {ciudad}</span>}
              {tipo !== "Todos" && <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">🚌 {tipo}</span>}
              <button onClick={limpiar} className="text-xs text-gray-400 underline hover:text-gray-600">Limpiar filtros</button>
            </div>
          )}

          {resultados.length === 0 ? (
            <div className="mt-16 flex flex-col items-center justify-center text-center">
              <span className="text-5xl">🔍</span>
              <h3 className="mt-4 text-lg font-bold text-[#16384f]">No encontramos vehículos con esos filtros</h3>
              <p className="mt-2 text-sm text-gray-500">Intenta cambiar la ciudad o el tipo de vehículo.</p>
              <button onClick={limpiar} className="mt-5 rounded-full bg-green-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-green-700">Ver toda la flota</button>
            </div>
          ) : (
            <FlotaGrid vehiculos={resultados} />
          )}
        </div>
      </section>
    </>
  );
}
