import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import pg from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as never);

const PLACEHOLDER_IMAGES = [
  "https://cpjtzbhodmmgaxedmqgu.supabase.co/storage/v1/object/public/product-images/products/autoprime-bateria.jpg",
  "https://cpjtzbhodmmgaxedmqgu.supabase.co/storage/v1/object/public/product-images/products/autoprime-product.png",
  "/hero-unipars.jpg",
];

async function main() {
  const toDelete = await prisma.product.findMany({
    where: { image: { in: PLACEHOLDER_IMAGES } },
    select: { id: true, name: true, image: true },
  });

  console.log(`\nProductos a eliminar (${toDelete.length}):`);
  toDelete.forEach((p) => console.log(`  - [${p.id.slice(0, 8)}] ${p.name}`));

  if (toDelete.length === 0) {
    console.log("No se encontraron productos con imagen placeholder.");
    return;
  }

  const ids = toDelete.map((p) => p.id);

  const cartDel = await prisma.cartItem.deleteMany({ where: { productId: { in: ids } } });
  console.log(`\nCart items eliminados: ${cartDel.count}`);

  const result = await prisma.product.deleteMany({ where: { id: { in: ids } } });
  console.log(`Productos eliminados: ${result.count}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
