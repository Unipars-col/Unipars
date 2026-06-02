import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import BusXrayBanner from "./components/bus-xray-banner";
import CategoriesCarousel from "./components/categories-carousel";
import HeroCarousel from "./components/hero-carousel";
import FeaturedProductCard from "./components/featured-product-card";
import PromoPopup from "./components/promo-popup";
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
      <PromoPopup />
      <HeroCarousel />

      {/* 1 — CATEGORÍAS */}
      <section className="py-14">
        <div className="mb-8 px-6 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#8b8d91]">
            Explora por línea
          </p>
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
          <section className="py-14">
            <div className="hscroll-md cols-3 mx-auto max-w-[1440px]" style={{ gap: "1.5rem", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
              {promos.map((promo) => (
                <div key={promo.src} className="overflow-hidden rounded-2xl" style={{ width: "82vw" }}>
                  <Image src={promo.src} alt={promo.alt} width={600} height={600} className="w-full object-cover transition-transform duration-300 hover:scale-[1.02]" />
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      <section className="mx-auto max-w-[1440px] px-6 py-14" style={{ overflow: "visible" }}>
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#8b8d91]">
            Seleccionados para ti
          </p>
          <h2 className="text-3xl font-bold text-[#ed8435] md:text-4xl">
            Productos destacados
          </h2>
        </div>

        <div className="hscroll-md cols-4" style={{ gap: "1.5rem", paddingLeft: "1.5rem", paddingRight: "1.5rem", marginLeft: "-1.5rem", marginRight: "-1.5rem", paddingTop: "2rem", paddingBottom: "2rem" }}>
          {productos.map((producto) => (
            <FeaturedProductCard
              key={producto.slug}
              slug={producto.slug}
              nombre={producto.nombre}
              marca={producto.marca}
              descripcion={producto.descripcion}
              imagen={producto.imagen}
              precio={producto.precio}
              precioAnterior={producto.precioAnterior}
              descuento={producto.descuento ?? ""}
              stock={producto.stock ?? 0}
              puedeComprar={producto.puedeComprar ?? false}
            />
          ))}
        </div>
      </section>

      {/* 4 — BUSXRAY */}
      <section className="mx-auto hidden max-w-[1440px] px-6 py-16 md:block">
        <BusXrayBanner />
      </section>

      {/* 5 — BANNERS INFORMATIVOS */}
      <section className="mx-auto max-w-[1440px] px-6 py-14">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Link href="/servicio-de-reparacion" className="block overflow-hidden rounded-2xl transition-transform duration-300 hover:scale-[1.01]">
            <Image
              src="/banner-cobertura-v2.jpg"
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
      <section className="py-14">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="scroll-container-safe rounded-3xl bg-[#0d1b2a] py-14">
            <div className="mb-10 px-10 text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
                Opiniones que nos impulsan
              </p>
              <h2 className="text-3xl font-bold text-[#ed8435] md:text-4xl">
                Lo que dicen nuestros clientes
              </h2>
            </div>

            <div className="px-6 md:px-10" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "1.5rem", overflowX: "auto" }}>
              {testimonios.map((testimonio) => (
                <article key={testimonio.nombre} className="flex flex-col justify-between rounded-2xl bg-white p-6" style={{ minWidth: "260px" }}>
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
      <section className="mx-auto max-w-[1440px] px-6 py-14">
        <div className="hscroll-md cols-4" style={{ gap: "1.5rem", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
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
            src="/banner-uniparceros-home.jpg"
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
