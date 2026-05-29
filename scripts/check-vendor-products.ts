import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const withVendor = await prisma.product.count({ where: { vendorId: { not: null } } });
  const withoutVendor = await prisma.product.count({ where: { vendorId: null } });
  console.log(`Productos con vendorId: ${withVendor}`);
  console.log(`Productos sin vendorId: ${withoutVendor}`);

  const vendors = await prisma.user.findMany({
    where: { empresaSolicitudes: { some: { estado: "APROBADA" } } },
    select: {
      id: true,
      email: true,
      fullName: true,
      empresaSolicitudes: { where: { estado: "APROBADA" }, select: { nombreEmpresa: true } },
      _count: { select: { products: true } },
    },
  });

  console.log("\nVendors aprobados:");
  for (const v of vendors) {
    console.log(`  ${v.email} → ${v.empresaSolicitudes[0]?.nombreEmpresa} | productos asignados: ${v._count.products}`);
  }
}

main().then(() => prisma.$disconnect()).catch(console.error);
