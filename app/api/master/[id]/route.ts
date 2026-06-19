import { requireMasterUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireMasterUser();
    if (!prisma) return Response.json({ error: "DB no configurada." }, { status: 500 });

    const { id } = await params;
    const isTotalpars = id === "totalpars";

    if (isTotalpars) {
      const products = await prisma.product.findMany({
        where: { vendorId: null },
        select: { id: true, name: true, brand: true, category: true, slug: true },
      });
      const productIds = products.map((p) => p.id);
      const orderItems = await prisma.orderItem.findMany({
        where: { productId: { in: productIds } },
        select: {
          productId: true,
          name: true,
          quantity: true,
          lineTotal: true,
          order: { select: { id: true, paymentStatus: true, shippingStatus: true, createdAt: true } },
        },
      });
      return Response.json(buildCrm(null, products, orderItems));
    }

    const solicitud = await prisma.empresaSolicitud.findUnique({
      where: { id },
      include: { user: { select: { id: true, fullName: true, email: true } } },
    });
    if (!solicitud) return Response.json({ error: "Proveedor no encontrado." }, { status: 404 });

    let products: { id: string; name: string; brand: string; category: string; slug: string }[] = [];
    let orderItems: RawItem[] = [];

    if (solicitud.userId) {
      products = await prisma.product.findMany({
        where: { vendorId: solicitud.userId },
        select: { id: true, name: true, brand: true, category: true, slug: true },
      });
      if (products.length > 0) {
        const productIds = products.map((p) => p.id);
        orderItems = await prisma.orderItem.findMany({
          where: { productId: { in: productIds } },
          select: {
            productId: true,
            name: true,
            quantity: true,
            lineTotal: true,
            order: { select: { id: true, paymentStatus: true, shippingStatus: true, createdAt: true } },
          },
        });
      }
    }

    return Response.json(buildCrm(solicitud, products, orderItems));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error.";
    const status = msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500;
    return Response.json({ error: msg }, { status });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireMasterUser();
    if (!prisma) return Response.json({ error: "DB no configurada." }, { status: 500 });

    const { id } = await params;
    if (id === "totalpars") return Response.json({ error: "Totalpars no calificable." }, { status: 400 });

    const body = await req.json() as { calificacion?: number | null; estado?: string; adminNotes?: string };

    const VALID_ESTADOS = ["PENDIENTE", "EN_REVISION", "APROBADA", "RECHAZADA"];
    const data: Record<string, unknown> = {};

    if (body.calificacion !== undefined) {
      data.calificacion = body.calificacion === null ? null : Math.min(5, Math.max(1, Math.round(body.calificacion)));
    }
    if (body.estado !== undefined) {
      if (!VALID_ESTADOS.includes(body.estado)) {
        return Response.json({ error: "Estado inválido." }, { status: 400 });
      }
      data.estado = body.estado;
    }
    if (body.adminNotes !== undefined) {
      data.adminNotes = body.adminNotes;
    }

    const updated = await prisma.empresaSolicitud.update({
      where: { id },
      data,
      select: { id: true, calificacion: true, estado: true },
    });
    return Response.json(updated);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error.";
    const status = msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500;
    return Response.json({ error: msg }, { status });
  }
}

type RawItem = {
  productId: string;
  name: string;
  quantity: number;
  lineTotal: number;
  order: { id: string; paymentStatus: string; shippingStatus: string; createdAt: Date };
};

function buildCrm(
  solicitud: Record<string, unknown> | null,
  products: { id: string; name: string; brand: string; category: string; slug: string }[],
  orderItems: RawItem[],
) {
  const now = new Date();
  const paid = orderItems.filter((i) => i.order.paymentStatus === "PAID");

  // ── Period helpers ─────────────────────────────────────────────
  const startOfMonth = (y: number, m: number) => new Date(y, m, 1);
  const endOfMonth   = (y: number, m: number) => new Date(y, m + 1, 0, 23, 59, 59, 999);

  const thisY = now.getFullYear();
  const thisM = now.getMonth();
  const lastM = thisM === 0 ? 11 : thisM - 1;
  const lastMY = thisM === 0 ? thisY - 1 : thisY;

  const inRange = (items: RawItem[], from: Date, to: Date) =>
    items.filter((i) => {
      const d = new Date(i.order.createdAt);
      return d >= from && d <= to;
    });

  const revenue = (items: RawItem[]) => items.reduce((s, i) => s + i.lineTotal, 0);
  const units   = (items: RawItem[]) => items.reduce((s, i) => s + i.quantity, 0);

  const paidThisMonth = inRange(paid, startOfMonth(thisY, thisM), endOfMonth(thisY, thisM));
  const paidLastMonth = inRange(paid, startOfMonth(lastMY, lastM), endOfMonth(lastMY, lastM));
  const paidThisYear  = inRange(paid, new Date(thisY, 0, 1), new Date(thisY, 11, 31, 23, 59, 59));

  // ── Year calendar (12 months) ──────────────────────────────────
  const yearCalendar = Array.from({ length: 12 }, (_, m) => {
    const items = inRange(paid, startOfMonth(thisY, m), endOfMonth(thisY, m));
    return {
      month: new Date(thisY, m, 1).toLocaleDateString("es-CO", { month: "short" }),
      monthIndex: m,
      revenue: revenue(items),
      units: units(items),
    };
  });

  // ── Pending dispatch (paid, not shipped) ──────────────────────
  const pendingDispatch = new Set(
    orderItems
      .filter((i) => i.order.paymentStatus === "PAID" &&
        (i.order.shippingStatus === "PENDING" || i.order.shippingStatus === "PREPARING"))
      .map((i) => i.order.id),
  ).size;

  // ── Top products ───────────────────────────────────────────────
  const byProduct = new Map<string, { name: string; brand: string; category: string; slug: string; units: number; revenue: number }>();
  for (const item of paid) {
    const existing = byProduct.get(item.productId);
    if (existing) {
      existing.units += item.quantity;
      existing.revenue += item.lineTotal;
    } else {
      const p = products.find((x) => x.id === item.productId);
      byProduct.set(item.productId, {
        name: item.name,
        brand: p?.brand ?? "",
        category: p?.category ?? "",
        slug: p?.slug ?? "",
        units: item.quantity,
        revenue: item.lineTotal,
      });
    }
  }
  const topProducts = Array.from(byProduct.entries())
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  // ── Monthly last 6 months ──────────────────────────────────────
  const monthlySales = Array.from({ length: 6 }, (_, i) => {
    const offset = 5 - i;
    const m = ((thisM - offset) % 12 + 12) % 12;
    const y = thisY - (thisM - (5 - i) < 0 ? 1 : 0);
    const items = inRange(paid, startOfMonth(y, m), endOfMonth(y, m));
    return {
      label: new Date(y, m, 1).toLocaleDateString("es-CO", { month: "short", year: "2-digit" }),
      revenue: revenue(items),
      items: items.length,
    };
  });

  return {
    solicitud,
    products: products.length,
    topProducts,
    monthlySales,
    yearCalendar,
    periodSales: {
      thisMonth: { revenue: revenue(paidThisMonth), units: units(paidThisMonth) },
      lastMonth: { revenue: revenue(paidLastMonth), units: units(paidLastMonth) },
      thisYear:  { revenue: revenue(paidThisYear),  units: units(paidThisYear) },
    },
    pendingDispatch,
    totalRevenue: revenue(paid),
    totalUnits: units(paid),
    avgOrderValue: paid.length > 0 ? Math.round(revenue(paid) / paid.length) : 0,
  };
}
