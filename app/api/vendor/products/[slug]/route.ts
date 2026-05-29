import { requireVendorUser } from "@/lib/admin";
import { updateProduct, deleteProduct } from "@/lib/products";
import { prisma } from "@/lib/prisma";

function errRes(error: unknown, fallback: string) {
  const msg = error instanceof Error ? error.message : fallback;
  const status = msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500;
  return Response.json({ error: msg }, { status });
}

export async function PATCH(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { vendorId } = await requireVendorUser();
    const { slug } = await context.params;
    if (prisma) {
      const existing = await prisma.product.findUnique({ where: { slug }, select: { vendorId: true } });
      if (existing && existing.vendorId !== vendorId) return Response.json({ error: "No autorizado." }, { status: 403 });
    }
    const body = await request.json();
    const product = await updateProduct(slug, body);
    return Response.json({ product });
  } catch (error) { return errRes(error, "No fue posible actualizar el producto."); }
}

export async function DELETE(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { vendorId } = await requireVendorUser();
    const { slug } = await context.params;
    if (prisma) {
      const existing = await prisma.product.findUnique({ where: { slug }, select: { vendorId: true } });
      if (existing && existing.vendorId !== vendorId) return Response.json({ error: "No autorizado." }, { status: 403 });
    }
    await deleteProduct(slug);
    return new Response(null, { status: 204 });
  } catch (error) { return errRes(error, "No fue posible eliminar el producto."); }
}
