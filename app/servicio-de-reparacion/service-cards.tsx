"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type React from "react";

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
    glow: "rgba(237,132,53,0.28)",
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
    glow: "rgba(22,163,74,0.28)",
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
    glow: "rgba(217,119,6,0.28)",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20h20M6 20V10l6-7 6 7v10M10 20v-5h4v5M17 8h4v5" />
      </svg>
    ),
    features: ["Retroexcavadora", "Grúa", "Compactadora", "Con operador"],
  },
];

export default function ServiceCards() {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s, idx) => {
        const isHovered = hovered === idx;
        const delay = idx * 130;

        const cardStyle: React.CSSProperties = {
          opacity: visible ? 1 : 0,
          transform: isHovered
            ? "translateY(-20px) scale(1.02)"
            : visible
              ? "translateY(0px) scale(1)"
              : "translateY(32px) scale(1)",
          transition: `
            opacity 0.55s cubic-bezier(0.22,1,0.36,1) ${visible ? 0 : delay}ms,
            transform ${isHovered ? "0.3s cubic-bezier(0.34,1.5,0.64,1)" : visible ? "0.3s cubic-bezier(0.34,1.5,0.64,1)" : `0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms`},
            box-shadow 0.3s ease,
            border-color 0.3s ease
          `,
          boxShadow: isHovered
            ? `0 28px 60px ${s.glow}`
            : "0 4px 16px rgba(15,23,42,0.06)",
          borderColor: isHovered ? `${s.accent}55` : "rgba(0,0,0,0.06)",
        };

        const iconStyle: React.CSSProperties = {
          backgroundColor: s.bg,
          color: s.accent,
          transform: isHovered ? "scale(1.22) rotate(-7deg)" : "scale(1) rotate(0deg)",
          transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        };

        return (
          <Link
            key={s.href}
            href={s.href}
            onMouseEnter={() => setHovered(idx)}
            onMouseLeave={() => setHovered(null)}
            className="flex flex-col rounded-2xl border bg-white p-7"
            style={cardStyle}
          >
            <div
              className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
              style={iconStyle}
            >
              {s.icon}
            </div>

            <p
              className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em]"
              style={{ color: `${s.accent}b3` }}
            >
              {s.tag}
            </p>

            <h2 className="mb-2 text-lg font-bold text-[#0d1b2a]">{s.title}</h2>

            <p className="mb-5 text-sm leading-6 text-[#6b7280]">{s.description}</p>

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

            <div
              className="mt-auto flex items-center gap-2 text-sm font-semibold"
              style={{ color: s.accent }}
            >
              {s.cta}
              <svg
                className="h-4 w-4"
                style={{
                  transform: isHovered ? "translateX(5px)" : "translateX(0)",
                  transition: "transform 0.25s ease",
                }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
