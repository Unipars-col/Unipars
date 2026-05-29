import { requireVendorUser } from "@/lib/admin";
import { updateOrderShipping } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { vendorId } = await requireVendorUser();
    const { id } = await context.params;

    // Verify the order contains at least one product from this vendor
    if (prisma) {
      const vendorProducts = await prisma.product.findMany({
        where: { vendorId },
        select: { id: true },
      });
      const productIds = vendorProducts.map((p) => p.id);

      const order = await prisma.order.findFirst({
        where: { id, items: { some: { productId: { in: productIds } } } },
        select: { id: true },
      });

      if (!order) {
        return Response.json({ error: "No tienes permisos para actualizar este pedido." }, { status: 403 });
      }
    }

    const body = (await request.json()) as {
      shippingStatus?: "PENDING" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
      paymentStatus?: "PENDING" | "PAID" | "FAILED";
      carrier?: string;
      trackingNumber?: string;
      adminNotes?: string;
    };

    if (!id || !body.shippingStatus) {
      return Response.json({ error: "Pedido y estado de envío son obligatorios." }, { status: 400 });
    }

    const order = await updateOrderShipping(id, {
      shippingStatus: body.shippingStatus,
      paymentStatus: body.paymentStatus,
      carrier: body.carrier,
      trackingNumber: body.trackingNumber,
      adminNotes: body.adminNotes,
    });

    return Response.json({ order, message: "Pedido actualizado correctamente." });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error.";
    const status =
      msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401
      : msg === "ORDER_NOT_FOUND" ? 404
      : msg === "INVALID_SHIPPING_STATUS" || msg === "INVALID_PAYMENT_STATUS" ? 400
      : 500;
    const message =
      msg === "UNAUTHORIZED" ? "No autorizado."
      : msg === "FORBIDDEN" ? "No tienes permisos para actualizar pedidos."
      : msg === "ORDER_NOT_FOUND" ? "No encontramos ese pedido."
      : "No fue posible actualizar el pedido.";
    return Response.json({ error: message }, { status });
  }
}
