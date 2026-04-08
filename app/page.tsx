import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import HeroCarousel from "./components/hero-carousel";
import HoverCartControl from "./components/hover-cart-control";
import { categoriasData, slugCategoria } from "./data/catalog";

const productos = [
  {
    slug: "kit-luces-delanteras-premium",
    marca: "Unipars",
    nombre: "Kit luces delanteras premium",
    descripcion: 'Compatibles con linea LED de alto rendimiento para vehiculo particular.',
    descuento: "-25%",
    precioAnterior: "$320.000",
    precioActual: "$239.900",
    imagen: "/hero-unipars.jpg",
  },
  {
    slug: "motor-ventilador-compacto",
    marca: "Unipars",
    nombre: "Motor ventilador compacto",
    descripcion: "Diseno resistente, flujo constante y montaje rapido en diferentes referencias.",
    descuento: "-18%",
    precioAnterior: "$410.000",
    precioActual: "$335.500",
    imagen: "/hero-unipars.jpg",
  },
  {
    slug: "juego-cauchos-industriales",
    marca: "Unipars",
    nombre: "Juego cauchos industriales",
    descripcion: "Mayor durabilidad, agarre seguro y compuesto pensado para trabajo continuo.",
    descuento: "-32%",
    precioAnterior: "$289.000",
    precioActual: "$196.800",
    imagen: "/hero-unipars.jpg",
  },
  {
    slug: "modulo-inyeccion-de-precision",
    marca: "Unipars",
    nombre: "Modulo inyeccion de precision",
    descripcion: "Pieza calibrada para rendimiento estable y respuesta uniforme en produccion.",
    descuento: "-21%",
    precioAnterior: "$520.000",
    precioActual: "$409.900",
    imagen: "/hero-unipars.jpg",
  },
];

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
    icono: "▤",
    titulo: "Entregas a nivel nacional",
    descripcion: "Hacemos envios seguros a multiples ciudades del pais.",
  },
  {
    icono: "$",
    titulo: "Satisfecho o reembolsado",
    descripcion: "Calidad y garantia para una compra con mas tranquilidad.",
  },
  {
    icono: "%",
    titulo: "Excelentes precios y calidad",
    descripcion: "Productos competitivos y seleccionados para cada necesidad.",
  },
  {
    icono: "◔",
    titulo: "Servicio al cliente",
    descripcion: "Acompanamiento comercial y soporte en horarios de atencion.",
  },
  {
    icono: "◈",
    titulo: "Pagos seguros",
    descripcion: "Procesos protegidos y mayor confianza en cada transaccion.",
  },
];

