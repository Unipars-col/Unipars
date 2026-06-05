"use client";

type Promo = { src: string; alt: string; href?: string };

export default function PromoScroll({ promos }: { promos: Promo[] }) {
  const cardStyle: React.CSSProperties = {
    width: "clamp(200px, 22vw, 300px)",
    flexShrink: 0,
    display: "block",
    borderRadius: "1rem",
    overflow: "hidden",
    cursor: "pointer",
    textDecoration: "none",
  };

  return (
    <div className="mx-auto max-w-[1440px] overflow-hidden px-4">
      <style>{`
        @keyframes promoScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .promo-scroll-track {
          display: flex;
          width: max-content;
          gap: 1.25rem;
          animation: promoScroll 24s linear infinite;
          will-change: transform;
        }
        .promo-scroll-track:hover {
          animation-play-state: paused;
        }
        .promo-scroll-track a:hover img {
          transform: scale(1.02);
          transition: transform 0.2s ease;
        }
      `}</style>

      <div className="promo-scroll-track">
        {[...promos, ...promos].map((promo, i) =>
          promo.href ? (
            <a key={`${promo.src}-${i}`} href={promo.href} style={cardStyle}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={promo.src} alt={promo.alt} style={{ width: "100%", display: "block" }} />
            </a>
          ) : (
            <span key={`${promo.src}-${i}`} style={{ ...cardStyle, cursor: "default" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={promo.src} alt={promo.alt} style={{ width: "100%", display: "block" }} />
            </span>
          )
        )}
      </div>
    </div>
  );
}
