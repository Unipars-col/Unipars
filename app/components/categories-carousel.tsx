"use client";

import { useRef, useState, useEffect, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { categoriasData, slugCategoria } from "../data/catalog";

export default function CategoriesCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", updateArrows); ro.disconnect(); };
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? el.clientWidth : -el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Flecha izquierda */}
      <button
        type="button"
        onClick={() => scroll("left")}
        disabled={!canScrollLeft}
        className="absolute -left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-xl shadow-md transition hover:border-[#ed8435] hover:text-[#ed8435] disabled:opacity-30 disabled:cursor-default"
        aria-label="Anterior"
      >
        ‹
      </button>

      {/* Flecha derecha */}
      <button
        type="button"
        onClick={() => scroll("right")}
        disabled={!canScrollRight}
        className="absolute -right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-xl shadow-md transition hover:border-[#ed8435] hover:text-[#ed8435] disabled:opacity-30 disabled:cursor-default"
        aria-label="Siguiente"
      >
        ›
      </button>

      {/* Scroll container */}
      <div className="overflow-hidden">
      <div
        ref={scrollRef}
        className="scrollbar-hidden flex gap-4 overflow-x-auto pb-2"
      >
        {categoriasData.map((categoria) => (
          <Link
            key={categoria.nombre}
            href={`/categorias?categoria=${slugCategoria(categoria.nombre)}`}
            className="group flex w-[calc((100%-1rem)/2)] shrink-0 flex-col items-center justify-between rounded-2xl border border-black/8 bg-white px-4 pb-5 pt-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[var(--hover-color)] hover:shadow-[0_10px_28px_color-mix(in_srgb,var(--hover-color)_18%,transparent)] sm:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)]"
            style={{ "--hover-color": categoria.color } as CSSProperties}
          >
            <div className="relative flex h-[120px] w-full items-center justify-center overflow-visible">
              {categoria.iconoImagen ? (
                <div className="relative transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-[1.08]">
                  <div
                    className="absolute left-1/2 top-1/2 h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 blur-2xl transition-all duration-300 group-hover:opacity-100"
                    style={{ backgroundColor: "color-mix(in srgb, var(--hover-color) 28%, transparent)" }}
                  />
                  <Image
                    src={categoria.iconoImagen}
                    alt={categoria.nombre}
                    width={120}
                    height={90}
                    className="relative h-[96px] w-[120px] object-contain drop-shadow-[0_10px_18px_rgba(15,23,42,0.13)]"
                  />
                </div>
              ) : (
                <span className="text-4xl text-[var(--hover-color)]">{categoria.icono}</span>
              )}
            </div>
            <h3 className="mt-4 text-[13px] font-semibold leading-snug text-[#16384f] transition-colors duration-300 group-hover:text-[var(--hover-color)]">
              {categoria.nombre}
            </h3>
          </Link>
        ))}
      </div>
      </div>
    </div>
  );
}
