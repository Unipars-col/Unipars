import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  // 1. Traer productos de Unipars con precio bajo (< 10000 = claramente sin los 3 ceros)
  const products = await prisma.product.findMany({
    where: { vendorId: null, price: { lt: 10000 } },
    select: { id: true, name: true, price: true, previousPrice: true },
  });

  console.log(`\n📦 ${products.length} productos de Unipars con precio < 10.000 COP`);
  if (products.length === 0) { console.log("Nada que corregir."); return; }

  // 2. Actualizar precios × 1000
  for (const p of products) {
    await prisma.product.update({
      where: { id: p.id },
      data: {
        price: p.price * 1000,
        previousPrice: p.previousPrice * 1000,
      },
    });
  }
  console.log(`✓ Precios de productos actualizados × 1000`);

  // 3. Actualizar order items de esos productos × 1000
  const productIds = products.map((p) => p.id);
  const items = await prisma.orderItem.findMany({
    where: { productId: { in: productIds } },
    select: { id: true, unitPrice: true, lineTotal: true, orderId: true },
  });
  console.log(`📋 ${items.length} order items a corregir`);

  for (const item of items) {
    await prisma.orderItem.update({
      where: { id: item.id },
      data: {
        unitPrice: item.unitPrice * 1000,
        lineTotal: item.lineTotal * 1000,
      },
    });
  }
  console.log(`✓ Order items actualizados × 1000`);

  // 4. Recalcular subtotal de las órdenes afectadas
  const orderIds = [...new Set(items.map((i) => i.orderId))];
  console.log(`🛒 ${orderIds.length} órdenes a recalcular`);

  for (const orderId of orderIds) {
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId },
      select: { lineTotal: true, quantity: true },
    });
    const subtotal = orderItems.reduce((s, i) => s + i.lineTotal, 0);
    const totalItems = orderItems.reduce((s, i) => s + i.quantity, 0);
    await prisma.order.update({
      where: { id: orderId },
      data: { subtotal, totalItems },
    });
  }
  console.log(`✓ Subtotales de órdenes recalculados`);
  console.log("\n✅ Listo. Recarga el panel maestro para ver los valores correctos.");
}

main().then(() => prisma.$disconnect()).catch(console.error);
