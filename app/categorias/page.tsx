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

  const categoriaActiva =
    categoriaDesdeSlug(searchParams.get("categoria")) ?? "Luces y direccionales";
  const categoriaVisual = categoriaMeta(categoriaActiva);

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
    const coincideCategoria = producto.categoria === categoriaActiva;
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
      coincideCategoria &&
      coincideMarca &&
      coincideDisponibilidad &&
      coincidePrecio
    );
  });

  return (
    <main className="min-h-screen bg-[#f5f5f5] text-[#111]">
      <section
        className="text-white"
        style={{
          background: `linear-gradient(135deg, ${categoriaVisual.color} 0%, #16384f 62%, #0f2a3b 100%)`,
        }}
      >
        <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
              Catálogo Unipars
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.05em] md:text-6xl">
              Filtra por categoría y encuentra exactamente lo que necesitas.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
              Construimos una sola ventana de catálogo para que explores todas
              las líneas de producto sin duplicar páginas ni perder claridad.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {categorias.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => cambiarCategoria(item)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-sm transition-colors duration-200 ${
                    categoriaActiva === item
                      ? "border-white bg-white text-[#16384f] shadow-[0_12px_24px_rgba(255,255,255,0.18)]"
                      : "border-white/15 bg-white/10 text-white/90 hover:bg-white/18"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white/92">
              <span
                className="h-2.5 w-2.5 rounded-full bg-white"
                style={{ backgroundColor: categoriaVisual.color }}
              />
              Categoría activa:
              <span className="font-semibold text-white">{categoriaActiva}</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
            <Image
              src="/Banner de que vendemos.jpg"
              alt="Categorías y catálogo Unipars"
              width={1200}
              height={900}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-14">
        <div className="grid gap-8 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b8d91]">
                Filtros
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#16384f]">
                {categoriaActiva}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#6e7379]">
                Estás viendo los productos filtrados de esta categoría.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-[#16384f]">
                Categorías
              </h3>
              <div className="mt-4 space-y-2">
                {categorias.map((categoria) => (
                  <button
                    key={categoria}
                    type="button"
                    onClick={() => cambiarCategoria(categoria)}
                    className={`block w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors duration-200 ${
                      categoriaActiva === categoria
                        ? "bg-[#16384f] text-white shadow-[0_12px_24px_rgba(22,56,79,0.18)]"
                        : "bg-[#f8f8f7] text-[#5d6167] hover:bg-[#ececea]"
                    }`}
                  >
                    {categoria}
                  </button>
                ))}
              </div>
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
                    {productosFiltrados.length} productos en {categoriaActiva}
                  </h2>
                  <p className="mt-3 text-sm text-[#6e7379]">
                    Filtro principal activo:{" "}
                    <span className="font-semibold text-[#16384f]">
                      {categoriaActiva}
                    </span>
                  </p>
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

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
                      className="h-56 w-full object-cover"
                    />
                    <HoverCartControl
                      id={producto.slug}
                      nombre={producto.nombre}
                      precio={producto.precio}
                      imagen={producto.imagen}
                    />
                  </div>

                  <div className="space-y-4 p-5">
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-[0.24em] text-[#8b8d91]">
                        {producto.categoria} · {producto.marca}
                      </p>
                      <h3 className="text-xl font-semibold leading-tight tracking-[-0.03em] text-[#1f2328]">
                        {producto.nombre}
                      </h3>
                    </div>

                    <p className="text-sm text-[#6e7379]">
                      {producto.disponibilidad}
                    </p>

                    <div className="border-t border-black/6 pt-4">
                      <p className="text-sm text-[#a0a3a8] line-through">
                        {producto.precioAnterior}
                      </p>
                      <p className="text-3xl font-semibold tracking-[-0.03em] text-[#ed8435]">
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
