import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import BusXrayBanner from "./components/bus-xray-banner";
import CategoriesCarousel from "./components/categories-carousel";
import HeroCarousel from "./components/hero-carousel";
import HoverCartControl from "./components/hover-cart-control";
import SiteFooter from "./components/site-footer";
import { categoriasData, slugCategoria } from "./data/catalog";
import { getFeaturedProducts } from "@/lib/products";

const testimonios = [
  {
    nombre: "Jozwing A Siachoque C.",
    rol: "Transportador",
    comentario: "Excelente servicio, buena atencion al cliente y muy buena calidad en sus productos. Venden lo que necesitas y sin errores.",
  },
  {
    nombre: "Robinson Samboni Obando",
    rol: "Mecánico",
    comentario: "Eficaces, buen trato y envio rapido. En mi caso encontre muy buen precio y una asesoria clara para comprar.",
  },
  {
    nombre: "Fabio Perez Oliveros",
    rol: "Transportador",
    comentario: "Quede totalmente satisfecho con la compra. Muy recomendados por la asesoria, el producto y los tiempos de entrega.",
  },
  {
    nombre: "Carlos Medina R.",
    rol: "Taller especializado",
    comentario: "Excelente calidad en todos los productos. Los repuestos llegaron a tiempo y en perfecto estado. 100% recomendados.",
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

      {/* 1 — CATEGORÍAS */}
      <section className="py-16">
        <div className="mb-8 px-6 text-center">
          <h2 className="text-3xl font-bold text-[#ed8435] md:text-4xl">
            Categorías principales
          </h2>
        </div>
        <div className="mx-auto max-w-[1440px] px-10">
          <CategoriesCarousel />
        </div>
      </section>

      {/* 2 — PROMOS CUADRADAS */}
      {(() => {
        const promos = [
          { src: "/promo-brocha.png",   alt: "Brocha de 4\" 40% dto" },
          { src: "/promo-cera.png",     alt: "Cera para pulir 50% dto" },
          { src: "/promo-espatula.png", alt: "Espátula metálica 40% dto" },
        ];
        return (
          <section className="py-10">
            <div className="hscroll-md cols-3 mx-auto max-w-[1440px]" style={{ gap: "1rem", paddingLeft: "1.5rem", paddingRight: "0.5rem" }}>
              {promos.map((promo) => (
                <div key={promo.src} className="overflow-hidden rounded-2xl" style={{ width: "82vw" }}>
                  <Image src={promo.src} alt={promo.alt} width={600} height={600} className="w-full object-cover transition-transform duration-300 hover:scale-[1.02]" />
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      <section className="mx-auto max-w-[1440px] px-6 py-16">
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

        <div className="hscroll-md cols-4" style={{ gap: "1rem", paddingLeft: "1.5rem", paddingRight: "0.5rem", marginLeft: "-1.5rem", marginRight: "-1.5rem" }}>
          {productos.map((producto) => (
            <article
              key={producto.nombre}
              className="overflow-hidden rounded-[1.75rem] border border-black/8 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.05)] transition-transform duration-300 hover:-translate-y-1"
              style={{ width: "72vw" }}
            >
              <div className="relative bg-white">
                <span className="absolute left-4 top-4 z-10 rounded-lg bg-[#ed8435] px-3 py-1 text-sm font-semibold text-white">{producto.descuento}</span>
                <div className="flex h-52 items-center justify-center px-7 py-7">
                  <Image src={producto.imagen} alt={producto.nombre} width={800} height={600} className="max-h-[140px] w-auto max-w-full object-contain" />
                </div>
                <HoverCartControl id={producto.slug} nombre={producto.nombre} precio={producto.precio} imagen={producto.imagen} disabled={!producto.puedeComprar} />
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-[#8b8d91]">{producto.marca}</p>
                  <h3 className="text-lg font-semibold leading-tight text-[#4f545a]">{producto.nombre}</h3>
                </div>
                <p className="line-clamp-3 text-sm leading-6 text-[#7b7f85]">{producto.descripcion}</p>
                <p className="text-sm font-medium text-[#6e7379]">Stock: {producto.stock ?? 0}</p>
                <div className="border-t border-black/6 pt-4">
                  <p className="text-sm text-[#a0a3a8] line-through">{producto.precioAnterior}</p>
                  <p className="text-3xl font-semibold tracking-[-0.03em] text-[#ed8435]">{producto.precio}</p>
                </div>
                <Link href={`/producto/${producto.slug}`} className="inline-flex rounded-full bg-[#16384f] px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0f2a3b]">Ver producto</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4 — BUSXRAY */}
      <section className="mx-auto hidden max-w-[1440px] px-6 py-16 md:block">
        <BusXrayBanner />
      </section>

      {/* 5 — BANNERS INFORMATIVOS */}
      <section className="mx-auto max-w-[1440px] px-6 py-10">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Link href="/servicio-de-reparacion" className="block overflow-hidden rounded-2xl transition-transform duration-300 hover:scale-[1.01]">
            <Image
              src="/banner-cobertura.jpg"
              alt="Cobertura nacional Unipars"
              width={900}
              height={400}
              className="h-full w-full object-cover"
            />
          </Link>
          <Link href="/categorias" className="block overflow-hidden rounded-2xl transition-transform duration-300 hover:scale-[1.01]">
            <Image
              src="/banner-lo-tenemos.jpg"
              alt="Lo tenemos Unipars"
              width={900}
              height={400}
              className="h-full w-full object-cover"
            />
          </Link>
        </div>
      </section>

      {/* 6 — TESTIMONIOS */}
      <section className="py-10">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="scroll-container-safe rounded-3xl bg-[#0d1b2a] py-14">
            <div className="mb-10 px-8 text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
                Opiniones que nos impulsan
              </p>
              <h2 className="text-3xl font-bold text-[#ed8435] md:text-4xl">
                Lo que dicen nuestros clientes
              </h2>
            </div>

            <div className="hscroll-md cols-4" style={{ gap: "1rem", paddingLeft: "2rem", paddingRight: "0.5rem" }}>
              {testimonios.map((testimonio) => (
                <article
                  key={testimonio.nombre}
                  className="flex flex-col justify-between rounded-2xl bg-white p-6"
                  style={{ width: "80vw" }}
                >
                  <div>
                    <span className="text-4xl font-black leading-none text-[#ed8435]">&ldquo;</span>
                    <p className="mt-2 text-base tracking-[0.12em] text-[#ed8435]">★★★★★</p>
                    <p className="mt-3 text-[0.9rem] font-semibold leading-6 text-[#1f2328]">{testimonio.comentario}</p>
                  </div>
                  <div className="mt-5 flex items-center gap-3 border-t border-black/8 pt-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#16384f] text-sm font-bold text-white">{testimonio.nombre.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-semibold text-[#16384f]">{testimonio.nombre}</p>
                      <p className="text-xs text-[#8b8d91]">{testimonio.rol}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* 9 — PROMOS VERTICALES */}
      <section className="mx-auto max-w-[1440px] px-6 py-16">
        <div className="hscroll-md cols-4" style={{ gap: "1rem", paddingLeft: "0", paddingRight: "0.5rem" }}>
          {[
            { src: "/promo-unipars.png",    alt: "Bombín para tanque Unipars 30% off" },
            { src: "/promo-tecnomotor.png", alt: "Amortiguador Tecnimotor 30% off" },
            { src: "/promo-autoprime.png",  alt: "Batería Autoprime 30% off" },
            { src: "/promo-cauchos.png",    alt: "Cauchos Industriales 20% off" },
          ].map((promo) => (
            <div key={promo.src} className="relative aspect-[941/1672] overflow-hidden rounded-2xl" style={{ width: "55vw" }}>
              <Image
                src={promo.src}
                alt={promo.alt}
                fill
                sizes="(max-width:768px) 55vw, 25vw"
                className="object-cover object-center transition-transform duration-300 hover:scale-[1.02]"
              />
            </div>
          ))}
        </div>
      </section>

      {/* 10 — BANNER UNIPARCEROS */}
      <section className="mx-auto max-w-[1440px] px-6 pb-16">
        <div className="overflow-hidden rounded-2xl">
          <Image
            src="/banner-uniparceros-home.png"
            alt="Uniparceros - La red de talleres aliados de Unipars"
            width={2560}
            height={720}
            className="w-full object-cover"
          />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
