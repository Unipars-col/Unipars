import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const solicitudes = await prisma.empresaSolicitud.findMany({
    select: {
      id: true,
      nombreEmpresa: true,
      estado: true,
      userId: true,
      user: { select: { email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  for (const s of solicitudes) {
    console.log(`${s.nombreEmpresa} | ${s.estado} | userId: ${s.userId ?? "NULL"} | email: ${s.user?.email ?? "sin usuario"}`);
  }
}

main().then(() => prisma.$disconnect()).catch(console.error);
