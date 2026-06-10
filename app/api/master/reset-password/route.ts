import { requireMasterUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    await requireMasterUser();
    if (!prisma) return Response.json({ error: "DB no configurada." }, { status: 500 });

    const body = await req.json() as { email?: string; newPassword?: string };
    const { email, newPassword } = body;

    if (!email || !newPassword) {
      return Response.json({ error: "Faltan campos requeridos." }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return Response.json({ error: "La contraseña debe tener mínimo 8 caracteres." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() }, select: { id: true, email: true, fullName: true } });
    if (!user) return Response.json({ error: "Usuario no encontrado." }, { status: 404 });

    const passwordHash = await hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    return Response.json({ ok: true, email: user.email, fullName: user.fullName });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error.";
    const status = msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500;
    return Response.json({ error: msg }, { status });
  }
}
