import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const brandToEmail: Record<string, string> = {
  "Cauchos Industriales": "cauchosindustriales@unipars.co",
  "TecniMotor":           "tecnicaautomotriz@unipars.co",
  "AutoPrime":            "repuestosmedellin@unipars.co",
};

async function main() {
  for (const [brand, email] of Object.entries(brandToEmail)) {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) { console.log(`⚠ Usuario no encontrado: ${email}`); continue; }

    const { count } = await prisma.product.updateMany({
      where: { brand, vendorId: null },
      data: { vendorId: user.id },
    });
    console.log(`✓ ${brand} → ${email}: ${count} productos asignados`);
  }
}

main().then(() => prisma.$disconnect()).catch(console.error);
