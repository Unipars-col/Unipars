import { prisma } from "@/lib/prisma";

export type ImageSlot = {
  key: string;
  label: string;
  group: string;
  tab: "home" | "ofertas" | "categorias" | "responsive";
  defaultSrc: string;
};

export const IMAGE_SLOTS: ImageSlot[] = [
  // ── HOME ──
  { key: "hero-1", label: "Hero Banner 1", group: "Carrusel principal", tab: "home", defaultSrc: "/banner-ruta-correcta.jpg" },
  { key: "hero-2", label: "Hero Banner 2", group: "Carrusel principal", tab: "home", defaultSrc: "/hero-banner-2-v2.jpg" },
  { key: "hero-3", label: "Hero Banner 3", group: "Carrusel principal", tab: "home", defaultSrc: "/hero-banner-3-v2.jpg" },
  { key: "banner-cobertura", label: "Banner Cobertura nacional", group: "Banners estáticos", tab: "home", defaultSrc: "/banner-cobertura.jpg" },
  { key: "banner-lo-tenemos", label: "Banner Lo tenemos todo", group: "Banners estáticos", tab: "home", defaultSrc: "/banner-lo-tenemos.jpg" },
  { key: "banner-uniparceros", label: "Banner Uniparceros", group: "Banners estáticos", tab: "home", defaultSrc: "/banner-uniparceros-nuevo.jpg" },
  { key: "banner-busqueda", label: "Banner búsqueda por imagen", group: "Banners estáticos", tab: "home", defaultSrc: "/banner-busqueda-imagen-v3.jpg" },
  { key: "popup-promo", label: "Pop-up promo", group: "Pop-ups", tab: "home", defaultSrc: "/popup-promo.png" },
  { key: "popup-uniparceros", label: "Pop-up Uniparceros", group: "Pop-ups", tab: "home", defaultSrc: "/servicio-reparacion/popup-uniparceros.png" },

  // ── OFERTAS ──
  { key: "promo-h-1", label: "Promo horizontal 1", group: "Banners horizontales", tab: "ofertas", defaultSrc: "/promo-brocha.png" },
  { key: "promo-h-2", label: "Promo horizontal 2", group: "Banners horizontales", tab: "ofertas", defaultSrc: "/promo-cera.png" },
  { key: "promo-h-3", label: "Promo horizontal 3", group: "Banners horizontales", tab: "ofertas", defaultSrc: "/promo-espatula.png" },
  { key: "promo-v-1", label: "Promo vertical 1", group: "Banners verticales", tab: "ofertas", defaultSrc: "/promo-totalpars.png" },
  { key: "promo-v-2", label: "Promo vertical 2", group: "Banners verticales", tab: "ofertas", defaultSrc: "/promo-tecnomotor.png" },
  { key: "promo-v-3", label: "Promo vertical 3", group: "Banners verticales", tab: "ofertas", defaultSrc: "/promo-autoprime.png" },
  { key: "promo-v-4", label: "Promo vertical 4", group: "Banners verticales", tab: "ofertas", defaultSrc: "/promo-cauchos.png" },

  // ── CATEGORÍAS ──
  { key: "banner-categorias", label: "Banner principal categorías", group: "Banners de página", tab: "categorias", defaultSrc: "/banner-categorias-v2.jpg" },
  { key: "banner-ofertas", label: "Banner página Ofertas", group: "Banners de página", tab: "categorias", defaultSrc: "/banner-ofertas.jpg" },
  { key: "banner-uniparceros-page", label: "Banner página Uniparceros", group: "Banners de página", tab: "categorias", defaultSrc: "/banner-principal-v2.jpg" },
  { key: "cat-banner-espejos-retrovisores-y-soportes", label: "Espejos retrovisores", group: "Banners de categoría", tab: "categorias", defaultSrc: "/category-banner-espejo-v2.jpg" },
  { key: "cat-banner-motores-y-ventiladores", label: "Motores y ventiladores", group: "Banners de categoría", tab: "categorias", defaultSrc: "/category-banner-motor.jpg" },
  { key: "cat-banner-luces-y-direccionales", label: "Luces y direccionales", group: "Banners de categoría", tab: "categorias", defaultSrc: "/category-banner-luces.jpg" },
  { key: "cat-banner-sistemas-limpiaparabrisas", label: "Sistemas limpiaparabrisas", group: "Banners de categoría", tab: "categorias", defaultSrc: "/category-banner-limpiaparabrisas.jpg" },
  { key: "cat-banner-linea-neumatica", label: "Línea neumática", group: "Banners de categoría", tab: "categorias", defaultSrc: "/category-banner-neumatica.jpg" },
  { key: "cat-banner-linea-inyeccion-y-extrusion", label: "Línea inyección y extrusión", group: "Banners de categoría", tab: "categorias", defaultSrc: "/category-banner-inyeccion-extrusion.jpg" },
  { key: "cat-banner-linea-mecanizado", label: "Línea mecanizado", group: "Banners de categoría", tab: "categorias", defaultSrc: "/category-banner-mecanizado.jpg" },
  { key: "cat-banner-linea-cauchos", label: "Línea cauchos", group: "Banners de categoría", tab: "categorias", defaultSrc: "/category-banner-cauchos.jpg" },
  { key: "cat-banner-adhesivos-lubricantes-y-sellantes", label: "Adhesivos, lubricantes y sellantes", group: "Banners de categoría", tab: "categorias", defaultSrc: "/category-banner-adhesivos.png" },
  { key: "cat-banner-linea-electrica", label: "Línea eléctrica", group: "Banners de categoría", tab: "categorias", defaultSrc: "/category-banner-electrica.jpg" },

  // ── RESPONSIVE (mobile) ──
  { key: "hero-1-mobile", label: "Hero Banner 1 — móvil", group: "Carrusel principal", tab: "responsive", defaultSrc: "/banner-ruta-correcta.jpg" },
  { key: "hero-2-mobile", label: "Hero Banner 2 — móvil", group: "Carrusel principal", tab: "responsive", defaultSrc: "/hero-banner-2-v2.jpg" },
  { key: "hero-3-mobile", label: "Hero Banner 3 — móvil", group: "Carrusel principal", tab: "responsive", defaultSrc: "/hero-banner-3-v2.jpg" },
  { key: "banner-cobertura-mobile", label: "Banner Cobertura — móvil", group: "Banners estáticos", tab: "responsive", defaultSrc: "/banner-cobertura.jpg" },
  { key: "banner-lo-tenemos-mobile", label: "Banner Lo tenemos — móvil", group: "Banners estáticos", tab: "responsive", defaultSrc: "/banner-lo-tenemos.jpg" },
  { key: "banner-uniparceros-mobile", label: "Banner Uniparceros — móvil", group: "Banners estáticos", tab: "responsive", defaultSrc: "/banner-uniparceros-nuevo.jpg" },
  { key: "banner-categorias-mobile", label: "Banner Categorías — móvil", group: "Página categorías", tab: "responsive", defaultSrc: "/banner-categorias-v2.jpg" },
  { key: "banner-ofertas-mobile", label: "Banner Ofertas — móvil", group: "Página categorías", tab: "responsive", defaultSrc: "/banner-ofertas.jpg" },
];

export type SiteImages = Record<string, string>;

export async function getSiteImages(): Promise<SiteImages> {
  if (!prisma) return {};
  try {
    const rows = await prisma.siteImage.findMany();
    return Object.fromEntries(rows.map((r) => [r.key, r.url]));
  } catch {
    return {};
  }
}

export function resolveImage(key: string, siteImages: SiteImages): string {
  return siteImages[key] ?? IMAGE_SLOTS.find((s) => s.key === key)?.defaultSrc ?? "";
}
