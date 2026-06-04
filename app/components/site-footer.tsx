import Link from "next/link";

const topLinks = [
  { label: "Quiénes somos", href: "/quienes-somos" },
  { label: "Vender en Unipars", href: "/vender" },
  { label: "Servicio de reparación", href: "/servicio-de-reparacion" },
  { label: "Categorías", href: "/categorias" },
  { label: "Tips y videos", href: "/tips-y-videos" },
  { label: "Contacto", href: "/contacto" },
  { label: "Política de privacidad", href: "/contacto" },
  { label: "Términos del servicio", href: "/contacto" },
  { label: "WhatsApp", href: "https://wa.me/573057249454" },
  { label: "Instagram", href: "https://www.instagram.com/unipars_colombia/" },
  { label: "Facebook", href: "https://www.facebook.com/UniparsColombia?locale=es_LA" },
];

export default function SiteFooter() {
  return (
    <footer style={{ backgroundColor: "#081018" }} className="w-full border-t border-white/8">
      <div className="mx-auto max-w-[1440px] px-6 py-5 lg:px-10">

        {/* Fila de links */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {topLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              className="text-xs text-white/50 transition-colors hover:text-white/80"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Copyright y dirección */}
        <div className="mt-3 space-y-0.5">
          <p className="text-xs text-white/32">
            Copyright © 2026 Unipars Colombia S.A.S
          </p>
          <p className="text-xs text-white/32">
            Cra. 29 #10-25, Bogotá D.C., Colombia · (601) 286-70-87 · comercial1@unipars.com.co
          </p>
        </div>

      </div>
    </footer>
  );
}
