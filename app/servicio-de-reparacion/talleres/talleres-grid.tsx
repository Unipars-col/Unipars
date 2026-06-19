"use client";

import React, { useState } from "react";

function CalificarModal({ taller, onClose }: { taller: Taller; onClose: () => void }) {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async () => {
    if (stars === 0) return;
    setEnviando(true);
    await new Promise((r) => setTimeout(r, 700));
    setEnviando(false);
    setEnviado(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">✕</button>

        <div className="p-6">
          {enviado ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 text-2xl">✓</div>
              <h3 className="text-lg font-black text-[#16384f]">¡Gracias por tu calificación!</h3>
              <p className="mt-2 text-sm text-gray-500">Tu opinión ayuda a otros clientes a elegir mejor.</p>
              <button onClick={onClose} className="mt-5 w-full rounded-xl bg-[#16384f] py-2.5 text-sm font-bold text-white hover:bg-[#0d2535] transition-colors">
                Cerrar
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#ed8435]">Calificar taller</p>
              <h3 className="mt-1 text-lg font-black text-[#16384f]">{taller.nombre}</h3>

              <p className="mt-4 mb-2 text-sm font-semibold text-gray-600">¿Cómo fue tu experiencia?</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseEnter={() => setHover(s)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setStars(s)}
                    className="transition-transform hover:scale-110"
                  >
                    <svg viewBox="0 0 24 24" className="h-9 w-9" fill={(hover || stars) >= s ? "#ed8435" : "none"} stroke="#ed8435" strokeWidth="1.5">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                ))}
              </div>
              {stars > 0 && (
                <p className="mt-1 text-xs text-[#ed8435] font-semibold">
                  {["", "Muy malo", "Regular", "Bueno", "Muy bueno", "Excelente"][stars]}
                </p>
              )}

              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={3}
                placeholder="Cuéntanos tu experiencia (opcional)..."
                className="mt-4 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#ed8435] resize-none"
              />

              <button
                onClick={handleSubmit}
                disabled={stars === 0 || enviando}
                className="mt-3 w-full rounded-xl bg-[#ed8435] py-3 text-sm font-bold text-white transition-colors hover:bg-[#d67024] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {enviando ? "Enviando..." : "Enviar calificación"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export type Taller = {
  nombre: string;
  logo: string;
  color: string;
  foto: string;
  rating: number;
  reviews: number;
  servicios: string[];
  ciudad: string;
  distancia: string;
  verificado: boolean;
  descripcion: string;
  telefono: string;
  horario: string;
  direccion: string;
  experiencia: string;
  clientes: string;
  statLabel?: string;
};

const SERVICIO_ICONS: Record<string, React.ReactElement> = {
  default: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />,
  Motor: <path d="M19 7h-1V5h-4v2H10V5H6v2H5c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-7 9c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />,
  Frenos: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-12c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />,
  Electricidad: <path d="M7 2v11h3v9l7-12h-4l4-8z" />,
  Alarmas: <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />,
  Latonería: <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />,
  Pintura: <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34a1 1 0 00-1.41 0L9 12.25 11.75 15l8.96-8.96a1 1 0 000-1.41z" />,
  Transmisión: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z" />,
  Neumáticos: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />,
};

function ServiceIcon({ servicio }: { servicio: string }) {
  const key = Object.keys(SERVICIO_ICONS).find((k) => servicio.toLowerCase().includes(k.toLowerCase())) ?? "default";
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor">
      {SERVICIO_ICONS[key]}
    </svg>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 text-[#ed8435]" fill="currentColor">
      <path d="M8 1l1.9 3.8 4.2.6-3 3 .7 4.2L8 10.5l-3.8 2.1.7-4.2-3-3 4.2-.6z" />
    </svg>
  );
}