const soluciones = [
  {
    titulo: "Soluciones para talleres exigentes",
    descripcion:
      "Encuentra piezas y categorias listas para mantener tus trabajos en movimiento.",
    etiqueta: "Hasta 30% de ahorro",
    imagen: "/hero-unipars.jpg",
  },
  {
    titulo: "Rincon ideal para motores y ventilacion",
    descripcion:
      "Descubre referencias destacadas para proyectos de alto rendimiento y precision.",
    etiqueta: "Linea destacada",
    imagen: "/hero-unipars.jpg",
  },
  {
    titulo: "Opciones pensadas para cauchos y mecanizado",
    descripcion:
      "Explora productos confiables para procesos continuos y necesidades industriales.",
    etiqueta: "Compra segura",
    imagen: "/hero-unipars.jpg",
  },
  {
    titulo: "Categorias listas para grandes pedidos",
    descripcion:
      "Arma tu carrito con soluciones seleccionadas para abastecimiento y reposicion.",
    etiqueta: "Envio nacional",
    imagen: "/hero-unipars.jpg",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f5f5] text-[#111]">
      <HeroCarousel />

      {/* CATEGORÍAS */}
      <section className="mx-auto max-w-[1440px] px-6 py-16">
        <div className="mb-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.35em] text-[#8b8d91]">
            Explora por línea
          </p>
          <h2 className="text-4xl font-semibold tracking-[-0.04em] text-[#4f545a] md:text-6xl">
            Categorías principales
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {categoriasData.map((categoria) => (
            <Link
              key={categoria.nombre}
              href={`/categorias?categoria=${slugCategoria(categoria.nombre)}`}
              className="group flex min-h-[210px] flex-col items-center justify-center rounded-[1.6rem] border border-black/8 bg-white px-5 py-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[var(--hover-color)] hover:shadow-[0_0_0_1px_var(--hover-color),0_18px_34px_color-mix(in_srgb,var(--hover-color)_18%,transparent)] focus-visible:border-[var(--hover-color)] focus-visible:shadow-[0_0_0_1px_var(--hover-color),0_18px_34px_color-mix(in_srgb,var(--hover-color)_18%,transparent)]"
              style={
                {
                  "--hover-color": categoria.color,
                } as CSSProperties
              }
            >
              <div
                className="relative mb-6 flex h-20 w-20 items-center justify-center text-[var(--hover-color)] transition-all duration-300"
              >
                <span className="absolute inset-0 rounded-full border border-[var(--hover-color)]/18 transition-all duration-300 group-hover:scale-110 group-hover:border-[var(--hover-color)]/28" />
                <span className="absolute inset-[7px] rounded-full bg-[var(--hover-color)]/6 transition-all duration-300 group-hover:bg-[var(--hover-color)]/10" />
                <span className="relative text-4xl font-normal transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6">
                  {categoria.icono}
                </span>
              </div>

              <h3 className="max-w-[11rem] text-base font-medium leading-tight text-[#4f545a] transition-colors duration-300 md:text-[1.05rem]">
                {categoria.nombre}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 pb-16">
        <div className="overflow-hidden rounded-[2rem] shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
          <Image
            src="/Banner de que vendemos.jpg"
            alt="Banner de que vendemos"
            width={1600}
            height={700}
            className="h-auto w-full object-cover"
          />
        </div>
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
              <div className="relative bg-[#f2f2f1]">
                <span className="absolute left-4 top-4 z-10 rounded-lg bg-[#ed8435] px-3 py-1 text-sm font-semibold text-white">
                  {producto.descuento}
                </span>
                <Image
                  src={producto.imagen}
                  alt={producto.nombre}
                  width={800}
                  height={600}
                  className="h-56 w-full object-cover"
                />
                <HoverCartControl
                  id={producto.slug}
                  nombre={producto.nombre}
                  precio={producto.precioActual}
                  imagen={producto.imagen}
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

                <div className="border-t border-black/6 pt-4">
                  <p className="text-sm text-[#a0a3a8] line-through">
                    {producto.precioAnterior}
                  </p>
                  <p className="text-3xl font-semibold tracking-[-0.03em] text-[#ed8435]">
                    {producto.precioActual}
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
                    <p className="text-lg font-semibold text-[#111]">
                      {testimonio.nombre}
                    </p>
                    <p className="text-sm text-[#8b8d91]">{testimonio.tiempo}</p>
                    <p className="mt-1 text-base tracking-[0.18em] text-[#f5b321]">
                      ★★★★★
                    </p>
                  </div>
                </div>

                <p className="mx-auto max-w-md text-xl leading-relaxed tracking-[-0.03em] text-[#1f2328]">
                  &ldquo;{testimonio.comentario}&rdquo;
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-black/8 bg-[#fcfcfb]">
        <div className="mx-auto grid max-w-[1440px] gap-6 px-6 py-10 md:grid-cols-2 xl:grid-cols-5">
          {beneficios.map((beneficio) => (
            <article key={beneficio.titulo} className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-black/8 bg-white text-2xl text-[#4f66ff] shadow-sm">
                {beneficio.icono}
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#111]">
                  {beneficio.titulo}
                </h3>
                <p className="mt-1 text-sm leading-6 text-[#8b8d91]">
                  {beneficio.descripcion}
                </p>
              </div>
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
              className="group overflow-hidden rounded-[1.9rem] bg-white shadow-[0_22px_50px_rgba(15,23,42,0.08)] transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="relative">
                <Image
                  src={solucion.imagen}
                  alt={solucion.titulo}
                  width={900}
                  height={1100}
                  className="h-80 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c5fb4] via-[#1c5fb4]/35 to-transparent" />
                <span className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[#ed8435] shadow-sm">
                  {solucion.etiqueta}
                </span>
              </div>

              <div className="-mt-20 relative z-10 flex min-h-[230px] flex-col justify-between rounded-t-[2rem] bg-[#1f6bc1] px-5 pb-5 pt-6 text-white">
                <div>
                  <h3 className="text-2xl font-semibold leading-tight tracking-[-0.04em]">
                    {solucion.titulo}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-white/85">
                    {solucion.descripcion}
                  </p>
                </div>

                <Link
                  href="#"
                  className="mt-6 inline-flex w-fit rounded-full bg-[#ed3434] px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#cf2323]"
                >
                  Ver productos
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="bg-[#102b3c] text-white">
        <div className="mx-auto max-w-[1440px] px-6 py-14">
          <div className="grid gap-12 border-b border-white/10 pb-12 lg:grid-cols-[1.2fr_2fr]">
            <div className="lg:pr-10 lg:border-r lg:border-white/10">
              <Link href="/" className="inline-flex">
                <Image
                  src="/logo.png"
                  alt="Unipars"
                  width={170}
                  height={60}
                  style={{ width: "170px", height: "auto" }}
                />
              </Link>

              <p className="mt-6 max-w-md text-base leading-8 text-white/68">
                Unipars conecta personas, talleres y negocios con repuestos,
                categorias y soluciones confiables para comprar con claridad,
                rapidez y respaldo.
              </p>

              <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#ed8435]">
                  Comentarios
                </p>
                <p className="mt-3 max-w-xs text-sm leading-7 text-white/70">
                  Tus comentarios nos ayudan a mejorar la experiencia de compra
                  y el servicio de Unipars.
                </p>
                <Link
                  href="#"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors duration-200 hover:text-[#ed8435]"
                >
                  Envíanos tus comentarios
                  <span className="text-[#ed8435]">›</span>
                </Link>
              </div>
            </div>

            <div className="space-y-10">
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                    Teléfono
                  </p>
                  <p className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                    (601) 286-70-87
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                    Celular y WhatsApp
                  </p>
                  <p className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                    (57) 3057249454
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                    Lunes - Viernes
                  </p>
                  <p className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                    8:00 am - 5:30 pm
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                    Sábados
                  </p>
                  <p className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                    9:00 am - 1:00 pm
                  </p>
                </div>
                <div className="flex items-start xl:justify-end">
                  <Link
                    href="#"
                    className="inline-flex rounded-full bg-[#ed8435] px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#d67024]"
                  >
                    Ver el mapa
                  </Link>
                </div>
              </div>

              <div className="grid gap-8 border-t border-white/10 pt-10 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
                    Servicio al cliente
                  </p>
                  <div className="mt-5 space-y-3 text-white/65">
                    <Link href="#" className="block transition-colors duration-200 hover:text-[#ed8435]">
                      Ayuda y soporte
                    </Link>
                    <Link href="#" className="block transition-colors duration-200 hover:text-[#ed8435]">
                      Mi cuenta
                    </Link>
                    <Link href="#" className="block transition-colors duration-200 hover:text-[#ed8435]">
                      Estado del pedido
                    </Link>
                    <Link href="#" className="block transition-colors duration-200 hover:text-[#ed8435]">
                      Políticas de devolución
                    </Link>
                    <Link href="#" className="block transition-colors duration-200 hover:text-[#ed8435]">
                      Envíos y entregas
                    </Link>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
                    Sobre nosotros
                  </p>
                  <div className="mt-5 space-y-3 text-white/65">
                    <Link href="/quienes-somos" className="block transition-colors duration-200 hover:text-[#ed8435]">
                      Quiénes somos
                    </Link>
                    <Link href="#" className="block transition-colors duration-200 hover:text-[#ed8435]">
                      Noticias
                    </Link>
                    <Link href="#" className="block transition-colors duration-200 hover:text-[#ed8435]">
                      Métodos de pago
                    </Link>
                    <Link href="#" className="block transition-colors duration-200 hover:text-[#ed8435]">
                      Opiniones
                    </Link>
                    <Link href="#" className="block transition-colors duration-200 hover:text-[#ed8435]">
                      Aliados comerciales
                    </Link>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
                    Enlaces rápidos
                  </p>
                  <div className="mt-5 space-y-3 text-white/65">
                    <Link href="#" className="block transition-colors duration-200 hover:text-[#ed8435]">
                      Buscar
                    </Link>
                    <Link href="#" className="block transition-colors duration-200 hover:text-[#ed8435]">
                      Ventas al por mayor
                    </Link>
                    <Link href="#" className="block transition-colors duration-200 hover:text-[#ed8435]">
                      Categorías
                    </Link>
                    <Link href="#" className="block transition-colors duration-200 hover:text-[#ed8435]">
                      Privacidad de datos
                    </Link>
                    <Link href="#" className="block transition-colors duration-200 hover:text-[#ed8435]">
                      Términos y condiciones
                    </Link>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
                    Catálogos
                  </p>
                  <div className="mt-5 space-y-3 text-white/65">
                    <Link href="#" className="block transition-colors duration-200 hover:text-[#ed8435]">
                      Luces y direccionales
                    </Link>
                    <Link href="#" className="block transition-colors duration-200 hover:text-[#ed8435]">
                      Motores y ventiladores
                    </Link>
                    <Link href="#" className="block transition-colors duration-200 hover:text-[#ed8435]">
                      Línea mecanizado
                    </Link>
                    <Link href="#" className="block transition-colors duration-200 hover:text-[#ed8435]">
                      Línea cauchos
                    </Link>
                    <Link href="#" className="block transition-colors duration-200 hover:text-[#ed8435]">
                      Inyección y estrusión
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-6 text-sm text-white/45 md:flex-row md:items-center md:justify-between">
            <p>© 2026 Unipars. Todos los derechos reservados.</p>
            <p>Diseñado para una experiencia clara, rápida y confiable.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
