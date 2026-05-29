import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const brands = await prisma.product.groupBy({
    by: ["brand"],
    _count: true,
    orderBy: { _count: { brand: "desc" } },
  });
  brands.forEach((b) => console.log(`${b._count} - ${b.brand}`));
}

main().then(() => prisma.$disconnect()).catch(console.error);
