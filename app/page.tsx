import Image from "next/image";
import Link from "next/link";
import BusXrayBanner from "./components/bus-xray-banner";
import CategoriesCarousel from "./components/categories-carousel";
import HeroCarousel from "./components/hero-carousel";
import FeaturedProductCard from "./components/featured-product-card";
import PromoScroll from "./components/promo-scroll";
import BannerBusquedaImagen from "./components/banner-busqueda-imagen";
import PromoPopup from "./components/promo-popup";
import PromoRibbon from "./components/promo-ribbon";
import PromoCardHover from "./components/promo-card-hover";
import SiteFooter from "./components/site-footer";
import { slugCategoria } from "./data/catalog";
import { getFeaturedProducts } from "@/lib/products";


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
      <PromoRibbon />

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

      {/* 1.5 — BANNER BÚSQUEDA POR IMAGEN */}
      <section className="mx-auto max-w-[1440px] px-6 pb-6">
        <BannerBusquedaImagen />
      </section>

      {/* 2 — PROMOS CUADRADAS */}
      {(() => {
        const promos = [
          { src: "/promo-brocha.png",   alt: "Brocha de 4\" 40% dto",       href: "/categorias" },
          { src: "/promo-cera.png",     alt: "Cera para pulir 50% dto",      href: "/categorias" },
          { src: "/promo-espatula.png", alt: "Espátula metálica 40% dto",    href: "/categorias" },
          { src: "/promo-brocha.png",   alt: "Brocha de 4\" 40% dto",        href: "/categorias" },
          { src: "/promo-cera.png",     alt: "Cera para pulir 50% dto",      href: "/categorias" },
        ];
        return (
          <section className="py-14">
            <PromoScroll promos={promos} />
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
              src="/banner-cobertura-nueva.jpg"
              alt="Cobertura nacional Totalpars"
              width={900}
              height={400}
              className="h-full w-full object-cover"
            />
          </Link>
          <Link href="/categorias" className="block overflow-hidden rounded-2xl transition-transform duration-300 hover:scale-[1.01]">
            <Image
              src="/banner-lo-tenemos.jpg"
              alt="Lo tenemos Totalpars"
              width={900}
              height={400}
              className="h-full w-full object-cover"
            />
          </Link>
        </div>
      </section>




      <PromoRibbon />

      {/* 9 — PROMOS VERTICALES */}
      <section className="mx-auto max-w-[1440px] px-6 py-14">
        <div className="hscroll-md cols-4" style={{ gap: "1.5rem", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
          {[
            { src: "/promo-unipars.png",    alt: "Bombín para tanque 30% off",   video: "/promo-hover-unipars.mp4" },
            { src: "/promo-tecnomotor.png", alt: "Amortiguador Tecnimotor 30% off",       video: "/promo-hover.mp4" },
            { src: "/promo-autoprime.png",  alt: "Batería Autoprime 30% off",             video: "/promo-hover-autoprime.mp4" },
            { src: "/promo-cauchos.png",    alt: "Cauchos Industriales 20% off",          video: "/promo-hover-tecnomotor.mp4" },
          ].map((promo) => (
            <PromoCardHover
              key={promo.src}
              src={promo.src}
              alt={promo.alt}
              videoSrc={promo.video ?? undefined}
            />
          ))}
        </div>
      </section>

      {/* 10 — BANNER UNIPARCEROS */}
      <section className="mx-auto max-w-[1440px] px-6 pb-16">
        <Link href="/servicio-de-reparacion" className="block overflow-hidden rounded-2xl transition-transform duration-300 hover:scale-[1.01]">
          <Image
            src="/banner-uniparceros-cierre.jpg"
            alt="Uniparceros - La red de talleres aliados de Totalpars"
            width={2560}
            height={720}
            loading="eager"
            className="w-full object-cover"
          />
        </Link>
      </section>

      <SiteFooter />
    </main>
  );
}
