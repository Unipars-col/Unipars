import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { categoriasData, slugCategoria } from "@/app/data/catalog";

export const metadata: Metadata = {
  title: "Servicio de reparación | Unipars",
  description: "Soporte, agenda y aliados del servicio de reparación de Unipars.",
};

const supportCards = [
  {
    label: "Telefono",
    value: "(601) 286-70-87",
    href: "tel:+576012867087",
  },
  {
    label: "WhatsApp",
    value: "(57) 3057249454",
    href: "https://wa.me/573057249454",
  },
  {
    label: "Lunes a viernes",
    value: "8:00 am - 5:30 pm",
    href: "/contacto",
  },
  {
    label: "Sabados",
    value: "9:00 am - 1:00 pm",
    href: "/contacto",
  },
];

const supportLinks = [
  { label: "Quienes somos", href: "/quienes-somos" },
  { label: "Tips y videos", href: "/tips-y-videos" },
  { label: "Categorias", href: "/categorias" },
  { label: "Ayuda y soporte", href: "/servicio-de-reparacion" },
  { label: "Estado del pedido", href: "/mi-cuenta" },
  { label: "Terminos y privacidad", href: "/contacto" },
];

export default function ServicioDeReparacionPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f6] text-[#16384f]">
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/servicio-reparacion/banner.gif"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-[78%_center] lg:object-right"
          />
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.995)_0%,rgba(255,255,255,0.99)_36%,rgba(255,255,255,0.94)_50%,rgba(255,255,255,0.72)_60%,rgba(255,255,255,0.26)_74%,rgba(255,255,255,0.03)_88%,rgba(255,255,255,0)_100%)]" />

        <div className="relative mx-auto max-w-[1440px] px-5 pb-12 pt-12 sm:px-6 sm:pb-14 sm:pt-14 lg:px-8 lg:pb-14 lg:pt-16">
          <div className="mx-auto max-w-[430px] text-left lg:ml-[8%] lg:max-w-[620px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ed8435] sm:text-xs">
              Soporte especializado
            </p>
            <h1 className="mt-3 text-[3.2rem] font-semibold leading-[0.96] tracking-[-0.06em] text-[#ed8435] sm:mt-4 sm:text-5xl lg:max-w-[12ch] lg:text-[4rem] lg:leading-[0.94]">
              Servicio de reparacion
            </h1>

            <div className="mt-12 min-h-[320px] sm:mt-14 lg:min-h-[470px] lg:pt-12">
              <h2 className="max-w-[9ch] text-[3.05rem] font-semibold leading-[0.96] tracking-[-0.06em] text-[#38454f] sm:text-5xl sm:leading-[1.02] lg:max-w-[11ch] lg:text-[3.55rem]">
                Aqui estamos para atender tu necesidad
              </h2>
              <p className="mt-5 max-w-[30rem] text-[1.02rem] leading-8 text-[#596873] sm:text-base sm:leading-7">
                Completa el formulario y uno de nuestros asesores se pondra en contacto contigo en breve. Estamos para ayudarte con mejor atencion y cuidado.
              </p>
              <div className="mt-8">
                <Link
                  href="/contacto"
                  className="inline-flex h-14 items-center justify-center rounded-full bg-[#ed8435] px-8 text-base font-semibold text-white transition-colors duration-200 hover:bg-[#d67024] sm:text-lg"
                >
                  Agenda tu cita
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-black/6 bg-white">
        <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#38454f] sm:text-4xl">
              Nuestros aliados
            </h2>
          </div>

          <div className="mt-10">
            <Image
              src="/servicio-reparacion/logos.png"
              alt="Marcas aliadas de Unipars"
              width={4868}
              height={648}
              className="h-auto w-full object-contain"
              priority
            />
          </div>
        </div>
      </section>

      <section className="bg-[#102b3c] py-12 text-white sm:py-14">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-6 shadow-[0_32px_90px_rgba(0,0,0,0.18)] md:p-8">
            <div className="grid gap-8 border-b border-white/10 pb-8 xl:grid-cols-[1.05fr_1.35fr]">
              <div className="space-y-5">
                <Link href="/" className="inline-flex">
                  <Image
                    src="/logo.png"
                    alt="Unipars"
                    width={170}
                    height={60}
                    style={{ width: "170px", height: "auto" }}
                  />
                </Link>

                <p className="max-w-xl text-base leading-8 text-white/70">
                  Repuestos, soporte y compras claras para talleres, negocios y clientes que necesitan resolver rapido.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/contacto"
                    className="inline-flex rounded-full bg-[#ed8435] px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#d67024]"
                  >
                    Ver el mapa
                  </Link>
                  <Link
                    href="/contacto"
                    className="inline-flex rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:border-[#ed8435]/40 hover:text-[#ed8435]"
                  >
                    Envianos tus comentarios
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {supportCards.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                    className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4 transition-colors duration-200 hover:border-[#ed8435]/35 hover:bg-white/[0.07]"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
                      {item.label}
                    </p>
                    <p className="mt-3 text-xl font-semibold tracking-[-0.03em]">
                      {item.value}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid gap-8 pt-8 xl:grid-cols-[1.05fr_1fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
                  Navegacion esencial
                </p>
                <div className="mt-5 grid gap-3 text-white/68 sm:grid-cols-2 lg:grid-cols-3">
                  {supportLinks.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="transition-colors duration-200 hover:text-[#ed8435]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
                    Lineas destacadas
                  </p>
                  <Link
                    href="/categorias"
                    className="text-sm font-semibold text-[#ed8435] transition-colors duration-200 hover:text-white"
                  >
                    Ver todas
                  </Link>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {categoriasData.slice(0, 6).map((categoria) => (
                    <Link
                      key={categoria.nombre}
                      href={`/categorias?categoria=${slugCategoria(categoria.nombre)}`}
                      className="rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/78 transition-colors duration-200 hover:border-[#ed8435]/40 hover:text-[#ed8435]"
                    >
                      {categoria.nombre}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
