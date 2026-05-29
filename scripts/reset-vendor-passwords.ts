import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const vendors = [
  { empresa: "Cauchos y Líneas Industriales",    fullName: "Marcela Ospina",        email: "cauchosindustriales@unipars.co", password: "Cauchos2024*" },
  { empresa: "Técnica Automotriz del Caribe",     fullName: "Técnica Automotriz",    email: "tecnicaautomotriz@unipars.co",  password: "Tecnica2024*" },
  { empresa: "Repuestos Medellín LTDA",           fullName: "Repuestos Medellín",    email: "repuestosmedellin@unipars.co",  password: "Repuestos2024*" },
  { empresa: "Autopartes El Riel S.A.S",          fullName: "El Riel Autopartes",    email: "autopartesriel@unipars.co",     password: "Riel2024*" },
];

async function main() {
  for (const v of vendors) {
    const passwordHash = await hash(v.password, 10);

    const user = await prisma.user.upsert({
      where: { email: v.email },
      update: { fullName: v.fullName, passwordHash },
      create: { fullName: v.fullName, email: v.email, passwordHash, role: "CUSTOMER" },
    });

    await prisma.empresaSolicitud.updateMany({
      where: { nombreEmpresa: v.empresa },
      data: { userId: user.id },
    });

    console.log(`✓ ${v.empresa}`);
    console.log(`  Correo    : ${v.email}`);
    console.log(`  Contraseña: ${v.password}`);
    console.log(`  userId    : ${user.id}`);
    console.log();
  }
}

main().then(() => prisma.$disconnect()).catch(console.error);
