import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromCookies();
  if (!session) return Response.json({ error: "No autorizado." }, { status: 401 });
  if (!prisma) return Response.json({ error: "BD no disponible." }, { status: 503 });

  const { id } = await params;
  const body = (await request.json()) as {
    label?: string;
    department?: string;
    city?: string;
    addressLine1?: string;
    addressLine2?: string;
    isDefault?: boolean;
  };

  const existing = await prisma.userAddress.findFirst({ where: { id, userId: session.userId } });
  if (!existing) return Response.json({ error: "Dirección no encontrada." }, { status: 404 });

  if (body.isDefault) {
    await prisma.userAddress.updateMany({ where: { userId: session.userId }, data: { isDefault: false } });
  }

  const address = await prisma.userAddress.update({
    where: { id },
    data: {
      label: body.label?.trim() ?? existing.label,
      department: body.department?.trim() ?? existing.department,
      city: body.city?.trim() ?? existing.city,
      addressLine1: body.addressLine1?.trim() ?? existing.addressLine1,
      addressLine2: body.addressLine2 !== undefined ? (body.addressLine2.trim() || null) : existing.addressLine2,
      isDefault: body.isDefault ?? existing.isDefault,
    },
    select: { id: true, label: true, department: true, city: true, addressLine1: true, addressLine2: true, isDefault: true },
  });

  return Response.json({ address });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromCookies();
  if (!session) return Response.json({ error: "No autorizado." }, { status: 401 });
  if (!prisma) return Response.json({ error: "BD no disponible." }, { status: 503 });

  const { id } = await params;
  const existing = await prisma.userAddress.findFirst({ where: { id, userId: session.userId } });
  if (!existing) return Response.json({ error: "Dirección no encontrada." }, { status: 404 });

  await prisma.userAddress.delete({ where: { id } });

  if (existing.isDefault) {
    const first = await prisma.userAddress.findFirst({ where: { userId: session.userId }, orderBy: { createdAt: "asc" } });
    if (first) await prisma.userAddress.update({ where: { id: first.id }, data: { isDefault: true } });
  }

  return Response.json({ ok: true });
}
