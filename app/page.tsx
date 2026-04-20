import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import BusXrayBanner from "./components/bus-xray-banner";
import HeroCarousel from "./components/hero-carousel";
import HoverCartControl from "./components/hover-cart-control";
import SiteFooter from "./components/site-footer";
import { categoriasData, slugCategoria } from "./data/catalog";
import { getFeaturedProducts } from "@/lib/products";

const testimonios = [
  {
    nombre: "Jozwing A Siachoque C.",
    tiempo: "Hace 2 meses",
    comentario:
      "Excelente servicio, buena atencion al cliente y muy buena calidad en sus productos. Venden lo que necesitas y sin errores.",
  },
  {
    nombre: "Robinson Samboni Obando",
    tiempo: "Hace 1 mes",
    comentario:
      "Eficaces, buen trato y envio rapido. En mi caso encontre muy buen precio y una asesoria clara para comprar.",
  },
  {
    nombre: "Fabio Perez Oliveros",
    tiempo: "Hace 6 meses",
    comentario:
      "Quede totalmente satisfecho con la compra. Muy recomendados por la asesoria, el producto y los tiempos de entrega.",
  },
];

const beneficios = [
  {
    icono: "/beneficios/especializados.png",
    titulo: "Especializados en Transporte masivo",
    descripcion:
      "Contamos con experiencia directa en flotas de alto rendimiento y operaciones propias del transporte publico.",
  },
  {
    icono: "/beneficios/respaldo.png",
    titulo: "Respaldo tecnico e industrial",
    descripcion:
      "Conectamos con el respaldo de una empresa matriz y una red de soluciones en caucho y desarrollo industrial.",
  },
  {
    icono: "/beneficios/portafolio.png",
    titulo: "Portafolio especializado y variado",
    descripcion:
      "Una oferta precisa para empresas de transporte, talleres especializados y necesidades del sector publico.",
  },
  {
    icono: "/beneficios/relacion.png",
    titulo: "Relacion directa y conocimiento del cliente",
    descripcion:
      "Construimos relaciones de largo plazo con cercania tecnica, criterio comercial y experiencia compartida.",
  },
];

const soluciones = [
  {
    titulo: "Soluciones para talleres exigentes",
    descripcion: "Soluciones para talleres exigentes",
    etiqueta: "Hasta 30% de ahorro",
    imagen: "/soluciones/talleres.png",
    href: "/servicio-de-reparacion",
  },
  {
    titulo: "Categorias listas para grandes pedidos",
    descripcion: "Categorias listas para grandes pedidos",
    etiqueta: "Envio nacional",
    imagen: "/soluciones/grandes-pedidos.png",
    href: "/categorias",
  },
  {
    titulo: "Opciones pensadas para cauchos y mecanizado",
    descripcion: "Opciones pensadas para cauchos y mecanizado",
    etiqueta: "Compra segura",
    imagen: "/soluciones/mecanizado.png",
    href: `/categorias?categoria=${slugCategoria("Mecanizado")}`,
  },
  {
    titulo: "Rincon ideal para motores y ventilacion",
    descripcion: "Rincon ideal para motores y ventilacion",
    etiqueta: "Linea destacada",
    imagen: "/soluciones/motores.png",
    href: `/categorias?categoria=${slugCategoria("Motores y ventiladores")}`,
  },
];

