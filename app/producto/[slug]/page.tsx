"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import AddToCartButton from "../../components/add-to-cart-button";
import { useProducts } from "../../components/products-provider";

export default function ProductoDetallePage() {
  const params = useParams<{ slug: string }>();
  const { products } = useProducts();
  const slug = params.slug;
  const producto = products.find((item) => item.slug === slug);

  if (!producto) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] text-[#111]">
        <section className="mx-auto max-w-[960px] px-6 py-20 text-center">
          <div className="rounded-[2rem] border border-dashed border-black/12 bg-white p-12 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#4f545a]">
              Producto no encontrado
            </h1>
            <p className="mt-4 text-lg text-[#6e7379]">
              Puede que este producto ya no exista o todavía no esté disponible.
            </p>
            <Link
              href="/categorias"
              className="mt-8 inline-flex rounded-full bg-[#ed8435] px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#d67024]"
            >
              Volver al catálogo
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const relacionados = products
    .filter(
      (item) =>
        item.categoria === producto.categoria && item.slug !== producto.slug,
    )
    .slice(0, 3);
  const fichaTecnica = [
    {
      etiqueta: "Observaciones",
      valor:
        "La imagen de este producto es de referencia visual y puede variar levemente frente a la versión final entregada.",
    },
    {
      etiqueta: "Material",
      valor: "Aleación técnica de alta resistencia",
    },
    {
      etiqueta: "Categoría",
      valor: producto.categoria,
    },
    {
      etiqueta: "Marca",
      valor: producto.marca,
    },
    {
      etiqueta: "Disponibilidad",
      valor: producto.disponibilidad,
    },
    {
      etiqueta: "Garantía",
      valor: "1 año de garantía del fabricante",
    },
    {
      etiqueta: "Aplicación",
      valor: "Uso técnico, industrial y de reposición especializada",
    },
    {
      etiqueta: "Origen",
      valor: "Importado",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f5f5f5] text-[#111]">
      <section className="mx-auto max-w-[1440px] px-6 py-12">
        <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-[#6e7379]">
          <Link
            href={`/categorias?categoria=${encodeURIComponent(
              producto.categoria
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, ""),
            )}`}
            className="font-medium text-[#16384f] transition-colors duration-200 hover:text-[#ed8435]"
          >
            Volver a categoría
          </Link>
          <span>·</span>
          <span>{producto.categoria}</span>
          <span>·</span>
          <span>{producto.marca}</span>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-start">
          <div className="rounded-[2rem] border border-black/8 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
            <div className="grid gap-4 md:grid-cols-[100px_minmax(0,1fr)]">
              <div className="order-2 flex gap-3 md:order-1 md:flex-col">
                <button className="overflow-hidden rounded-[1.1rem] border-2 border-[#2d7af0] bg-white p-2 shadow-sm">
                  <Image
                    src={producto.imagen}
                    alt={producto.nombre}
                    width={84}
                    height={84}
                    className="h-16 w-16 object-contain md:h-20 md:w-20"
                  />
                </button>
              </div>

              <div className="order-1 rounded-[1.6rem] bg-white md:order-2">
                <div className="flex justify-end">
                  <span className="rounded-full bg-[#edf4ff] px-4 py-2 text-sm font-medium text-[#2d7af0]">
                    Envío disponible
                  </span>
                </div>
                <div className="flex items-center justify-center px-4 py-6 md:px-10 md:py-10">
                  <Image
                    src={producto.imagen}
                    alt={producto.nombre}
                    width={1200}
                    height={900}
                    className="h-auto max-h-[620px] w-full object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-black/8">
              <div className="flex items-center justify-between border-b border-black/8 bg-[#f8f8f7] px-6 py-4">
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#33373d]">
                  Ficha técnica
                </h2>
                <span className="text-xl text-[#4f545a]">⌃</span>
              </div>

              <div className="bg-white">
                <div className="border-b border-black/8 px-6 py-4">
                  <h3 className="text-xl font-semibold text-[#33373d]">
                    Especificaciones
                  </h3>
                </div>

                <div>
                  {fichaTecnica.map((item, index) => (
                    <div
                      key={item.etiqueta}
                      className={`grid md:grid-cols-[260px_minmax(0,1fr)] ${
                        index < fichaTecnica.length - 1
                          ? "border-b border-black/8"
                          : ""
                      }`}
                    >
                      <div className="bg-[#f3f3f2] px-6 py-5 text-lg text-[#33373d]">
                        {item.etiqueta}
                      </div>
                      <div className="px-6 py-5 text-lg font-medium leading-8 text-[#22262b]">
                        {item.valor}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-[2rem] border border-black/8 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-sm font-medium text-[#2d7af0]">
                  {producto.marca}
                </p>
                <h1 className="mt-2 text-4xl font-medium leading-tight tracking-[-0.04em] text-[#33373d] md:text-5xl">
                  {producto.nombre}
                </h1>
                <p className="mt-3 text-sm text-[#6e7379]">
                  Código {producto.slug.toUpperCase().replace(/-/g, "")}
                </p>
              </div>

              <button className="text-sm font-medium text-[#2d7af0] transition-colors duration-200 hover:text-[#16384f]">
                Guardar
              </button>
            </div>

            <div className="text-[#d8dbe0]">★★★★★</div>
            <p className="text-sm text-[#6e7379]">0.0 (0)</p>

            <div className="pt-2">
              <p className="text-5xl font-semibold tracking-[-0.04em] text-[#33373d]">
                {producto.precio}
              </p>
              <p className="mt-2 text-2xl text-[#4f545a]">{producto.precioAnterior}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4">
              <div className="flex items-center overflow-hidden rounded-xl border border-black/10">
                <button className="px-5 py-3 text-2xl text-[#4f545a]">−</button>
                <div className="border-x border-black/10 px-7 py-3 text-xl text-[#33373d]">
                  1
                </div>
                <button className="px-5 py-3 text-2xl text-[#4f545a]">+</button>
              </div>

              <AddToCartButton
                id={producto.slug}
                nombre={producto.nombre}
                precio={producto.precio}
                imagen={producto.imagen}
              />
            </div>

            <div className="rounded-[1.4rem] bg-[#f6f7f8] p-6">
              <h2 className="text-2xl font-semibold text-[#33373d]">
                Especificaciones principales
              </h2>
              <ul className="mt-4 space-y-3 text-base leading-7 text-[#4f545a]">
                <li>Compatibilidad directa con la línea {producto.categoria}.</li>
                <li>Producto con respaldo comercial y disponibilidad {producto.disponibilidad.toLowerCase()}.</li>
                <li>Componente pensado para rendimiento estable y mantenimiento ágil.</li>
              </ul>
              <button className="mt-5 text-sm font-medium text-[#2d7af0] transition-colors duration-200 hover:text-[#16384f]">
                Ver más especificaciones
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-16">
        <div className="mb-8">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.35em] text-[#8b8d91]">
            Relacionados
          </p>
          <h2 className="text-3xl font-semibold uppercase tracking-[-0.04em] text-[#4f545a] md:text-5xl">
            Más productos de esta categoría
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {relacionados.map((item) => (
            <article
              key={item.slug}
              className="overflow-hidden rounded-[1.75rem] border border-black/8 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.05)]"
            >
              <Image
                src={item.imagen}
                alt={item.nombre}
                width={900}
                height={700}
                className="h-52 w-full object-cover"
              />
              <div className="space-y-4 p-5">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-[0.24em] text-[#8b8d91]">
                    {item.categoria} · {item.marca}
                  </p>
                  <h3 className="text-xl font-semibold leading-tight tracking-[-0.03em] text-[#1f2328]">
                    {item.nombre}
                  </h3>
                </div>

                <p className="text-2xl font-semibold text-[#ed8435]">
                  {item.precio}
                </p>

                <Link
                  href={`/producto/${item.slug}`}
                  className="inline-flex rounded-full bg-[#16384f] px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0f2a3b]"
                >
                  Ver producto
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
