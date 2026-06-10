import { requireMasterUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    await requireMasterUser();
    if (!prisma) return Response.json({ error: "DB no configurada." }, { status: 500 });

    const body = await req.json() as {
      solicitudId?: string;
      fullName?: string;
      email?: string;
      password?: string;
      company?: string;
    };

    const { solicitudId, fullName, email, password, company } = body;

    if (!solicitudId || !fullName || !email || !password) {
      return Response.json({ error: "Faltan campos requeridos." }, { status: 400 });
    }
    if (password.length < 8) {
      return Response.json({ error: "La contraseña debe tener mínimo 8 caracteres." }, { status: 400 });
    }

    const solicitud = await prisma.empresaSolicitud.findUnique({ where: { id: solicitudId } });
    if (!solicitud) return Response.json({ error: "Solicitud no encontrada." }, { status: 404 });
    if (solicitud.userId) return Response.json({ error: "Esta solicitud ya tiene usuario vinculado." }, { status: 409 });

    const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existing) return Response.json({ error: "Ya existe un usuario con ese correo." }, { status: 409 });

    const passwordHash = await hash(password, 10);

    const empresaNombre = company?.trim() || solicitud.nombreEmpresa;

    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        company: empresaNombre,
        passwordHash,
      },
    });

    // Vincular usuario y aprobar la solicitud para que isVendor = true
    await prisma.empresaSolicitud.update({
      where: { id: solicitudId },
      data: { userId: user.id, estado: "APROBADA" },
    });

    return Response.json({ ok: true, userId: user.id, email: user.email, fullName: user.fullName });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error.";
    const status = msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500;
    return Response.json({ error: msg }, { status });
  }
}
