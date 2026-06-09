"use client";

import Image from "next/image";
import Link from "next/link";

const items = [
  { bg: "transparent", text: "🔥 Aprovecha los", bold: "súper descuentos de Totalpars", cta: { label: "Ver ofertas", href: "/categorias?oferta=true", color: "#ed8435" } },
  { bg: "transparent", text: "🚛 Repuestos para", bold: "transporte masivo y de carga", cta: null },
  { bg: "transparent", text: "⚡ Los mejores precios en", bold: "repuestos originales", cta: { label: "Ver catálogo", href: "/categorias", color: "#ed8435" } },
  { bg: "transparent", text: "🛠️ Más de", bold: "364 referencias disponibles", cta: null },
  { bg: "transparent", text: "📦 Envíos a todo", bold: "Colombia", cta: { label: "Comprar ahora", href: "/categorias", color: "#ed8435" } },
  { bg: "transparent", text: "🏆 Calidad garantizada en cada", bold: "repuesto que compras", cta: null },
];

function RibbonItem({ item }: { item: typeof items[0] }) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-3 px-7 py-2.5"
      style={{ backgroundColor: item.bg }}
    >
      <Image src="/logo-totalpars.png" alt="Totalpars" width={600} height={67} className="h-[18px] w-auto shrink-0" style={{ width: "auto", filter: "brightness(0) invert(1)", opacity: 0.9 }} />
      <span className="whitespace-nowrap text-[13px] text-white/80">
        {item.text}{" "}
        <strong className="font-semibold text-white">{item.bold}</strong>
      </span>
      {item.cta && (
        <Link
          href={item.cta.href}
          className="shrink-0 rounded-full px-3.5 py-[5px] text-[11px] font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: item.cta.color }}
          onClick={(e) => e.stopPropagation()}
        >
          {item.cta.label}
        </Link>
      )}
    </span>
  );
}

export default function PromoRibbon() {
  return (
    <div className="overflow-hidden bg-[#16384f]">
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
        {[...items, ...items].map((item, idx) => (
          <RibbonItem key={`${idx}-${item.bold}`} item={item} />
        ))}
      </div>
    </div>
  );
}
