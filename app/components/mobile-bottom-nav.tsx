"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useCart } from "./cart-provider";

const moreItems = [
  {
    href: "/vender",
    label: "Vender",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    href: "/categorias?oferta=true",
    label: "Ofertas",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    href: "/servicio-de-reparacion",
    label: "Uniparceros",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" />
      </svg>
    ),
  },
  {
    href: "/ayuda",
    label: "Ayuda",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.13h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.73a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
      </svg>
    ),
  },
  {
    href: "/tips-y-videos",
    label: "Tips y videos",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
  },
];

const navItems = [
  {
    href: "/",
    label: "Inicio",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5Z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    href: "/categorias",
    label: "Categorías",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/carrito",
    label: "Carrito",
    isCart: true,
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    href: "/mi-cuenta",
    label: "Cuenta",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="8" r="4" />
      </svg>
    ),
  },
];

export default function MobileBottomNav({ isLoggedIn }: { isLoggedIn?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const [showMore, setShowMore] = useState(false);

  const handleLogout = async () => {
    setShowMore(false);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  useEffect(() => {
    setShowMore(false);
  }, [pathname]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowMore(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const moreIsActive = moreItems.some((i) => pathname === i.href || (i.href !== "/" && pathname.startsWith(i.href)));

  return (
    <>
      {showMore && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setShowMore(false)}
        />
      )}

      {showMore && (
      <div
        className="rounded-t-2xl bg-white md:hidden"
        style={{
          position: "fixed",
          bottom: 60,
          left: 0,
          right: 0,
          zIndex: 50,
          boxShadow: "0 -8px 32px rgba(15,23,42,0.15)",
          animation: "slideUp 0.25s ease-out",
        }}
      >
        <div className="px-4 pb-4 pt-3">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200" />
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#6e7379]">Más opciones</p>
          <div className="grid grid-cols-1 gap-1">
            {moreItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#ed8435]/10 text-[#ed8435]"
                      : "text-[#16384f] hover:bg-gray-50"
                  }`}
                >
                  <span className={isActive ? "text-[#ed8435]" : "text-[#6e7379]"}>{item.icon}</span>
                  {item.label}
                  {isActive && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-[#ed8435]" />
                  )}
                </Link>
              );
            })}
            {isLoggedIn && (
              <>
                <div className="my-1 border-t border-black/8" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                >
                  <span className="text-red-400">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </span>
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/8 bg-white shadow-[0_-8px_24px_rgba(15,23,42,0.08)] md:hidden">
        <div className="flex items-stretch">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold transition-colors ${
                  isActive ? "text-[#ed8435]" : "text-[#6e7379]"
                }`}
              >
                <span className="relative">
                  {item.icon}
                  {item.isCart && totalItems > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ed8435] px-0.5 text-[9px] font-bold text-white">
                      {totalItems}
                    </span>
                  )}
                </span>
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-[#ed8435]" />
                )}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold transition-colors ${
              showMore || moreIsActive ? "text-[#ed8435]" : "text-[#6e7379]"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
            </svg>
            <span>Más</span>
            {(showMore || moreIsActive) && (
              <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-[#ed8435]" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
}
