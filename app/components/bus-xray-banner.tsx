"use client";

import Image from "next/image";
import { useMemo, useState, type PointerEvent } from "react";

const DEFAULT_POSITION = { x: 50, y: 50 };
const LENS_SIZE = 220;

export default function BusXrayBanner() {
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [isActive, setIsActive] = useState(false);

  const clipPath = useMemo(
    () => `circle(${LENS_SIZE / 2}px at ${position.x}% ${position.y}%)`,
    [position.x, position.y],
  );

  const updatePosition = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const nextX = ((event.clientX - bounds.left) / bounds.width) * 100;
    const nextY = ((event.clientY - bounds.top) / bounds.height) * 100;

    setPosition({
      x: Math.min(100, Math.max(0, nextX)),
      y: Math.min(100, Math.max(0, nextY)),
    });
  };

  return (
    <div className="overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
      <div className="border-b border-black/6 bg-[#fbfbfa] px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b8d91]">
          Explora el sistema
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#16384f] md:text-3xl">
          Pasa el cursor y mira el interior en modo radiografía
        </h2>
      </div>

      <div
        className="group relative aspect-[16/9] cursor-none overflow-hidden bg-[#f4f4f2]"
        onPointerEnter={(event) => {
          setIsActive(true);
          updatePosition(event);
        }}
        onPointerMove={updatePosition}
        onPointerLeave={() => {
          setIsActive(false);
          setPosition(DEFAULT_POSITION);
        }}
      >
        <Image
          src="/bus-sketch-unipars.jpeg"
          alt="Bus en trazo técnico"
          fill
          priority
          sizes="(min-width: 1440px) 1408px, (min-width: 768px) calc(100vw - 48px), 100vw"
          className="object-cover"
        />

        <div
          className="pointer-events-none absolute inset-0 transition-[clip-path,opacity] duration-150 ease-out"
          style={{
            clipPath,
            opacity: isActive ? 1 : 0,
          }}
        >
          <Image
            src="/bus-xray-unipars.jpeg"
            alt="Bus en vista radiografía"
            fill
            sizes="(min-width: 1440px) 1408px, (min-width: 768px) calc(100vw - 48px), 100vw"
            className="object-cover"
          />
        </div>

        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-150"
          style={{ opacity: isActive ? 1 : 0 }}
        >
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white/92 shadow-[0_0_0_1px_rgba(22,56,79,0.08),0_18px_40px_rgba(15,23,42,0.2)]"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              width: `${LENS_SIZE}px`,
              height: `${LENS_SIZE}px`,
              background:
                "radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 48%, rgba(255,255,255,0) 72%)",
            }}
          />
        </div>

        <div className="pointer-events-none absolute bottom-5 left-5 rounded-full bg-white/92 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#16384f] shadow-[0_10px_25px_rgba(15,23,42,0.12)]">
          {isActive ? "Vista radiografía activa" : "Mueve el cursor sobre el bus"}
        </div>
      </div>
    </div>
  );
}
