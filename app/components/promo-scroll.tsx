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
    <div className="mx-auto max-w-[1440px] px-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Anterior"
          onClick={() => scroll("left")}
          className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ed8435] text-2xl text-white shadow-md transition-colors hover:bg-[#d4722a] md:flex"
        >
          ‹
        </button>

        {/* min-w-0 impide que el flex item desborde; overflow-hidden recorta el track */}
        <div className="min-w-0 flex-1 overflow-hidden">
          <div
            ref={trackRef}
            style={{
              display: "flex",
              overflowX: "auto",
              gap: "1.25rem",
              paddingRight: "0.5rem",
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
                style={{ width: "clamp(160px, 24vw, 300px)", flexShrink: 0, borderRadius: "1rem", scrollSnapAlign: "start", display: "block" }}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          aria-label="Siguiente"
          onClick={() => scroll("right")}
          className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ed8435] text-2xl text-white shadow-md transition-colors hover:bg-[#d4722a] md:flex"
        >
          ›
        </button>
      </div>
    </div>
  );
}
