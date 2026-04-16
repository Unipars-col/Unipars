"use client";

import { startTransition, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import HoverCartControl from "../components/hover-cart-control";
import { useProducts } from "../components/products-provider";
import {
  categoriaDesdeSlug,
  categoriaMeta,
  categorias,
  slugCategoria,
} from "../data/catalog";

const disponibilidades = [
  "Entrega inmediata",
  "Disponible por pedido",
  "Recoger en tienda",
  "Agotado",
] as const;
const rangosPrecio = [
  "Hasta $200.000",
  "$200.000 - $500.000",
  "Más de $500.000",
] as const;

export default function CategoriasPage() {
  const { products } = useProducts();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const marcas = Array.from(new Set(products.map((product) => product.marca)));

  const categoriaActiva = categoriaDesdeSlug(searchParams.get("categoria"));
  const categoriaVisual = categoriaMeta(
    categoriaActiva ?? categorias[0],
  );
  const queryActiva = searchParams.get("q")?.trim().toLowerCase() || "";
  const heroTitulo = categoriaActiva
    ? categoriaVisual.nombre
    : "Filtra por categoría y encuentra exactamente lo que necesitas.";
  const heroDestacado = categoriaActiva ? "de alta calidad" : "";
  const heroCopy = categoriaActiva
    ? categoriaVisual.bannerCopy ||
      "Explora esta línea con una vista más clara del catálogo y encuentra referencias listas para cotizar."
    : "Construimos una sola ventana de catálogo para que explores todas las líneas de producto sin duplicar páginas ni perder claridad.";

  const [marcasActivas, setMarcasActivas] = useState<string[]>([]);
  const [disponibilidadActiva, setDisponibilidadActiva] = useState<string[]>([]);
  const [rangoActivo, setRangoActivo] = useState<string[]>([]);

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
      rangoActivo.length === 0 ||
      rangoActivo.some((rango) => {
        if (rango === "Hasta $200.000") return producto.precioValor <= 200000;
        if (rango === "$200.000 - $500.000")
          return producto.precioValor > 200000 && producto.precioValor <= 500000;
        return producto.precioValor > 500000;
      });

    return (
      coincideBusqueda &&
      coincideCategoria &&
      coincideMarca &&
      coincideDisponibilidad &&
      coincidePrecio
    );
  });

  return (
    <main className="min-h-screen bg-[#f5f5f5] text-[#111]">
      <section className="px-6 pb-10 pt-6 text-white">
        <div className="overflow-hidden rounded-[1.9rem] border border-black/8 bg-[#070b14] shadow-[0_26px_70px_rgba(0,0,0,0.16)]">
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
              <div className="px-6 py-8 pb-20 md:px-8 lg:px-10">
                <div className="max-w-[560px]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ffb46c]/72">
                    Catálogo Unipars
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

            <div className="absolute bottom-4 left-0 right-0 z-20">
              <div className="mx-auto max-w-[1760px] px-2 sm:px-4 lg:px-6">
                <div className="scrollbar-hidden flex gap-2 overflow-x-auto px-1">
                  {categorias.map((categoria) => (
                    <button
                      key={categoria}
                      type="button"
                      onClick={() => cambiarCategoria(categoria)}
                      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all duration-200 ${
                        categoriaActiva === categoria
                          ? "border-[#ed8435] bg-[#ed8435] text-white shadow-[0_10px_24px_rgba(237,132,53,0.18)]"
                          : "border-white/12 bg-[#141b24]/72 text-white/82 hover:border-white/24 hover:bg-[#1a2330]/78 hover:text-white"
                      }`}
                    >
                      {categoria}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1680px] px-6 py-16">
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
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-[#16384f]">
                Marca
              </h3>
              <div className="mt-4 space-y-3">
                {marcas.map((marca) => (
                  <label
                    key={marca}
                    className="flex items-center gap-3 text-sm text-[#5d6167]"
                  >
                    <input
                      type="checkbox"
                      checked={marcasActivas.includes(marca)}
                      onChange={() =>
                        alternar(marca, marcasActivas, setMarcasActivas)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-[#ed8435] focus:ring-[#ed8435]"
                    />
                    <span>{marca}</span>
                  </label>
                ))}
              </div>
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
              <div className="mt-4 space-y-3">
                {rangosPrecio.map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-3 text-sm text-[#5d6167]"
                  >
                    <input
                      type="checkbox"
                      checked={rangoActivo.includes(item)}
                      onChange={() => alternar(item, rangoActivo, setRangoActivo)}
                      className="h-4 w-4 rounded border-slate-300 text-[#ed8435] focus:ring-[#ed8435]"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
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
                  <button className="rounded-full bg-[#16384f] px-4 py-2 text-sm font-medium text-white">
                    Recomendados
                  </button>
                  <button className="rounded-full border border-black/10 bg-[#f8f8f7] px-4 py-2 text-sm font-medium text-[#5d6167]">
                    Más vendidos
                  </button>
                  <button className="rounded-full border border-black/10 bg-[#f8f8f7] px-4 py-2 text-sm font-medium text-[#5d6167]">
                    Menor precio
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {productosFiltrados.map((producto) => (
                <article
                  key={producto.nombre}
                  className="overflow-hidden rounded-[1.75rem] border border-black/8 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.05)] transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="relative">
                    <span className="absolute left-4 top-4 z-10 rounded-lg bg-[#ed8435] px-3 py-1 text-sm font-semibold text-white">
                      {producto.descuento}
                    </span>
                    <Image
                      src={producto.imagen}
                      alt={producto.nombre}
                      width={900}
                      height={700}
                      className="h-48 w-full object-cover"
                    />
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
    </main>
  );
}
