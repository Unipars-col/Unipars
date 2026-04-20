import Image from "next/image";
import Link from "next/link";
const footerColumns = [
  {
    title: "Empresa",
    links: [
      { label: "Quienes somos", href: "/quienes-somos" },
      { label: "Contacto", href: "/contacto" },
      { label: "Tips y videos", href: "/tips-y-videos" },
    ],
  },
  {
    title: "Soporte",
    links: [
      { label: "Servicio de reparacion", href: "/servicio-de-reparacion" },
      { label: "Mi cuenta", href: "/mi-cuenta" },
      { label: "Categorias", href: "/categorias" },
    ],
  },
  {
    title: "Atencion al cliente",
    links: [
      { label: "(601) 286-70-87", href: "tel:+576012867087" },
      { label: "WhatsApp: (57) 305 724 9454", href: "https://wa.me/573057249454" },
      {
        label: "Cra. 29 #10-25, Bogota, Colombia",
        href: "https://www.google.com/maps/search/?api=1&query=Cra.+29+%2310-25+Bogota+Colombia",
      },
      { label: "commercial@unipars.com.co", href: "mailto:commercial@unipars.com.co" },
    ],
  },
];

const legalLinks = [
  { label: "Politica de privacidad", href: "/contacto" },
  { label: "Terminos del servicio", href: "/contacto" },
  { label: "Mapa del sitio", href: "/categorias" },
];

const socialLinks = [
  { label: "WhatsApp", href: "https://wa.me/573057249454" },
  { label: "Facebook", href: "https://www.facebook.com/UniparsColombia?locale=es_LA" },
  { label: "Instagram", href: "https://www.instagram.com/unipars_colombia/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/unipars-colombia/?viewAsMember=true" },
  { label: "TikTok", href: "https://www.tiktok.com/@grupogeu" },
];

export default function SiteFooter() {
  return (
    <footer
      className="w-full text-white"
      style={{ backgroundColor: "#081018" }}
    >
      <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-8">
        <div className="grid gap-12 border-b border-white/12 pb-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.15fr)]">
          <div>
            <Link href="/" className="inline-flex">
              <Image
                src="/logo-white.png"
                alt="Unipars"
                width={168}
                height={58}
                style={{ width: "168px", height: "auto" }}
              />
            </Link>

            <p className="mt-6 max-w-[22rem] text-sm leading-7 text-white/72">
              Repuestos y atencion comercial especializada para transporte masivo,
              talleres y operaciones que necesitan respuesta clara.
            </p>
          </div>

          <div className="grid gap-x-10 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
            {footerColumns.map((column) => (
              <div key={column.title} className="min-w-0">
                <p className="text-2xl font-semibold tracking-[-0.03em] text-white">
                  {column.title}
                </p>
                <div className="mt-6 grid gap-4">
                  {column.links.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                      className="block text-base leading-7 text-white/74 transition-colors duration-200 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>

        <div className="flex flex-col gap-6 pt-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/52">
            <p>© 2026 Unipars. Todos los derechos reservados.</p>
            {legalLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="transition-colors duration-200 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-white/70 transition-colors duration-200 hover:text-white"
              >
                {social.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
