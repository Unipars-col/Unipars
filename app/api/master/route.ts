import { requireMasterUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireMasterUser();
    if (!prisma) return Response.json({ error: "DB no configurada." }, { status: 500 });

    // Unipars como proveedor — productos sin vendorId
    const [uniparProducts, allOrders, vendorSolicitudes] = await Promise.all([
      prisma.product.findMany({ where: { vendorId: null }, select: { id: true, category: true } }),
      prisma.order.findMany({ select: { id: true, userId: true, subtotal: true, paymentStatus: true, createdAt: true, status: true } }),
      prisma.empresaSolicitud.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, fullName: true, email: true } } },
      }),
    ]);

    // Unipars metrics
    const categorias = Array.from(new Set(uniparProducts.map((p) => p.category)));
    const uniparsTotalOrders = allOrders.length;
    const uniparsPaidOrders = allOrders.filter((o) => o.paymentStatus === "PAID");
    const uniparsTotalSales = uniparsPaidOrders.reduce((s, o) => s + o.subtotal, 0);

    const unipar = {
      id: "unipars",
      nombre: "Unipars Colombia",
      tipo: "Proveedor oficial",
      estado: "ACTIVO",
      productCount: uniparProducts.length,
      brandCount: categorias.length,
      categorias,
      orderCount: uniparsTotalOrders,
      paidOrderCount: uniparsPaidOrders.length,
      totalSales: uniparsTotalSales,
      isUnipars: true,
    };

    // Vendor metrics por empresa
    const vendors = await Promise.all(
      vendorSolicitudes.map(async (s) => {
        if (!s.userId) {
          return {
            id: s.id,
            nombre: s.nombreEmpresa,
            tipo: s.tipoEmpresa,
            ciudad: s.ciudad,
            estado: s.estado,
            categorias: s.categorias,
            createdAt: s.createdAt,
            user: s.user,
            productCount: 0,
            orderCount: 0,
            paidOrderCount: 0,
            totalSales: 0,
            isUnipars: false,
            calificacion: s.calificacion,
          };
        }
        const vendorProductIds = await prisma!.product.findMany({
          where: { vendorId: s.userId },
          select: { id: true },
        });
        const productIds = vendorProductIds.map((p) => p.id);
        const [productCount, vendorOrders] = await Promise.all([
          Promise.resolve(productIds.length),
          productIds.length > 0
            ? prisma!.order.findMany({
                where: { items: { some: { productId: { in: productIds } } } },
                select: { id: true, subtotal: true, paymentStatus: true },
              })
            : Promise.resolve([]),
        ]);
        const paidOrders = vendorOrders.filter((o) => o.paymentStatus === "PAID");
        return {
          id: s.id,
          nombre: s.nombreEmpresa,
          tipo: s.tipoEmpresa,
          ciudad: s.ciudad,
          estado: s.estado,
          categorias: s.categorias,
          createdAt: s.createdAt,
          user: s.user,
          productCount,
          orderCount: vendorOrders.length,
          paidOrderCount: paidOrders.length,
          totalSales: paidOrders.reduce((sum, o) => sum + o.subtotal, 0),
          isUnipars: false,
          calificacion: s.calificacion,
        };
      }),
    );

    // Global stats
    const totalProducts = await prisma.product.count();
    const totalOrders = allOrders.length;
    const totalSales = allOrders.filter((o) => o.paymentStatus === "PAID").reduce((s, o) => s + o.subtotal, 0);

    return Response.json({
      global: {
        totalVendors: vendorSolicitudes.length + 1,
        totalProducts,
        totalOrders,
        totalSales,
      },
      unipars: unipar,
      vendors,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error.";
    const status = msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500;
    return Response.json({ error: msg }, { status });
  }
}
