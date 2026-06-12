import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) return Response.json({ error: "No autorizado." }, { status: 401 });
  if (!prisma) return Response.json({ error: "BD no disponible." }, { status: 503 });

  const addresses = await prisma.userAddress.findMany({
    where: { userId: session.userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    select: { id: true, label: true, department: true, city: true, addressLine1: true, addressLine2: true, isDefault: true },
  });

  return Response.json({ addresses });
}

export async function POST(request: Request) {
  const session = await getSessionFromCookies();
  if (!session) return Response.json({ error: "No autorizado." }, { status: 401 });
  if (!prisma) return Response.json({ error: "BD no disponible." }, { status: 503 });

  const body = (await request.json()) as {
    label?: string;
    department?: string;
    city?: string;
    addressLine1?: string;
    addressLine2?: string;
    isDefault?: boolean;
  };

  if (!body.department?.trim() || !body.city?.trim() || !body.addressLine1?.trim()) {
    return Response.json({ error: "Departamento, ciudad y dirección son obligatorios." }, { status: 400 });
  }

  const count = await prisma.userAddress.count({ where: { userId: session.userId } });
  if (count >= 10) {
    return Response.json({ error: "Máximo 10 direcciones por cuenta." }, { status: 400 });
  }

  if (body.isDefault) {
    await prisma.userAddress.updateMany({ where: { userId: session.userId }, data: { isDefault: false } });
  }

  const address = await prisma.userAddress.create({
    data: {
      userId: session.userId,
      label: body.label?.trim() || null,
      department: body.department.trim(),
      city: body.city.trim(),
      addressLine1: body.addressLine1.trim(),
      addressLine2: body.addressLine2?.trim() || null,
      isDefault: body.isDefault ?? count === 0,
    },
    select: { id: true, label: true, department: true, city: true, addressLine1: true, addressLine2: true, isDefault: true },
  });

  return Response.json({ address }, { status: 201 });
}
