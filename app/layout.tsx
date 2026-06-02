import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});
import { CartProvider } from "./components/cart-provider";
import { ProductsProvider } from "./components/products-provider";
import SiteHeader from "./components/site-header";
import SupportChat from "./components/support-chat";
import ScrollToTop from "./components/scroll-to-top";
import MobileBottomNav from "./components/mobile-bottom-nav";
import VisualSearchModal from "./components/visual-search-modal";
import { getProducts } from "@/lib/products";
import { getSessionFromCookies } from "@/lib/auth";
import { getUserById } from "@/lib/users";
import { getCartItemsForUser } from "@/lib/cart";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Unipars — Repuestos para transporte público y de carga",
  description: "Encuentra repuestos de calidad para buses, camiones y vehículos de carga. Amplio catálogo, entrega nacional y red de talleres aliados Uniparceros.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [initialProducts, session] = await Promise.all([
    getProducts(),
    getSessionFromCookies(),
  ]);

  const currentUser = session ? await getUserById(session.userId) : null;

  const [initialCartItems, vendorSolicitud] = await Promise.all([
    currentUser ? getCartItemsForUser(currentUser.id) : Promise.resolve([]),
    currentUser?.role === "CUSTOMER" && prisma
      ? prisma.empresaSolicitud.findFirst({
          where: { userId: currentUser.id, estado: "APROBADA" },
          select: { id: true },
        }).catch(() => null)
      : Promise.resolve(null),
  ]);

  const isVendor = !!vendorSolicitud;
  const cartProviderKey = `${currentUser?.id ?? "guest"}:${initialCartItems
    .map((item) => `${item.id}:${item.cantidad}`)
    .join("|")}`;

  return (
    <html lang="es" className={`h-full antialiased ${poppins.variable}`} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col pb-16 md:pb-0">
        <ProductsProvider initialProducts={initialProducts}>
          <CartProvider
            key={cartProviderKey}
            initialItems={initialCartItems}
            currentUserId={currentUser?.id ?? null}
          >
            <SiteHeader
              currentUser={
                currentUser
                  ? { fullName: currentUser.fullName, role: currentUser.role }
                  : null
              }
              isVendor={isVendor}
            />
            {children}
            <VisualSearchModal />
            <SupportChat />
            <ScrollToTop />
            <MobileBottomNav />
          </CartProvider>
        </ProductsProvider>
      </body>
    </html>
  );
}
