import { requireVendorUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { vendorId } = await requireVendorUser();
    if (!prisma) return Response.json({ movements: [] });

    const movements = await prisma.inventoryMovement.findMany({
      where: { product: { vendorId } },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { product: { select: { slug: true, name: true, sku: true } } },
    });

    return Response.json({
      movements: movements.map((m) => ({
        id: m.id,
        productSlug: m.product.slug,
        productName: m.product.name,
        productSku: m.product.sku,
        type: m.type,
        quantity: m.quantity,
        stockAfter: m.stockAfter,
        note: m.note,
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error.";
    return Response.json({ error: msg }, { status: msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500 });
  }
}
