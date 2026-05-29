import { requireVendorUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { vendorId } = await requireVendorUser();
    if (!prisma) return Response.json({ orders: [] });

    // Find product IDs belonging to this vendor
    const vendorProducts = await prisma.product.findMany({
      where: { vendorId },
      select: { id: true },
    });
    const productIds = vendorProducts.map((p) => p.id);

    // Get orders that contain at least one vendor product
    const orders = await prisma.order.findMany({
      where: {
        items: { some: { productId: { in: productIds } } },
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        items: { orderBy: { createdAt: "asc" } },
      },
    });

    return Response.json({ orders });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error.";
    return Response.json({ error: msg }, { status: msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500 });
  }
}
