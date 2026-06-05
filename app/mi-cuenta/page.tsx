import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/orders";
import { getUserById } from "@/lib/users";
import { prisma } from "@/lib/prisma";
import AccountProfileForm from "./profile-form";

export const dynamic = "force-dynamic";

export default async function MiCuentaPage() {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect("/login");
  }

  const user = await getUserById(session.userId);

  if (!user) {
    redirect("/login");
  }

  if (user.role === "MASTER") {
    redirect("/master");
  }

  if (user.role === "CUSTOMER" && prisma) {
    const solicitud = await prisma.empresaSolicitud.findFirst({
      where: { userId: user.id, estado: "APROBADA" },
      select: { id: true },
    }).catch(() => null);
    if (solicitud) redirect("/proveedor");
  }

  const orders = await getOrdersForUser(session.userId);

  return <AccountProfileForm user={user} orders={orders} />;
}
