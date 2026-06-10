"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Slide = {
  id: number;
  title: string;
  titleHighlight: string;
  cta: { label: string; href: string } | null;
  href?: string;
  image: string;
  textAlign: "left" | "right";
  darkText?: boolean;
  titleSize?: string;
  rightPanel?: {
    lines: { text: string; orange?: boolean }[];
    cta: { label: string; href: string };
  };
};

const slides: Slide[] = [
  {
    id: 1,
    title: "",
    titleHighlight: "",
    cta: null,
    image: "/hero-banner-slide1-new.jpg",
    textAlign: "left",
    darkText: true,
  },
  {
    id: 2,
    title: "",
    titleHighlight: "",
    cta: null,
    href: "/categorias",
    image: "/hero-banner-2.jpg",
    textAlign: "left",
    darkText: false,
  },
  {
    id: 3,
    title: "",
    titleHighlight: "",
    cta: null,
    image: "/hero-banner-3.jpg",
    textAlign: "right",
    darkText: true,
  },
];

const AUTO_PLAY_MS = 8000;

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);

  pausedRef.current = paused;

  const goTo = (i: number) => setCurrent((i + slides.length) % slides.length);
  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) {
        setCurrent((c) => (c + 1) % slides.length);
      }
    }, AUTO_PLAY_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      className="relative overflow-hidden text-white"
      style={{ height: "clamp(200px, 31.25vw, 540px)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Fondo negro por defecto */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "#05070a" }} />

      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            opacity: i === current ? 1 : 0,
            transition: "opacity 700ms ease-in-out",
            zIndex: i === current ? 1 : 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.image}
            alt=""
            loading={i === 0 ? "eager" : "lazy"}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
          />

          {slide.href && (
            <Link
              href={slide.href}
              aria-label="Ver catálogo"
              style={{ position: "absolute", inset: 0, zIndex: 2 }}
            />
          )}

          <div style={{ position: "relative", zIndex: 1 }} className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-8 py-12 sm:py-16 md:py-20">
            <div className={slide.textAlign === "right" ? "ml-auto max-w-sm text-right md:max-w-lg" : "max-w-xl"}>
              <h1
                className={`mb-4 font-extrabold uppercase leading-tight ${slide.titleSize ?? "text-3xl md:text-5xl"} ${
                  slide.darkText ? "text-[#0d1b2a]" : "text-white"
                }`}
              >
                {slide.title}{" "}
                <span className="whitespace-pre-line text-[#ed8435]">
                  {slide.titleHighlight}
                </span>
              </h1>

              {slide.cta && (
                <Link
                  href={slide.cta.href}
                  className="inline-flex items-center gap-2 rounded bg-[#ed8435] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#d4722a]"
                >
                  {slide.cta.label}
                  <span className="text-base">›</span>
                </Link>
              )}
            </div>

            {slide.rightPanel && (
              <div className="absolute bottom-10 right-6 hidden flex-col items-end gap-4 text-right md:flex lg:right-12">
                <p className="text-base font-extrabold uppercase leading-snug lg:text-lg">
                  {slide.rightPanel.lines.map((line, j) => (
                    <span key={j} className={`block ${line.orange ? "text-[#ed8435]" : "text-white"}`}>
                      {line.text}
                    </span>
                  ))}
                </p>
                <Link
                  href={slide.rightPanel.cta.href}
                  className="inline-flex items-center gap-2 rounded bg-[#ed8435] px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#d4722a]"
                >
                  {slide.rightPanel.cta.label}
                  <span className="text-base">›</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Controles */}
      <div style={{ position: "relative", zIndex: 10, pointerEvents: "none", height: "100%" }}>
        <button
          type="button"
          aria-label="Banner anterior"
          onClick={prev}
          style={{ pointerEvents: "auto" }}
          className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/25 text-2xl transition-colors duration-200 hover:border-[#ed8435] hover:text-[#ed8435]"
        >
          ‹
        </button>

        <button
          type="button"
          aria-label="Banner siguiente"
          onClick={next}
          style={{ pointerEvents: "auto" }}
          className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/25 text-2xl transition-colors duration-200 hover:border-[#ed8435] hover:text-[#ed8435]"
        >
          ›
        </button>

        <div style={{ pointerEvents: "auto" }} className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Ir al banner ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-3 rounded-full transition-all duration-300 ${
                current === i ? "w-10 bg-[#ed8435]" : "w-3 bg-white/60 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
