"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCart } from "./cart-provider";
import { useProducts } from "./products-provider";
import { categorias, slugCategoria } from "../data/catalog";

type SiteHeaderProps = {
  currentUser: {
    fullName: string;
    role: "CUSTOMER" | "SELLER" | "PROVIDER" | "ADMIN" | "MASTER";
  } | null;
  isVendor?: boolean;
};

export default function SiteHeader({ currentUser, isVendor }: SiteHeaderProps) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const { totalItems } = useCart();
  const { products } = useProducts();

  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return products
      .filter((p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.marca.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [searchQuery, products]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const irACategoria = (categoria?: string) => {
    setMenuAbierto(false);
    const url = categoria
      ? `/categorias?categoria=${slugCategoria(categoria)}`
      : "/categorias";
    router.push(url);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    setShowSuggestions(false);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    const targetUrl = params.toString() ? `/categorias?${params.toString()}` : "/categorias";
    if (pathname === "/categorias") { router.replace(targetUrl); return; }
    router.push(targetUrl);
  };



  const openVisualSearch = () => {
    window.dispatchEvent(new CustomEvent("totalpars:visual-search-toggle", { detail: { isOpen: true } }));
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const accountHref = currentUser?.role === "ADMIN" ? "/admin"
    : currentUser?.role === "MASTER" ? "/master"
    : isVendor ? "/proveedor"
    : "/mi-cuenta";

  return (
    <header className="sticky top-0 z-50 border-b border-black/8 bg-white text-[#16384f] shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div className="mx-auto max-w-[1600px] px-4 py-4 lg:px-5">

        {/* Fila superior: logo + búsqueda + hamburguesa/acciones */}
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex shrink-0" aria-label="Ir al inicio de Totalpars">
            <Image
              src="/logo-totalpars.png" alt="Totalpars" width={600} height={67}
              style={{ width: "clamp(120px, 12vw, 180px)", height: "auto" }} priority
            />
          </Link>

          <div className="flex flex-1 justify-center">
          <div ref={searchRef} className="relative w-full max-w-[720px]">
            <form
              onSubmit={handleSearch}
              className="flex items-center rounded-full border border-black/10 bg-[#f8f8f7] p-2 shadow-[0_8px_20px_rgba(15,23,42,0.04)]"
            >
              <input
                name="q"
                type="search"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => { if (searchQuery.trim().length >= 2) setShowSuggestions(true); }}
                onKeyDown={(e) => { if (e.key === "Escape") setShowSuggestions(false); }}
                placeholder="Buscar repuestos..."
                className="w-full min-w-0 bg-transparent px-4 text-sm text-[#16384f] outline-none placeholder:text-slate-400 md:px-5"
                autoComplete="off"
              />
              <div className="ml-2 flex items-center gap-2 rounded-full bg-white/88 pl-2">
                <button type="submit" className="rounded-full bg-[#ed8435] px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#d67024] lg:px-7">
                  Buscar
                </button>
                <button type="button" onClick={openVisualSearch} aria-label="Búsqueda por imagen"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#16384f]/12 bg-white text-[#16384f] transition-colors duration-200 hover:border-[#ed8435] hover:bg-[#fff6ee] hover:text-[#ed8435]">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 4H9.5L8 6H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3l-1.5-2Z" />
                    <circle cx="12" cy="12" r="3.5" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Dropdown de sugerencias */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                {suggestions.map((producto) => (
                  <Link
                    key={producto.slug}
                    href={`/producto/${producto.slug}`}
                    onClick={() => { setShowSuggestions(false); setSearchQuery(""); }}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#f8f8f7]"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#f0f2f4]">
                      <Image src={producto.imagen} alt={producto.nombre} fill className="object-contain p-1" sizes="48px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#16384f]">{producto.nombre}</p>
                      <p className="text-xs text-[#8b8d91]">{producto.marca} · {producto.categoria}</p>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-[#ed8435]">{producto.precio}</p>
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const q = encodeURIComponent(searchQuery.trim());
                    const url = `/categorias?q=${q}`;
                    if (pathname === "/categorias") { router.replace(url); } else { router.push(url); }
                    setShowSuggestions(false);
                    setSearchQuery("");
                  }}
                  className="w-full border-t border-black/6 px-4 py-3 text-center text-sm font-medium text-[#ed8435] transition-colors hover:bg-[#fff6ee]"
                >
                  Ver todos los resultados para &quot;{searchQuery}&quot; →
                </button>
              </div>
            )}
          </div>
          </div>

        </div>

        {/* Fila desktop: nav + acciones */}
        <div className="mt-3 hidden items-center justify-between gap-3 md:flex">
          <nav className="flex shrink-0 items-center gap-4 text-[13px] font-semibold tracking-[0.01em] text-[#16384f] md:gap-5 lg:text-sm xl:gap-6">
            <div className="relative" ref={menuRef}>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => irACategoria()}
                  className="whitespace-nowrap transition-colors duration-200 hover:text-[#ed8435]">
                  Categoría
                </button>
                <button type="button" aria-label="Subcategorías"
                  onClick={() => setMenuAbierto((prev) => !prev)}
                  className="text-[10px] text-[#16384f]/55 transition-colors duration-200 hover:text-[#ed8435]">
                  {menuAbierto ? "▲" : "▼"}
                </button>
              </div>
              {menuAbierto && (
                <div className="absolute left-0 top-full mt-4 w-72 rounded-2xl border border-black/8 bg-white p-2 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                  {categorias.map((cat) => (
                    <button key={cat} type="button" onClick={() => irACategoria(cat)}
                      className="block w-full rounded-xl px-4 py-3 text-left text-sm font-medium normal-case tracking-normal text-[#16384f]/85 transition-colors duration-200 hover:bg-[#f8f8f7] hover:text-[#16384f]">
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {[
              { href: "/vender", label: "Vender" },
              { href: "/categorias?oferta=true", label: "Ofertas" },
              { href: "/servicio-de-reparacion", label: "Uniparceros" },
              { href: "/ayuda", label: "Ayuda / PQR" },
            ].map(({ href, label }) => {
              const isActive =
                href === "/categorias?oferta=true"
                  ? pathname === "/categorias" && searchParams.get("oferta") === "true"
                  : pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative whitespace-nowrap transition-colors duration-200 hover:text-[#ed8435] ${isActive ? "font-semibold text-[#ed8435]" : ""}`}
                >
                  {label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-[#ed8435]" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2 xl:gap-3">
            <Link href="/carrito"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#16384f]/18 bg-[#f8f8f7] text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white">
              <span className="text-lg">🛒</span>
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ed8435] px-1 text-[10px] font-semibold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
            {currentUser ? (
              <>
                <span className="hidden max-w-[96px] truncate whitespace-nowrap text-sm font-semibold text-[#16384f] lg:inline xl:max-w-none">
                  Hola, {currentUser.fullName}
                </span>
                <Link href={accountHref}
                  className="inline-flex items-center gap-2 rounded-full bg-[#ed8435] px-3 py-2.5 text-[11px] font-semibold tracking-[0.04em] text-white transition-colors duration-200 hover:bg-[#d67024] lg:px-4 lg:text-xs xl:px-5">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="8" r="4" />
                  </svg>
                  <span className="hidden lg:inline">{currentUser.fullName}</span>
                  <span className="lg:hidden">Cuenta</span>
                </Link>
                <button type="button" onClick={handleLogout}
                  className="rounded-full border border-[#16384f]/25 px-3 py-2.5 text-[11px] font-semibold tracking-[0.04em] text-[#16384f] transition-colors duration-200 hover:border-[#16384f] hover:bg-[#16384f] hover:text-white lg:px-4 lg:text-xs xl:px-5">
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link href="/registro" className="rounded-full bg-[#ed8435] px-3 py-2.5 text-[11px] font-semibold tracking-[0.04em] text-white transition-colors duration-200 hover:bg-[#d67024] lg:px-4 lg:text-xs xl:px-5">Registro</Link>
                <Link href="/login" className="rounded-full border border-[#16384f]/25 px-3 py-2.5 text-[11px] font-semibold tracking-[0.04em] text-[#16384f] transition-colors duration-200 hover:border-[#16384f] hover:bg-[#16384f] hover:text-white lg:px-4 lg:text-xs xl:px-5">Ingresar</Link>
              </>
            )}
          </div>
        </div>
      </div>

    </header>
  );
}