function PerfilModal({ taller, onClose }: { taller: Taller; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Photo header */}
        <div className="relative h-40 w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={taller.foto} alt={taller.nombre} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button onClick={onClose} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/40">✕</button>
          {taller.verificado && (
            <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[#16384f] px-2.5 py-1 text-[10px] font-bold text-white">
              ✓ TALLER VERIFICADO
            </span>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-black text-[#16384f]">{taller.nombre}</h3>
            <div className="flex flex-shrink-0 items-center gap-1">
              <Stars rating={taller.rating} />
              <span className="text-sm font-bold text-[#16384f]">{taller.rating}</span>
              <span className="text-xs text-gray-400">({taller.reviews})</span>
            </div>
          </div>

          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#ed8435]">
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor"><path d="M8 1a5 5 0 00-4 8l4 6 4-6a5 5 0 00-4-8zm0 7a2 2 0 110-4 2 2 0 010 4z"/></svg>
            Aliado Oficial Uniparceros
          </p>

          <p className="mt-3 text-sm leading-6 text-gray-500">{taller.descripcion}</p>

          <div className="mt-4 space-y-2">
            {[
              { label: "Dirección", value: `${taller.direccion}, ${taller.ciudad}` },
              { label: "Teléfono", value: taller.telefono },
              { label: "Horario", value: taller.horario },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-3 rounded-xl bg-gray-50 px-3 py-2">
                <span className="w-20 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</span>
                <span className="text-sm text-gray-700">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {taller.servicios.map((s) => (
              <span key={s} className="flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600">
                <ServiceIcon servicio={s} /> {s}
              </span>
            ))}
          </div>

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${taller.direccion}, ${taller.ciudad}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-[#16384f] hover:bg-gray-50 transition-colors"
          >
            📍 Cómo llegar
          </a>

          <a
            href={`https://wa.me/57${taller.telefono.replace(/\D/g, "")}?text=Hola,%20vi%20su%20taller%20en%20Uniparceros%20y%20quisiera%20más%20información`}
            target="_blank" rel="noopener noreferrer"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#16384f] py-3 text-sm font-bold text-white hover:bg-[#0d2535] transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.34.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.89.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35zM12 2a10 10 0 00-8.45 15.28L2 22l4.86-1.52A10 10 0 1012 2z" />
            </svg>
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

export default function TalleresGrid({ talleres }: { talleres: Taller[] }) {
  const [perfilAbierto, setPerfilAbierto] = useState<Taller | null>(null);
  const [calificandoTaller, setCalificandoTaller] = useState<Taller | null>(null);

  return (
    <>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {talleres.map((taller) => (
          <div
            key={taller.nombre}
            className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.14)]"
          >
            {/* ── Foto header ── */}
            <div className="relative flex-shrink-0">
              {/* Foto con clip */}
              <div className="relative h-44 w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={taller.foto} alt={taller.nombre} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Badge verificado */}
                {taller.verificado && (
                  <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[#16384f] px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                      <path d="M10 3L5 9 2 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    TALLER VERIFICADO
                  </span>
                )}

                {/* Corazón */}
                <button className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-400 shadow hover:text-red-500 transition-colors">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                </button>
              </div>

              {/* Logo circular — fuera del contenedor overflow-hidden */}
              <div
                className="absolute -bottom-5 left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white text-xs font-black text-white shadow-md"
                style={{ backgroundColor: taller.color }}
              >
                {taller.logo}
              </div>
            </div>

            {/* ── Contenido ── */}
            <div className="flex flex-1 flex-col px-4 pb-4 pt-8">
              {/* Nombre + rating en misma fila */}
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-black leading-tight text-[#16384f]">{taller.nombre}</h3>
                <div className="flex shrink-0 items-center gap-1">
                  <Stars rating={taller.rating} />
                  <span className="text-sm font-bold text-[#16384f]">{taller.rating}</span>
                </div>
              </div>
              <div className="mt-0.5 flex items-center justify-between">
                <p className="text-[11px] text-gray-400">({taller.reviews} reseñas)</p>
              </div>

              {/* Aliado badge */}
              <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[#ed8435]">
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" fill="currentColor">
                  <path d="M8 1L6 5H2l3 2.5-1 4L8 9l4 2.5-1-4L14 5h-4z"/>
                </svg>
                Aliado Oficial Uniparceros
              </p>

              {/* Servicios chips */}
              <div className="mt-2.5 flex min-h-[52px] flex-wrap content-start gap-1.5 overflow-hidden">
                {taller.servicios.slice(0, 4).map((s) => (
                  <span key={s} className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-600 whitespace-nowrap">
                    <ServiceIcon servicio={s} /> {s}
                  </span>
                ))}
                {taller.servicios.length > 4 && (
                  <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-[#ed8435] whitespace-nowrap">
                    +{taller.servicios.length - 4}
                  </span>
                )}
              </div>

              {/* Ubicación */}
              <div className="mt-2.5 flex items-center justify-between border-t border-gray-100 pt-2.5 text-xs">
                <span className="flex items-center gap-1 text-gray-500">
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" fill="currentColor">
                    <path d="M8 1a5 5 0 00-5 5c0 3.5 5 9 5 9s5-5.5 5-9a5 5 0 00-5-5zm0 7a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                  {taller.ciudad}
                </span>
                <span className="font-bold text-[#ed8435]">{taller.distancia}</span>
              </div>

              {/* Stats */}
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-500">
                  <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-[#ed8435]" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <div>
                    <p className="font-bold text-[#16384f]">{taller.experiencia}</p>
                    <p className="text-[10px] leading-tight">de experiencia</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-500">
                  <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-[#ed8435]" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                  </svg>
                  <div>
                    <p className="font-bold text-[#16384f]">{taller.clientes}</p>
                    <p className="text-[10px] leading-tight">clientes atendidos</p>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="mt-3 grid grid-cols-[1fr_40px_1fr] items-stretch gap-2">
                <button
                  onClick={() => setPerfilAbierto(taller)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-[#16384f] transition-colors hover:border-[#16384f] hover:bg-[#16384f] hover:text-white"
                >
                  <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="currentColor">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                  </svg>
                  Ver perfil
                </button>
                <button
                  onClick={() => setCalificandoTaller(taller)}
                  className="inline-flex items-center justify-center rounded-xl border border-[#ed8435]/40 text-[#ed8435] transition-colors hover:bg-[#ed8435] hover:text-white"
                  title="Calificar taller"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </button>
                <a
                  href={`https://wa.me/57${taller.telefono.replace(/\D/g, "")}?text=Hola,%20vi%20su%20taller%20en%20Uniparceros`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-[#16384f] py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor">
                    <path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.34.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.89.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35zM12 2a10 10 0 00-8.45 15.28L2 22l4.86-1.52A10 10 0 1012 2z" />
                  </svg>
                  Contactar
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>


      {perfilAbierto && (
        <PerfilModal taller={perfilAbierto} onClose={() => setPerfilAbierto(null)} />
      )}

      {calificandoTaller && (
        <CalificarModal taller={calificandoTaller} onClose={() => setCalificandoTaller(null)} />
      )}
    </>
  );
}
