"use client";

import Image from "next/image";
import Link from "next/link";

const items = [
  { text: "🔥 Aprovecha los", bold: "súper descuentos de Unipars", cta: { label: "Ver ofertas", href: "/categorias?oferta=true" } },
  { text: "🚛 Repuestos para", bold: "transporte masivo y de carga", cta: null },
  { text: "⚡ Los mejores precios en", bold: "repuestos originales", cta: { label: "Ver catálogo", href: "/categorias" } },
  { text: "🛠️ Más de", bold: "364 referencias disponibles", cta: null },
  { text: "📦 Envíos a todo", bold: "Colombia", cta: { label: "Comprar ahora", href: "/categorias" } },
  { text: "🏆 Calidad garantizada en cada", bold: "repuesto que compras", cta: null },
];

function RibbonItem({ item }: { item: typeof items[0] }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-3 px-6">
      <Image src="/logo-white.png" alt="Unipars" width={68} height={18} className="h-[18px] w-auto shrink-0 opacity-85" />
      <span className="whitespace-nowrap text-[13px] text-white/75">
        {item.text}{" "}
        <strong className="font-semibold text-white">{item.bold}</strong>
      </span>
      {item.cta && (
        <Link
          href={item.cta.href}
          className="shrink-0 rounded-full bg-[#ed8435] px-3.5 py-[5px] text-[11px] font-bold text-white hover:bg-[#d97230]"
          onClick={(e) => e.stopPropagation()}
        >
          {item.cta.label}
        </Link>
      )}
      <span className="mx-1 text-white/15 select-none">│</span>
    </span>
  );
}

export default function PromoRibbon() {
  return (
    <div
      className="overflow-hidden bg-[#16384f] py-2.5"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      <style>{`
        @keyframes ribbonScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ribbon-track {
          display: flex;
          width: max-content;
          animation: ribbonScroll 22s linear infinite;
          will-change: transform;
        }
        .ribbon-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="ribbon-track">
        {/* 2 copias exactas → -50% = 1 copia completa → loop perfecto */}
        {[...items, ...items].map((item, idx) => (
          <RibbonItem key={idx} item={item} />
        ))}
      </div>
    </div>
  );
}