export default async function Home() {
  const productos = await getFeaturedProducts();

  return (
    <main className="min-h-screen bg-[#f5f5f5] text-[#111]">
      <HeroCarousel />

      {/* CATEGORÍAS */}
      <section className="mx-auto max-w-[1440px] px-6 py-16">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.35em] text-[#8b8d91]">
            Explora por línea
          </p>
          <h2 className="text-4xl font-semibold tracking-[-0.04em] text-[#4f545a] md:text-6xl">
            Categorías principales
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#6e7379] md:text-base">
            Navega las líneas principales de Unipars con una vista más equilibrada y clara para encontrar repuestos más rápido.
          </p>
        </div>

        <div className="mx-auto grid max-w-[1080px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categoriasData.map((categoria) => (
            <Link
              key={categoria.nombre}
              href={`/categorias?categoria=${slugCategoria(categoria.nombre)}`}
              className="group flex min-h-[236px] flex-col items-center justify-between rounded-[1rem] border border-black/8 bg-white px-5 pb-6 pt-5 text-center transition-all duration-500 hover:-translate-y-2 hover:border-[var(--hover-color)] hover:shadow-[0_0_0_1px_var(--hover-color),0_20px_34px_color-mix(in_srgb,var(--hover-color)_18%,transparent)] focus-visible:border-[var(--hover-color)] focus-visible:shadow-[0_0_0_1px_var(--hover-color),0_20px_34px_color-mix(in_srgb,var(--hover-color)_18%,transparent)]"
              style={
                {
                  "--hover-color": categoria.color,
                } as CSSProperties
              }
            >
              <div className="relative flex h-[144px] w-full items-center justify-center overflow-visible transition-all duration-500 md:h-[156px]">
                {categoria.iconoImagen ? (
                  <div className="relative transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-[1.12]">
                    <div
                      className="absolute left-1/2 top-1/2 h-[96px] w-[96px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-100 md:h-[112px] md:w-[112px]"
                      style={{
                        backgroundColor: "color-mix(in srgb, var(--hover-color) 28%, transparent)",
                      }}
                    />
                    <Image
                      src={categoria.iconoImagen}
                      alt={categoria.nombre}
                      width={140}
                      height={96}
                      className="relative h-[122px] w-[174px] object-contain drop-shadow-[0_12px_22px_rgba(15,23,42,0.12)] transition-all duration-500 group-hover:drop-shadow-[0_18px_28px_rgba(15,23,42,0.18)] md:h-[132px] md:w-[188px]"
                    />
                  </div>
                ) : (
                  <span className="text-3xl text-[var(--hover-color)]">{categoria.icono}</span>
                )}
              </div>

              <h3 className="max-w-[11rem] text-[15px] font-semibold leading-[1.08] text-[#5b6470] transition-colors duration-300 group-hover:text-[var(--hover-color)]">
                {categoria.nombre}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 pb-16">
        <BusXrayBanner />
      </section>

      <section className="mx-auto max-w-[1440px] px-6 pb-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.35em] text-[#8b8d91]">
              Seleccionados para ti
            </p>
            <h2 className="text-3xl font-semibold uppercase tracking-[-0.04em] text-[#4f545a] md:text-5xl">
              Productos destacados
            </h2>
          </div>

          <Link
            href="#"
            className="hidden text-sm font-medium text-[#ed8435] transition-colors duration-200 hover:text-[#d67024] md:block"
          >
            Ver todos
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {productos.map((producto) => (
            <article
              key={producto.nombre}
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
                    width={800}
                    height={600}
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

              <div className="space-y-4 p-5">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-[#8b8d91]">
                    {producto.marca}
                  </p>
                  <h3 className="text-lg font-semibold leading-tight text-[#4f545a]">
                    {producto.nombre}
                  </h3>
                </div>

                <p className="line-clamp-3 text-sm leading-6 text-[#7b7f85]">
                  {producto.descripcion}
                </p>

                <p className="text-sm font-medium text-[#6e7379]">
                  Stock: {producto.stock ?? 0}
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
      </section>

      <section className="border-y border-black/8 bg-white">
        <div className="mx-auto max-w-[1440px] px-6 py-16">
          <div className="mb-12 flex items-center gap-6">
            <div className="h-px flex-1 bg-black/10" />
            <h2 className="text-center text-2xl font-semibold tracking-[-0.04em] text-[#111] md:text-4xl">
              Lo Que Nuestros Clientes Estan Diciendo
            </h2>
            <div className="h-px flex-1 bg-black/10" />
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {testimonios.map((testimonio, index) => (
              <article
                key={testimonio.nombre}
                className={`px-2 text-center lg:px-8 ${
                  index < testimonios.length - 1
                    ? "lg:border-r lg:border-black/10"
                    : ""
                }`}
              >
                <div className="mb-8 flex items-start justify-center gap-4">
                  <p className="text-6xl font-semibold leading-none tracking-[-0.06em] text-[#f5b321] md:text-7xl">
                    5.0
                  </p>
                  <div className="pt-2 text-left">
                    <p className="text-[1.1rem] font-semibold leading-6 text-[#111]">
                      {testimonio.nombre}
                    </p>
                    <p className="text-[0.95rem] text-[#8b8d91]">{testimonio.tiempo}</p>
                    <p className="mt-1 text-[0.95rem] tracking-[0.18em] text-[#f5b321]">
                      ★★★★★
                    </p>
                  </div>
                </div>

                <p className="mx-auto max-w-md text-[1.08rem] leading-9 tracking-[-0.02em] text-[#1f2328]">
                  &ldquo;{testimonio.comentario}&rdquo;
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-black/8 bg-[#fcfcfb]">
        <div className="mx-auto grid max-w-[1440px] gap-5 px-6 py-12 md:grid-cols-2 xl:grid-cols-4">
          {beneficios.map((beneficio) => (
            <article
              key={beneficio.titulo}
              className="flex min-h-[248px] flex-col items-center rounded-lg border border-black/8 bg-white px-6 py-7 text-center shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#fff8f1] shadow-[inset_0_0_0_1px_rgba(237,132,53,0.08)]">
                <Image
                  src={beneficio.icono}
                  alt=""
                  width={46}
                  height={46}
                  className="h-[46px] w-[46px] object-contain"
                />
              </div>
              <h3 className="mt-5 max-w-[18ch] text-[1.32rem] font-semibold leading-8 tracking-[-0.04em] text-[#111]">
                {beneficio.titulo}
              </h3>
              <p className="mt-3 text-[0.98rem] leading-7 text-[#7b7f85]">
                {beneficio.descripcion}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-18">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#1f2328] md:text-5xl">
            Explora soluciones que impulsan tu negocio
          </h2>
          <p className="mt-4 text-lg leading-8 text-[#7b7f85]">
            Descubre ideas, productos y categorias listas para llevar a tu
            carrito.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {soluciones.map((solucion) => (
            <article
              key={solucion.titulo}
              className="group overflow-hidden rounded-lg border border-black/10 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.12)] transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-[0.67] min-h-[480px]">
                <Image
                  src={solucion.imagen}
                  alt={solucion.titulo}
                  width={900}
                  height={1100}
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute inset-x-4 top-4 rounded-[10px] bg-white/94 px-4 py-3 text-center shadow-[0_10px_26px_rgba(15,23,42,0.18)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#ed8435]">
                    {solucion.etiqueta}
                  </p>
                  <p className="mt-1 text-[13px] font-semibold leading-4 text-[#2f3d49]">
                    {solucion.titulo}
                  </p>
                </div>

                <div className="absolute inset-x-0 bottom-0 flex justify-center p-4">
                  <Link
                    href={solucion.href}
                    className="inline-flex min-w-[104px] items-center justify-center rounded-full bg-[#f59a2e] px-4 py-2 text-[11px] font-semibold text-white transition-colors duration-200 hover:bg-[#df8622]"
                  >
                    Ver productos
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
