import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "EXCLUSIVE") {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!prisma) return Response.json({ error: "BD no disponible." }, { status: 503 });

  const { id } = await params;

  await prisma.clientProductCode.deleteMany({
    where: { id, userId: session.userId },
  });

  return Response.json({ ok: true });
}
