import { requireVendorUser } from "@/lib/admin";
import { adjustProductInventory } from "@/lib/products";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { vendorId } = await requireVendorUser();
    const { slug } = await context.params;
    if (prisma) {
      const p = await prisma.product.findUnique({ where: { slug }, select: { vendorId: true } });
      if (p && p.vendorId !== vendorId) return Response.json({ error: "No autorizado." }, { status: 403 });
    }
    const body = (await request.json()) as { quantity?: number; note?: string };
    const product = await adjustProductInventory(slug, Number(body.quantity || 0), body.note);
    return Response.json({ product });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error.";
    return Response.json({ error: msg }, { status: msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500 });
  }
}
