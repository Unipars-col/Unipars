"use client";

import { useRef } from "react";

type Promo = { src: string; alt: string };

export default function PromoScroll({ promos }: { promos: Promo[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 20 : 300;
    el.scrollBy({ left: dir === "right" ? cardWidth : -cardWidth, behavior: "smooth" });
  };

  return (
    <div className="relative mx-auto max-w-[1440px] px-14">
      {/* Track — desborda los px-14 para llegar al borde del contenedor */}
      <div
        ref={trackRef}
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "1.25rem",
          scrollSnapType: "x mandatory",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        } as React.CSSProperties}
      >
        {promos.map((promo, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${promo.src}-${i}`}
            src={promo.src}
            alt={promo.alt}
            style={{ width: "clamp(260px, 32vw, 440px)", flexShrink: 0, borderRadius: "1rem", scrollSnapAlign: "start", display: "block" }}
          />
        ))}
      </div>

      {/* Botón izquierda — alineado con el margen de página */}
      <button
        type="button"
        aria-label="Anterior"
        onClick={() => scroll("left")}
        className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#ed8435] text-2xl text-white shadow-md transition-colors hover:bg-[#d4722a]"
      >
        ‹
      </button>

      {/* Botón derecha — alineado con el margen de página */}
      <button
        type="button"
        aria-label="Siguiente"
        onClick={() => scroll("right")}
        className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#ed8435] text-2xl text-white shadow-md transition-colors hover:bg-[#d4722a]"
      >
        ›
      </button>
    </div>
  );
}
