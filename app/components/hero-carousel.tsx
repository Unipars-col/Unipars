"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import Link from "next/link";

type Slide = {
  id: number;
  title: string;
  titleHighlight: string;
  description: string;
  cta: { label: string; href: string } | null;
  image: string;
  textAlign: "left" | "right";
  darkText?: boolean;
  gradient: string;
  titleSize?: string;
  rightPanel?: {
    lines: { text: string; orange?: boolean }[];
    cta: { label: string; href: string };
  };
};

const slides: Slide[] = [
  {
    id: 1,
    title: "UNIPARCEROS,",
    titleHighlight: "ALIADOS EN CADA RUTA",
    description:
      "Encuentra talleres aliados de confianza en todo el país para instalar tus repuestos con seguridad, calidad y garantía.",
    cta: null,
    image: "/hero-banner-transmilenio-v2.jpg",
    textAlign: "left",
    darkText: true,
    gradient: "",
    rightPanel: {
      lines: [
        { text: "MÁS TALLERES," },
        { text: "MÁS SOLUCIONES", orange: true },
        { text: "EN TODO COLOMBIA." },
      ],
      cta: { label: "ENCUENTRA TU TALLER", href: "/servicio-de-reparacion" },
    },
  },
  {
    id: 2,
    title: "EXPERTOS EN MANTENER TU FLOTA",
    titleHighlight: "SIEMPRE EN MARCHA",
    description:
      "Repuestos de calidad para maximizar el rendimiento y la vida útil de cada vehículo.",
    cta: { label: "VER CATÁLOGO", href: "/categorias" },
    image: "/hero-banner-2.png",
    textAlign: "left",
    darkText: false,
    gradient: "",
  },
  {
    id: 3,
    title: "REPUESTOS",
    titleHighlight: "QUE MUEVEN TU NEGOCIO",
    description:
      "Soluciones confiables para el transporte masivo, de carga y de pasajeros.",
    cta: null,
    image: "/hero-banner-3.png",
    textAlign: "right",
    darkText: true,
    gradient: "",
    titleSize: "text-2xl md:text-3xl lg:text-4xl",
  },
];

const AUTO_PLAY_MS = 5000;

// Array con clon del último al inicio y clon del primero al final
// Índices: [0=clonLast, 1=slide1, 2=slide2, 3=slide3, 4=clonFirst]
const loopSlides = [slides[slides.length - 1], ...slides, slides[0]];
const FIRST_REAL = 1;
const LAST_REAL = slides.length;

export default function HeroCarousel() {
  const [index, setIndex] = useState(FIRST_REAL);
  const [transition, setTransition] = useState(true);
  const isSnapping = useRef(false);

  // Índice real para los dots (0-based)
  const dotIndex =
    index === 0 ? slides.length - 1 :
    index === loopSlides.length - 1 ? 0 :
    index - 1;

  const goTo = (i: number) => {
    if (isSnapping.current) return;
    setTransition(true);
    setIndex(i);
  };

  const advanceSlide = () => goTo(index + 1);

  const syncAdvanceSlide = useEffectEvent(() => {
    advanceSlide();
  });

  const goToPrev = () => goTo(index - 1);

  const goToSlide = (dotIdx: number) => goTo(dotIdx + FIRST_REAL);

  // Snap instantáneo cuando llega a un clon
  const handleTransitionEnd = () => {
    if (index === 0) {
      isSnapping.current = true;
      setTransition(false);
      setIndex(LAST_REAL);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransition(true);
          isSnapping.current = false;
        });
      });
    } else if (index === loopSlides.length - 1) {
      isSnapping.current = true;
      setTransition(false);
      setIndex(FIRST_REAL);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransition(true);
          isSnapping.current = false;
        });
      });
    }
  };

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      syncAdvanceSlide();
    }, AUTO_PLAY_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section
      className="relative text-white"
      style={{ height: "clamp(200px, 31.25vw, 540px)" }}
    >
      {/* Pista del carousel — overflow recortado en su propio div para evitar bug de compositing en Safari */}
      <div className="absolute inset-0 overflow-hidden bg-[#05070a]">
        <div
          className={transition ? "flex h-full transition-transform duration-700 ease-out" : "flex h-full"}
          style={{ transform: `translateX(-${index * 100}%)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {loopSlides.map((slide, i) => (
            <article
              key={i}
              className="relative h-full w-full shrink-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image}
                alt={slide.title}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
              />

              {slide.gradient && (
                <div className={`absolute inset-0 ${slide.gradient}`} />
              )}

              <div className="relative mx-auto flex h-full max-w-[1440px] items-center justify-between px-8 py-12 sm:py-16 md:py-20">
                <div
                  className={`${slide.textAlign === "right" ? "ml-auto max-w-sm text-right md:max-w-lg" : "max-w-xl"}`}
                >
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

                  <p
                    className={`mb-8 text-sm md:text-base ${
                      slide.darkText ? "text-[#0d1b2a]/80" : "text-slate-100"
                    } ${slide.textAlign === "right" ? "border-l-2 border-[#ed8435] pl-3 text-left" : ""}`}
                  >
                    {slide.description}
                  </p>

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
                        <span
                          key={j}
                          className={`block ${line.orange ? "text-[#ed8435]" : "text-white"}`}
                        >
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
            </article>
          ))}
        </div>
      </div>

      {/* Controles — sobre las imágenes, fuera del div con overflow hidden */}
      <button
        type="button"
        aria-label="Banner anterior"
        onClick={goToPrev}
        className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/25 text-2xl transition-colors duration-200 hover:border-[#ed8435] hover:text-[#ed8435]"
      >
        ‹
      </button>

      <button
        type="button"
        aria-label="Banner siguiente"
        onClick={advanceSlide}
        className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/25 text-2xl transition-colors duration-200 hover:border-[#ed8435] hover:text-[#ed8435]"
      >
        ›
      </button>

      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Ir al banner ${i + 1}`}
            onClick={() => goToSlide(i)}
            className={`h-3 rounded-full transition-all duration-300 ${
              dotIndex === i
                ? "w-10 bg-[#ed8435]"
                : "w-3 bg-white/60 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
