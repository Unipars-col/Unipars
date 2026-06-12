import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== "ADMIN" && session.role !== "MASTER")) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!prisma) return Response.json({ error: "BD no disponible." }, { status: 503 });

  const { id } = await params;
  const body = (await request.json()) as { role?: string };
  const allowedRoles = ["CUSTOMER", "EXCLUSIVE"];
  if (!body.role || !allowedRoles.includes(body.role)) {
    return Response.json({ error: "Rol no válido." }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role: body.role as "CUSTOMER" | "EXCLUSIVE" },
    select: { id: true, fullName: true, email: true, role: true },
  });

  return Response.json({ user });
}
