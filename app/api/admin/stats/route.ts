import { requireAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const adminUser = await requireAdminUser();
    if (!prisma) return Response.json({ error: "DB no configurada." }, { status: 500 });

    // Admin products: vendorId = admin user id OR vendorId = null (Totalpars brand)
    const products = await prisma.product.findMany({
      where: { OR: [{ vendorId: adminUser.id }, { vendorId: null }] },
      select: { id: true, name: true, slug: true, category: true },
    });

    const productIds = products.map((p) => p.id);

    if (productIds.length === 0) {
      return Response.json({ totalRevenue: 0, totalUnits: 0, totalOrders: 0, topProducts: [], monthlySales: [] });
    }

    const orderItems = await prisma.orderItem.findMany({
      where: { productId: { in: productIds } },
      select: {
        productId: true,
        name: true,
        quantity: true,
        lineTotal: true,
        order: { select: { id: true, paymentStatus: true, createdAt: true } },
      },
    });

    const paid = orderItems.filter((i) => i.order.paymentStatus === "PAID");

    const totalRevenue = paid.reduce((s, i) => s + i.lineTotal, 0);
    const totalUnits = paid.reduce((s, i) => s + i.quantity, 0);
    const totalOrders = new Set(paid.map((i) => i.order.id)).size;

    // Top products by units sold
    const byProduct = new Map<string, { name: string; slug: string; category: string; units: number; revenue: number }>();
    for (const item of paid) {
      const existing = byProduct.get(item.productId);
      if (existing) {
        existing.units += item.quantity;
        existing.revenue += item.lineTotal;
      } else {
        const p = products.find((x) => x.id === item.productId);
        byProduct.set(item.productId, {
          name: item.name,
          slug: p?.slug ?? "",
          category: p?.category ?? "",
          units: item.quantity,
          revenue: item.lineTotal,
        });
      }
    }

    const topProducts = Array.from(byProduct.entries())
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);

    // Monthly sales last 6 months
    const now = new Date();
    const monthlySales = Array.from({ length: 6 }, (_, i) => {
      const offset = 5 - i;
      const m = ((now.getMonth() - offset) % 12 + 12) % 12;
      const y = now.getFullYear() - (now.getMonth() - (5 - i) < 0 ? 1 : 0);
      const from = new Date(y, m, 1);
      const to = new Date(y, m + 1, 0, 23, 59, 59, 999);
      const items = paid.filter((item) => {
        const d = new Date(item.order.createdAt);
        return d >= from && d <= to;
      });
      return {
        label: from.toLocaleDateString("es-CO", { month: "short" }),
        revenue: items.reduce((s, item) => s + item.lineTotal, 0),
        units: items.reduce((s, item) => s + item.quantity, 0),
      };
    });

    return Response.json({ totalRevenue, totalUnits, totalOrders, topProducts, monthlySales });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error.";
    const status = msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500;
    return Response.json({ error: msg }, { status });
  }
}
