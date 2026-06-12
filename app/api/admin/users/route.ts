import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== "ADMIN" && session.role !== "MASTER")) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!prisma) return Response.json({ users: [] });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim().toLowerCase();

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { fullName: { contains: q, mode: "insensitive" } },
            { company: { contains: q, mode: "insensitive" } },
          ],
        }
      : { role: "EXCLUSIVE" },
    select: { id: true, fullName: true, email: true, company: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return Response.json({ users });
}
