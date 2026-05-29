import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function main() {
  const passwordHash = await hash("master2024*", 10);

  const user = await prisma.user.upsert({
    where: { email: "master@unipars.co" },
    update: { fullName: "Master Unipars", role: "MASTER", passwordHash },
    create: {
      fullName: "Master Unipars",
      email: "master@unipars.co",
      passwordHash,
      role: "MASTER",
    },
  });

  console.log("✓ Usuario maestro listo:", user.email, "| rol:", user.role);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
