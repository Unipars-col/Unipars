"use client";

import { useState } from "react";
import MaquinariaGrid, { EQUIPOS } from "./maquinaria-grid";

const CIUDADES = ["Todas", "Bogotá, D.C.", "Medellín", "Cali", "Barranquilla", "Bucaramanga", "Manizales"];
const TIPOS = ["Todos", "Retroexcavadora", "Grúa", "Compactadora", "Bulldozer", "Minicargador", "Pluma hidráulica", "Vibro compactador"];
const DISPONIBILIDAD = ["Todos", "Inmediata", "1-2 días", "2-3 días"];

export default function BuscadorMaquinaria() {
  const [ciudad, setCiudad] = useState("Todas");
  const [tipo, setTipo] = useState("Todos");
  const [disponibilidad, setDisponibilidad] = useState("Todos");
  const [resultados, setResultados] = useState(EQUIPOS);
  const [buscado, setBuscado] = useState(false);

  function buscar() {
    let filtrados = EQUIPOS;
    if (ciudad !== "Todas") filtrados = filtrados.filter((e) => e.ciudad === ciudad);
    if (tipo !== "Todos") filtrados = filtrados.filter((e) => e.tipos.some((t) => t.toLowerCase().includes(tipo.toLowerCase())));
    if (disponibilidad !== "Todos") filtrados = filtrados.filter((e) => e.disponibilidad.toLowerCase().includes(disponibilidad.toLowerCase()));
    setResultados(filtrados);
    setBuscado(true);
    document.getElementById("resultados-maquinaria")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function limpiar() {
    setCiudad("Todas"); setTipo("Todos"); setDisponibilidad("Todos");
    setResultados(EQUIPOS); setBuscado(false);
  }

  return (
    <>
      <section className="relative overflow-hidden py-16" style={{ background: "#eab308" }}>
        <div className="pointer-events-none absolute inset-0">
        </div>

        <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="mb-10 text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.3em] text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              Alquiler de maquinaria
            </span>
            <h2 className="mt-4 text-4xl font-black leading-tight tracking-tight text-white md:text-5xl">
              Encuentra el equipo
              <span className="block">perfecto para tu proyecto.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base font-medium text-white/80">
              Maquinaria <strong className="text-white">certificada y disponible</strong> en todo el país con o sin operador.
            </p>
          </div>

          <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-white shadow-[0_32px_80px_rgba(0,0,0,0.2)]">
            <div className="h-1 w-full bg-[#eab308]" />
            <div className="p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end">
                <div className="flex-1">
                  <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#6b7280]">
                    <svg className="h-3.5 w-3.5 text-[#eab308]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    Ciudad
                  </label>
                  <select value={ciudad} onChange={(e) => setCiudad(e.target.value)} className="w-full rounded-xl border border-black/10 bg-[#f9f9f9] px-4 py-4 text-sm font-semibold text-[#1f2328] focus:border-[#eab308] focus:outline-none focus:ring-2 focus:ring-[#eab308]/25">
                    {CIUDADES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="hidden h-14 w-px bg-black/8 lg:block" />
                <div className="flex-1">
                  <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#6b7280]">
                    <svg className="h-3.5 w-3.5 text-[#eab308]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                    Tipo de maquinaria
                  </label>
                  <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full rounded-xl border border-black/10 bg-[#f9f9f9] px-4 py-4 text-sm font-semibold text-[#1f2328] focus:border-[#eab308] focus:outline-none focus:ring-2 focus:ring-[#eab308]/25">
                    {TIPOS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="hidden h-14 w-px bg-black/8 lg:block" />
                <div className="flex-1">
                  <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#6b7280]">
                    <svg className="h-3.5 w-3.5 text-[#eab308]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    Disponibilidad
                  </label>
                  <select value={disponibilidad} onChange={(e) => setDisponibilidad(e.target.value)} className="w-full rounded-xl border border-black/10 bg-[#f9f9f9] px-4 py-4 text-sm font-semibold text-[#1f2328] focus:border-[#eab308] focus:outline-none focus:ring-2 focus:ring-[#eab308]/25">
                    {DISPONIBILIDAD.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <button onClick={buscar} className="flex-shrink-0 rounded-xl bg-[#d97706] px-10 py-4 text-sm font-black uppercase tracking-wider text-white shadow-[0_8px_32px_rgba(217,119,6,0.4)] transition-all hover:-translate-y-1 hover:bg-[#b45309] active:translate-y-0">
                  Buscar
                  <svg className="ml-2 inline h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="resultados-maquinaria" className="bg-white py-14">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#16384f] sm:text-3xl">
              {buscado ? "Resultados de búsqueda" : "Maquinaria disponible"}
            </h2>
            <span className="text-sm text-gray-400">{resultados.length} equipos encontrados</span>
          </div>

          {buscado && (ciudad !== "Todas" || tipo !== "Todos" || disponibilidad !== "Todos") && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-400">Filtros:</span>
              {ciudad !== "Todas" && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">📍 {ciudad}</span>}
              {tipo !== "Todos" && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">🏗️ {tipo}</span>}
              {disponibilidad !== "Todos" && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">📅 {disponibilidad}</span>}
              <button onClick={limpiar} className="text-xs text-gray-400 underline hover:text-gray-600">Limpiar filtros</button>
            </div>
          )}

          {resultados.length === 0 ? (
            <div className="mt-16 flex flex-col items-center justify-center text-center">
              <span className="text-5xl">🔍</span>
              <h3 className="mt-4 text-lg font-bold text-[#16384f]">No encontramos equipos con esos filtros</h3>
              <p className="mt-2 text-sm text-gray-500">Intenta cambiar la ciudad o el tipo de maquinaria.</p>
              <button onClick={limpiar} className="mt-5 rounded-full bg-amber-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-amber-700">Ver toda la maquinaria</button>
            </div>
          ) : (
            <MaquinariaGrid equipos={resultados} />
          )}
        </div>
      </section>
    </>
  );
}
