"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCart } from "./cart-provider";
import { categorias, slugCategoria } from "../data/catalog";

type SiteHeaderProps = {
  currentUser: {
    fullName: string;
    role: "CUSTOMER" | "ADMIN";
  } | null;
};

export default function SiteHeader({ currentUser }: SiteHeaderProps) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { totalItems } = useCart();

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

    const formData = new FormData(event.currentTarget);
    const query = String(formData.get("q") || "").trim();
    const params = new URLSearchParams(searchParams.toString());

    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }

    const targetUrl = params.toString()
      ? `/categorias?${params.toString()}`
      : "/categorias";

    if (pathname === "/categorias") {
      router.replace(targetUrl);
      return;
    }

    router.push(targetUrl);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/8 bg-white text-[#16384f] shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex">
            <Image
              src="/logo.png"
              alt="Unipars"
              width={96}
              height={25}
              style={{ width: "96px", height: "auto" }}
              priority
            />
          </Link>
        </div>

        <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row md:items-center md:gap-8">
          <form
            onSubmit={handleSearch}
            className="flex w-full max-w-[520px] items-center rounded-full border border-black/10 bg-[#f8f8f7] px-2 py-2 md:w-[520px]"
          >
            <input
              key={searchParams.get("q") || ""}
              name="q"
              type="search"
              defaultValue={searchParams.get("q") || ""}
              placeholder="Buscar repuestos..."
              className="w-full bg-transparent px-4 text-sm text-[#16384f] outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="rounded-full bg-[#ed8435] px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#d67024]"
            >
              Buscar
            </button>
          </form>

          <nav className="flex items-center gap-6 text-sm font-medium uppercase tracking-[0.04em] text-[#16384f]">
            <div className="relative" ref={menuRef}>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => irACategoria()}
                  className="transition-colors duration-200 hover:text-[#ed8435]"
                >
                  Categoría
                </button>
                <button
                  type="button"
                  aria-label="Abrir subcategorías"
                  onClick={() => setMenuAbierto((prev) => !prev)}
                  className="text-[10px] text-[#16384f]/55 transition-colors duration-200 hover:text-[#ed8435]"
                >
                  {menuAbierto ? "▲" : "▼"}
                </button>
              </div>

              {menuAbierto && (
                <div className="absolute left-0 top-full mt-4 w-72 rounded-2xl border border-black/8 bg-white p-2 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                  {categorias.map((categoria) => (
                    <button
                      key={categoria}
                      type="button"
                      onClick={() => irACategoria(categoria)}
                      className="block w-full rounded-xl px-4 py-3 text-left text-sm font-medium normal-case tracking-normal text-[#16384f]/85 transition-colors duration-200 hover:bg-[#f8f8f7] hover:text-[#16384f]"
                    >
                      {categoria}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/quienes-somos"
              className="transition-colors duration-200 hover:text-[#ed8435]"
            >
              Quiénes somos
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/carrito"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#16384f]/18 bg-[#f8f8f7] text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
            >
              <span className="text-lg">🛒</span>
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ed8435] px-1 text-[10px] font-semibold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
            {currentUser ? (
              <>
                <span className="hidden text-sm font-semibold text-[#16384f] md:inline">
                  Hola, {currentUser.fullName}
                </span>
                <Link
                  href={currentUser.role === "ADMIN" ? "/admin" : "/mi-cuenta"}
                  className="inline-flex items-center gap-2 rounded-full bg-[#ed8435] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors duration-200 hover:bg-[#d67024]"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21a8 8 0 0 0-16 0" />
                    <circle cx="12" cy="8" r="4" />
                  </svg>
                  {currentUser.fullName}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-[#16384f]/25 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#16384f] transition-colors duration-200 hover:border-[#16384f] hover:bg-[#16384f] hover:text-white"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/registro"
                  className="rounded-full bg-[#ed8435] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors duration-200 hover:bg-[#d67024]"
                >
                  Registro
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border border-[#16384f]/25 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#16384f] transition-colors duration-200 hover:border-[#16384f] hover:bg-[#16384f] hover:text-white"
                >
                  Ingresar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
