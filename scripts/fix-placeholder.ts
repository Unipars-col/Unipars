import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import pg from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as never);

const newUrl = "https://cpjtzbhodmmgaxedmqgu.supabase.co/storage/v1/object/public/product-images/products/autoprime-bateria.jpg";
const oldUrl = "https://cpjtzbhodmmgaxedmqgu.supabase.co/storage/v1/object/public/product-images/products/autoprime-product.png";

async function main() {
  const result = await prisma.product.updateMany({
    where: { image: oldUrl },
    data: { image: newUrl },
  });
  console.log("Productos actualizados:", result.count);
  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
