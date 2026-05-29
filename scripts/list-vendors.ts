import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const solicitudes = await prisma.empresaSolicitud.findMany({
    include: { user: { select: { fullName: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  console.log("\n=== Proveedores registrados ===\n");
  for (const s of solicitudes) {
    console.log(`Empresa : ${s.nombreEmpresa}`);
    console.log(`Estado  : ${s.estado}`);
    if (s.user) {
      console.log(`Usuario : ${s.user.fullName}`);
      console.log(`Correo  : ${s.user.email}`);
    } else {
      console.log(`Usuario : (sin usuario vinculado)`);
    }
    console.log("---");
  }

  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "MASTER"] } },
    select: { fullName: true, email: true, role: true },
  });

  console.log("\n=== Usuarios Admin / Master ===\n");
  for (const u of admins) {
    console.log(`${u.role.padEnd(8)} | ${u.fullName} | ${u.email}`);
  }
}

main().then(() => prisma.$disconnect()).catch(console.error);
