import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateWompiIntegrityHash } from "@/lib/wompi";

export async function GET(request: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return Response.json({ error: "No autorizado." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return Response.json({ error: "orderId es obligatorio." }, { status: 400 });
    }

    if (!prisma) {
      return Response.json({ error: "Base de datos no disponible." }, { status: 503 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, orderNumber: true, userId: true, subtotal: true, paymentStatus: true },
    });

    if (!order || order.userId !== session.userId) {
      return Response.json({ error: "Pedido no encontrado." }, { status: 404 });
    }

    if (order.paymentStatus !== "PENDING") {
      return Response.json({ error: "Este pedido ya fue pagado." }, { status: 400 });
    }

    const amountInCents = order.subtotal * 100;
    const currency = "COP";
    const integritySecret = (process.env as Record<string, string | undefined>)["WOMPI_INTEGRITY_SECRET"];
    const integrityHash = generateWompiIntegrityHash(order.id, amountInCents, currency, integritySecret);
    const appUrl = (process.env as Record<string, string | undefined>)["NEXT_PUBLIC_APP_URL"] || "https://unipars-tech.vercel.app";

    return Response.json({
      publicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY,
      reference: order.id,
      amountInCents,
      currency,
      integrityHash,
      redirectUrl: `${appUrl}/checkout/exito?pedido=${order.id}&num=${order.orderNumber}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno al generar el pago.";
    return Response.json({ error: message }, { status: 500 });
  }
}
