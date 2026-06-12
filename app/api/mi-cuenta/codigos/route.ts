import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "EXCLUSIVE") {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!prisma) return Response.json({ codes: [] });

  const codes = await prisma.clientProductCode.findMany({
    where: { userId: session.userId },
    orderBy: { updatedAt: "desc" },
  });

  return Response.json({ codes });
}

export async function POST(request: Request) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "EXCLUSIVE") {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!prisma) return Response.json({ error: "BD no disponible." }, { status: 503 });

  const body = (await request.json()) as { productSlug?: string; productName?: string; customCode?: string };
  const { productSlug, productName, customCode } = body;

  if (!productSlug || !productName || !customCode?.trim()) {
    return Response.json({ error: "Datos incompletos." }, { status: 400 });
  }

  const code = await prisma.clientProductCode.upsert({
    where: { userId_productSlug: { userId: session.userId, productSlug } },
    update: { customCode: customCode.trim(), productName },
    create: { userId: session.userId, productSlug, productName, customCode: customCode.trim() },
  });

  return Response.json({ code });
}
