import type { ReactNode } from "react";
import { getSessionFromCookies } from "@/lib/auth";
import { getUserById } from "@/lib/users";
import { getVendorProducts } from "@/lib/products";
import { prisma } from "@/lib/prisma";
import { VendorProductsProvider } from "../components/vendor-products-provider";

export default async function ProveedorLayout({ children }: { children: ReactNode }) {
  let initialProducts = [] as Awaited<ReturnType<typeof getVendorProducts>>;

  try {
    const session = await getSessionFromCookies();
    if (session) {
      const user = await getUserById(session.userId);
      if (user) {
        let vendorId: string | null = null;
        if (user.role === "ADMIN") {
          vendorId = user.id;
          initialProducts = await getVendorProducts(vendorId, "Totalpars");
          return (
            <VendorProductsProvider initialProducts={initialProducts}>
              {children}
            </VendorProductsProvider>
          );
        } else if (prisma) {
          const solicitud = await prisma.empresaSolicitud.findFirst({
            where: { userId: user.id, estado: "APROBADA" },
            select: { id: true },
          });
          if (solicitud) vendorId = user.id;
        }
        if (vendorId) {
          initialProducts = await getVendorProducts(vendorId);
        }
      }
    }
  } catch {
    // unauthenticated or DB not configured — page handles the redirect
  }

  return (
    <VendorProductsProvider initialProducts={initialProducts}>
      {children}
    </VendorProductsProvider>
  );
}
