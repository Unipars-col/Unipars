import { requireVendorUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { createProduct } from "@/lib/products";
import type { AdminProductInput } from "@/app/components/products-provider";

export async function GET() {
  try {
    const { vendorId } = await requireVendorUser();
    if (!prisma) return Response.json({ products: [] });

    const rows = await prisma.product.findMany({
      where: { vendorId, active: true },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ products: rows });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error.";
    return Response.json({ error: msg }, { status: msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { vendorId } = await requireVendorUser();
    const body = (await request.json()) as AdminProductInput;
    const product = await createProduct(body, vendorId);
    return Response.json({ product }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error.";
    return Response.json({ error: msg }, { status: msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500 });
  }
}
