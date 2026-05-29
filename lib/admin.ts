import { getSessionFromCookies } from "@/lib/auth";
import { getUserById } from "@/lib/users";

export async function requireAdminUser() {
  const session = await getSessionFromCookies();

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  const user = await getUserById(session.userId);

  if (!user || user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }

  return user;
}

export async function requireMasterUser() {
  const session = await getSessionFromCookies();
  if (!session) throw new Error("UNAUTHORIZED");
  const user = await getUserById(session.userId);
  if (!user || user.role !== "MASTER") throw new Error("FORBIDDEN");
  return user;
}

export async function requireVendorUser() {
  const session = await getSessionFromCookies();
  if (!session) throw new Error("UNAUTHORIZED");
  const user = await getUserById(session.userId);
  if (!user) throw new Error("UNAUTHORIZED");
  // ADMIN puede actuar como vendedor también
  if (user.role === "ADMIN") return { user, vendorId: user.id };
  const { prisma } = await import("@/lib/prisma");
  if (!prisma) throw new Error("DATABASE_NOT_CONFIGURED");
  const solicitud = await prisma.empresaSolicitud.findFirst({
    where: { userId: user.id, estado: "APROBADA" },
  });
  if (!solicitud) throw new Error("FORBIDDEN");
  return { user, vendorId: user.id };
}

export async function requireSellerUser() {
  const session = await getSessionFromCookies();

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  const user = await getUserById(session.userId);

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  if (user.role !== "ADMIN" && !user.company?.trim()) {
    throw new Error("FORBIDDEN");
  }

  return user;
}
