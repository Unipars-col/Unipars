"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import HoverCartControl from "../components/hover-cart-control";
import PromoRibbon from "../components/promo-ribbon";
import { useProducts } from "../components/products-provider";
import {
  categoriaDesdeSlug,
  categoriaMeta,
  categorias,
  categoriasData,
  slugCategoria,
} from "../data/catalog";

const disponibilidades = [
  "Entrega inmediata",
  "Disponible por pedido",
  "Recoger en tienda",
  "Agotado",
] as const;

const VISIBLE = 7;

export default function CategoriasPage() {
  const { products } = useProducts();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [carouselIdx, setCarouselIdx] = useState(0);
  const maxIdx = Math.max(0, categoriasData.length - VISIBLE);
  const clipRef = useRef<HTMLDivElement>(null);
  const [clipWidth, setClipWidth] = useState(0);
  useEffect(() => {
    const el = clipRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => setClipWidth(entry.contentRect.width));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const GAP = 12;
  const cardW = clipWidth > 0 ? (clipWidth - (VISIBLE - 1) * GAP) / VISIBLE : 0;
  const step = cardW + GAP;
  const marcas = Array.from(new Set(products.map((product) => product.marca)));
  const priceBounds = useMemo(() => {
    const values = products.map((product) => product.precioValor);
    const min = values.length > 0 ? Math.min(...values) : 0;
    const max = values.length > 0 ? Math.max(...values) : 1000000;

    return { min, max };
  }, [products]);

  const soloOfertas = searchParams.get("oferta") === "true";
  const categoriaActiva = categoriaDesdeSlug(searchParams.get("categoria"));
  const categoriaVisual = categoriaMeta(
    categoriaActiva ?? categorias[0],
  );
  const queryActiva = searchParams.get("q")?.trim().toLowerCase() || "";
  const heroTitulo = soloOfertas
    ? "Ofertas especiales"
    : categoriaActiva
      ? categoriaVisual.nombre
      : "Filtra por categoría y encuentra exactamente lo que necesitas.";
  const heroDestacado = soloOfertas ? "+35% de descuento" : categoriaActiva ? "de alta calidad" : "";
  const heroCopy = soloOfertas
    ? "Productos con descuentos mayores al 35%. Selección actualizada del catálogo Totalpars."
    : categoriaActiva
      ? categoriaVisual.bannerCopy ||
        "Explora esta línea con una vista más clara del catálogo y encuentra referencias listas para cotizar."
      : "Construimos una sola ventana de catálogo para que explores todas las líneas de producto sin duplicar páginas ni perder claridad.";

  const [ordenActivo, setOrdenActivo] = useState<"recomendados" | "mas-vendidos" | "menor-precio">("recomendados");
  const [marcasActivas, setMarcasActivas] = useState<string[]>([]);
  const [marcaBusqueda, setMarcaBusqueda] = useState("");
  const [mostrarMasMarcas, setMostrarMasMarcas] = useState(false);
  const [disponibilidadActiva, setDisponibilidadActiva] = useState<string[]>([]);
  const [precioMinimo, setPrecioMinimo] = useState(priceBounds.min);
  const [precioMaximo, setPrecioMaximo] = useState(priceBounds.max);

  const marcasConConteo = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) counts.set(p.marca, (counts.get(p.marca) ?? 0) + 1);
    return Array.from(counts.entries())
      .map(([nombre, conteo]) => ({ nombre, conteo }))
      .sort((a, b) => b.conteo - a.conteo);
  }, [products]);

  const marcasFiltradas = marcasConConteo.filter((m) =>
    m.nombre.toLowerCase().includes(marcaBusqueda.toLowerCase()),
  );
  const marcasVisibles = mostrarMasMarcas ? marcasFiltradas : marcasFiltradas.slice(0, 10);

  useEffect(() => {
    setPrecioMinimo(priceBounds.min);
    setPrecioMaximo(priceBounds.max);
  }, [priceBounds.max, priceBounds.min]);

  const cambiarCategoria = (categoria: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("categoria", slugCategoria(categoria));
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const alternar = (
    valor: string,
    activos: string[],
    setter: (value: string[]) => void,
  ) => {
    setter(
      activos.includes(valor)
        ? activos.filter((item) => item !== valor)
        : [...activos, valor],
    );
  };

  const productosFiltrados = products.filter((producto) => {
    const coincideCategoria =
      !categoriaActiva || producto.categoria === categoriaActiva;
    const coincideBusqueda =
      queryActiva.length === 0 ||
      producto.nombre.toLowerCase().includes(queryActiva) ||
      producto.marca.toLowerCase().includes(queryActiva) ||
      producto.categoria.toLowerCase().includes(queryActiva) ||
      producto.descripcion.toLowerCase().includes(queryActiva);
    const coincideMarca =
      marcasActivas.length === 0 || marcasActivas.includes(producto.marca);
    const coincideDisponibilidad =
      disponibilidadActiva.length === 0 ||
      disponibilidadActiva.includes(producto.disponibilidad);
    const coincidePrecio =
      producto.precioValor >= precioMinimo &&
      producto.precioValor <= precioMaximo;

    const descuentoPct =
      producto.precioAnteriorValor > producto.precioValor
        ? ((producto.precioAnteriorValor - producto.precioValor) / producto.precioAnteriorValor) * 100
        : 0;
    const coincideOferta = !soloOfertas || descuentoPct > 35;

    return (
      coincideBusqueda &&
      coincideCategoria &&
      coincideMarca &&
      coincideDisponibilidad &&
      coincidePrecio &&
      coincideOferta
    );
  }).sort((a, b) => {
    if (ordenActivo === "menor-precio") return a.precioValor - b.precioValor;
    if (ordenActivo === "mas-vendidos") {
      const descA = a.precioAnteriorValor > 0 ? (a.precioAnteriorValor - a.precioValor) / a.precioAnteriorValor : 0;
      const descB = b.precioAnteriorValor > 0 ? (b.precioAnteriorValor - b.precioValor) / b.precioAnteriorValor : 0;
      return descB - descA;
    }
    return 0;
  });

  const volverACategorias = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("categoria");
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[#f5f5f5] text-[#111]">

      {/* ── MOBILE: grid de categorías ─────────────────────────────────── */}
      {!categoriaActiva && (
        <section className="min-h-[calc(100dvh-4rem)] bg-[#f5f5f5] px-4 py-6 md:hidden">
          <h1 className="mb-5 text-center text-xl font-bold text-[#16384f]">Categorías</h1>
          <div className="grid grid-cols-2 gap-3 pb-24">
            {categoriasData.map((cat) => (
              <button
                key={cat.nombre}
                type="button"
                onClick={() => cambiarCategoria(cat.nombre)}
                className="overflow-hidden rounded-2xl border border-black/6 bg-white shadow-[0_4px_16px_rgba(15,23,42,0.07)] transition-transform duration-150 active:scale-[0.97]"
              >
                <div className="flex h-[130px] items-center justify-center p-4">
                  {cat.iconoImagen ? (
                    <Image
                      src={cat.iconoImagen}
                      alt={cat.nombre}
                      width={120}
                      height={110}
                      className="h-full w-auto max-w-full object-contain drop-shadow-md"
                      style={{ width: "auto" }}
                    />
                  ) : (
                    <span className="text-5xl drop-shadow-sm" style={{ color: cat.color }}>
                      {cat.icono}
                    </span>
                  )}
                </div>
                <div className="border-t border-black/5 px-3 py-3">
                  <p className="text-center text-[13px] font-semibold leading-snug text-[#16384f]">
                    {cat.nombre}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── MOBILE: productos de categoría seleccionada ─────────────────── */}
      {categoriaActiva && (
        <section className="bg-white md:hidden">
          <div className="sticky top-[57px] z-40 border-b border-black/8 bg-white px-4 py-3">
            <button
              type="button"
              onClick={volverACategorias}
              className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#16384f]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Categorías
            </button>
            <h2 className="text-lg font-bold text-[#16384f]">{categoriaActiva}</h2>
            <p className="text-xs text-[#8b8d91]">{productosFiltrados.length} productos</p>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4 pb-24">
            {productosFiltrados.map((producto) => (
              <article
                key={producto.slug}
                className="overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm"
              >
                <div className="flex h-36 items-center justify-center bg-white p-3">
                  <Image
                    src={producto.imagen}
                    alt={producto.nombre}
                    width={500}
                    height={400}
                    className="max-h-[110px] w-auto max-w-full object-contain"
                  />
                </div>
                <div className="p-3">
                  <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#8b8d91]">
                    {producto.marca}
                  </p>
                  <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-[#1f2328]">
                    {producto.nombre}
                  </h3>
                  <p className="mt-1 text-[10px] text-[#a0a3a8] line-through">{producto.precioAnterior}</p>
                  <p className="text-base font-bold text-[#ed8435]">{producto.precio}</p>
                  <Link
                    href={`/producto/${producto.slug}`}
                    className="mt-2 block w-full rounded-xl bg-[#16384f] py-2 text-center text-[11px] font-semibold text-white"
                  >
                    Ver producto
                  </Link>
                </div>
              </article>
            ))}
            {productosFiltrados.length === 0 && (
              <p className="col-span-2 py-12 text-center text-sm text-[#6e7379]">
                No hay productos en esta categoría.
              </p>
            )}
          </div>
        </section>
      )}

      {/* ── DESKTOP: layout existente ───────────────────────────────────── */}
      <div className="hidden md:block">
      <section className="px-6 pb-4 pt-6 text-white">
        <div className="overflow-hidden rounded-[1.9rem] bg-[#070b14] shadow-[0_26px_70px_rgba(0,0,0,0.16)]">
          {soloOfertas ? (
            <div className="overflow-hidden">
              <Image
                src="/banner-ofertas.jpg"
                alt="Ofertas del mes — Abre la caja de las mejores ofertas"
                width={2400}
                height={675}
                priority
                sizes="100vw"
                className="w-full h-auto block"
              />
            </div>
          ) : (
            <div className="relative aspect-[1920/500] min-h-[252px] overflow-hidden">
              {categoriaVisual.bannerImagen ? (
                <Image
                  src={categoriaVisual.bannerImagen}
                  alt={categoriaVisual.nombre}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover object-center"
                />
              ) : null}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,5,11,0.86)_0%,rgba(2,5,11,0.74)_20%,rgba(2,5,11,0.28)_38%,rgba(2,5,11,0.06)_58%,rgba(2,5,11,0)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_54%,rgba(255,140,64,0.1),transparent_16%),radial-gradient(circle_at_76%_48%,rgba(255,255,255,0.05),transparent_22%)]" />
              <div className="relative z-10 mx-auto flex h-full max-w-[1680px] items-center">
                <div className="px-6 py-8 md:px-8 lg:px-10">
                  <div className="max-w-[560px]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ffb46c]/72">
                      Catálogo Totalpars
                    </p>
                    <h1 className="mt-3 max-w-[13ch] text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-white md:max-w-[14ch] md:text-5xl xl:max-w-[15ch] xl:text-[4rem]">
                      {heroTitulo}
                      {heroDestacado ? (
                        <>
                          {" "}
                          <span className="text-[#ed8435]">{heroDestacado}</span>
                        </>
                      ) : null}
                    </h1>
                    <p className="mt-4 max-w-[34rem] text-base leading-8 text-white/76">
                      {heroCopy}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1680px] px-6 pb-2 pt-3">
        <div className="relative">
          {/* Prev — flota sobre el borde izquierdo del carousel */}
          <button
            type="button"
            onClick={() => setCarouselIdx((i) => Math.max(0, i - 1))}
            disabled={carouselIdx === 0}
            className="absolute -left-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#ed8435] text-white shadow-[0_6px_20px_rgba(237,132,53,0.4)] transition-all duration-200 hover:bg-[#d97230] hover:scale-105 disabled:opacity-0"
            aria-label="Anterior"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>

          <div className="overflow-hidden rounded-[1.9rem] bg-[#f0f1f3] shadow-[0_8px_24px_rgba(0,0,0,0.07)]">
            <div className="px-8 py-3">
              <div className="overflow-hidden" ref={clipRef}>
                <div
                  className="flex transition-transform duration-300 ease-out"
                  style={{ gap: `${GAP}px`, transform: `translateX(${-carouselIdx * step}px)` }}
                >
                  {categoriasData.map((cat) => {
                    const isActive = categoriaActiva === cat.nombre;
                    return (
                      <button
                        key={cat.nombre}
                        type="button"
                        onClick={() => cambiarCategoria(cat.nombre)}
                        style={{ width: cardW > 0 ? `${cardW}px` : "calc((100vw - 184px) / 7)", flexShrink: 0 }}
                        className={`group flex flex-col items-center rounded-xl border bg-white px-2 pb-3 pt-3 text-center shadow-[0_3px_10px_rgba(15,23,42,0.06)] transition-all duration-200 hover:shadow-[0_6px_18px_rgba(15,23,42,0.11)] hover:-translate-y-0.5 ${
                          isActive
                            ? "border-[#ed8435] shadow-[0_3px_10px_rgba(237,132,53,0.15)]"
                            : "border-black/6"
                        }`}
                      >
                        <div className="flex h-14 w-full shrink-0 items-center justify-center">
                          {cat.iconoImagen ? (
                            <Image
                              src={cat.iconoImagen}
                              alt={cat.nombre}
                              width={100}
                              height={100}
                              className="h-full w-auto max-w-[85%] object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-[1.07]"
                              style={{ width: "auto" }}
                            />
                          ) : (
                            <span className="text-2xl">{cat.icono}</span>
                          )}
                        </div>
                        <p className={`mt-2 w-full text-[10px] font-semibold leading-[1.3] tracking-[-0.01em] ${isActive ? "text-[#ed8435]" : "text-[#33373d]"}`}>
                          {cat.nombre}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Next — flota sobre el borde derecho del carousel */}
          <button
            type="button"
            onClick={() => setCarouselIdx((i) => Math.min(maxIdx, i + 1))}
            disabled={carouselIdx >= maxIdx}
            className="absolute -right-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#ed8435] text-white shadow-[0_6px_20px_rgba(237,132,53,0.4)] transition-all duration-200 hover:bg-[#d97230] hover:scale-105 disabled:opacity-0"
            aria-label="Siguiente"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </section>

      <PromoRibbon />

      <section className="mx-auto max-w-[1680px] px-6 pb-16 pt-6">
        <div className="grid gap-8 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b8d91]">
                Filtros
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#16384f]">
                {categoriaActiva ?? "Todas las categorías"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#6e7379]">
                {categoriaActiva
                  ? "Estás viendo los productos filtrados de esta categoría."
                  : "Estás viendo el catálogo completo y puedes filtrar por palabra o categoría."}
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
              <h3 className="text-sm font-bold tracking-[0.18em] uppercase text-[#16384f]">
                Marca
              </h3>
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Buscar por marca"
                  value={marcaBusqueda}
                  onChange={(e) => setMarcaBusqueda(e.target.value)}
                  className="w-full rounded-lg border border-black/10 bg-[#f8f8f7] px-3 py-2 text-sm text-[#1f2328] placeholder:text-[#a0a3a8] focus:border-[#16384f] focus:outline-none"
                />
              </div>
              <div className="mt-3 space-y-0.5">
                {marcasVisibles.map(({ nombre, conteo }) => (
                  <label
                    key={nombre}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-1 py-1.5 text-sm text-[#3b3f45] hover:bg-[#f5f5f5]"
                  >
                    <input
                      type="checkbox"
                      checked={marcasActivas.includes(nombre)}
                      onChange={() => alternar(nombre, marcasActivas, setMarcasActivas)}
                      className="h-4 w-4 shrink-0 rounded border-slate-300 text-[#ed8435] accent-[#16384f] focus:ring-[#16384f]"
                    />
                    <span className="flex-1">{nombre}</span>
                    <span className="text-xs text-[#a0a3a8]">({conteo})</span>
                  </label>
                ))}
                {marcasFiltradas.length === 0 && (
                  <p className="py-3 text-center text-xs text-[#a0a3a8]">Sin resultados</p>
                )}
              </div>
              {marcasFiltradas.length > 10 && (
                <button
                  type="button"
                  onClick={() => setMostrarMasMarcas((v) => !v)}
                  className="mt-2 text-sm font-semibold text-[#16384f] hover:text-[#ed8435] transition-colors"
                >
                  {mostrarMasMarcas ? "Ver menos" : "Ver más"}
                </button>
              )}
            </div>

            <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-[#16384f]">
                Disponibilidad
              </h3>
              <div className="mt-4 space-y-3">
                {disponibilidades.map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-3 text-sm text-[#5d6167]"
                  >
                    <input
                      type="checkbox"
                      checked={disponibilidadActiva.includes(item)}
                      onChange={() =>
                        alternar(
                          item,
                          disponibilidadActiva,
                          setDisponibilidadActiva,
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300 text-[#ed8435] focus:ring-[#ed8435]"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-[#16384f]">
                Rango de precio
              </h3>
              <div className="mt-5">
                <div className="flex items-center justify-between gap-3 text-sm font-medium text-[#5d6167]">
                  <span>Desde {Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(precioMinimo)}</span>
                  <span>Hasta {Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(precioMaximo)}</span>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <input
                      type="range"
                      min={priceBounds.min}
                      max={priceBounds.max}
                      step={10000}
                      value={precioMinimo}
                      onChange={(event) =>
                        setPrecioMinimo(
                          Math.min(Number(event.target.value), precioMaximo),
                        )
                      }
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#d9dde3] accent-[#ed8435]"
                    />
                  </div>

                  <div>
                    <input
                      type="range"
                      min={priceBounds.min}
                      max={priceBounds.max}
                      step={10000}
                      value={precioMaximo}
                      onChange={(event) =>
                        setPrecioMaximo(
                          Math.max(Number(event.target.value), precioMinimo),
                        )
                      }
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#d9dde3] accent-[#16384f]"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPrecioMinimo(priceBounds.min);
                    setPrecioMaximo(priceBounds.max);
                  }}
                  className="mt-5 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:text-[#ed8435]"
                >
                  Restablecer rango
                </button>
              </div>
            </div>
            {/* Promo aleatoria por categoría */}
            {(() => {
              const promos = [
                { src: "/promo-unipars.png",    alt: "Bombín para tanque 30% off" },
                { src: "/promo-tecnomotor.png", alt: "Amortiguador Tecnimotor 30% off" },
                { src: "/promo-cauchos.png",    alt: "Cauchos Industriales 20% off" },
                { src: "/promo-autoprime.png",  alt: "Batería Autoprime 30% off" },
              ];
              const key = categoriaActiva ?? "default";
              const idx = key.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % promos.length;
              const promo = promos[idx];
              return (
                <div className="overflow-hidden rounded-xl">
                  <Image src={promo.src} alt={promo.alt} width={400} height={700} className="w-full h-auto" />
                </div>
              );
            })()}
          </aside>

          <div className="space-y-8">
            <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b8d91]">
                    Resultados
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#1f2328]">
                    {productosFiltrados.length} productos en{" "}
                    {categoriaActiva ?? "todo el catálogo"}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-[#6e7379]">
                    <p>
                      Filtro principal activo:{" "}
                      <span className="font-semibold text-[#16384f]">
                        {categoriaActiva ?? "Todas las categorías"}
                      </span>
                    </p>
                    {queryActiva && (
                      <p className="rounded-full border border-[#ed8435]/18 bg-[#fff6ee] px-3 py-1 font-medium text-[#b85d12]">
                        Búsqueda: {searchParams.get("q")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {(["recomendados", "mas-vendidos", "menor-precio"] as const).map((op) => {
                    const labels = { "recomendados": "Recomendados", "mas-vendidos": "Más vendidos", "menor-precio": "Menor precio" };
                    const active = ordenActivo === op;
                    return (
                      <button
                        key={op}
                        type="button"
                        onClick={() => setOrdenActivo(op)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                          active
                            ? "bg-[#16384f] text-white"
                            : "border border-black/10 bg-[#f8f8f7] text-[#5d6167] hover:border-[#16384f]/30 hover:text-[#16384f]"
                        }`}
                      >
                        {labels[op]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {productosFiltrados.map((producto) => (
                <article
                  key={producto.slug}
                  className="overflow-hidden rounded-[1.75rem] border border-black/8 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.05)] transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="relative bg-white">
                    <span className="absolute left-4 top-4 z-10 rounded-lg bg-[#ed8435] px-3 py-1 text-sm font-semibold text-white">
                      {producto.descuento}
                    </span>
                    <div className="flex h-52 items-center justify-center px-7 py-7">
                      <Image
                        src={producto.imagen}
                        alt={producto.nombre}
                        width={900}
                        height={700}
                        className="max-h-[140px] w-auto max-w-full object-contain"
                      />
                    </div>
                    <HoverCartControl
                      id={producto.slug}
                      nombre={producto.nombre}
                      precio={producto.precio}
                      imagen={producto.imagen}
                      disabled={!producto.puedeComprar}
                    />
                  </div>

                  <div className="space-y-3 p-4">
                    <div>
                      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[#8b8d91]">
                        {producto.categoria} · {producto.marca}
                      </p>
                      <h3 className="text-lg font-semibold leading-tight tracking-[-0.03em] text-[#1f2328]">
                        {producto.nombre}
                      </h3>
                    </div>

                    <p className="text-sm text-[#6e7379]">
                      {producto.disponibilidad}
                    </p>

                    <p className="text-sm font-medium text-[#6e7379]">
                      Stock: {producto.stock ?? 0}
                    </p>

                    <div className="border-t border-black/6 pt-3">
                      <p className="text-sm text-[#a0a3a8] line-through">
                        {producto.precioAnterior}
                      </p>
                      <p className="text-[2rem] font-semibold tracking-[-0.03em] text-[#ed8435]">
                        {producto.precio}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/producto/${producto.slug}`}
                        className="inline-flex rounded-full bg-[#16384f] px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0f2a3b]"
                      >
                        Ver producto
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {productosFiltrados.length === 0 && (
              <div className="rounded-[1.75rem] border border-dashed border-black/12 bg-white p-10 text-center text-[#6e7379]">
                No encontramos productos con esos filtros. Prueba cambiando
                marca, disponibilidad o rango de precio.
              </div>
            )}
          </div>
        </div>
      </section>
      </div>{/* end hidden md:block */}
    </main>
  );
}
