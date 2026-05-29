import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const updates = [
  { old: "vendedor1@unipars.co", new: "cauchosindustriales@unipars.co" },
  { old: "vendedor2@unipars.co", new: "tecnicaautomotriz@unipars.co" },
  { old: "vendedor3@unipars.co", new: "repuestosmedellin@unipars.co" },
  { old: "vendedor4@unipars.co", new: "autopartesriel@unipars.co" },
];

async function main() {
  for (const u of updates) {
    await prisma.user.update({ where: { email: u.old }, data: { email: u.new } });
    console.log(`✓ ${u.old} → ${u.new}`);
  }
}

main().then(() => prisma.$disconnect()).catch(console.error);
