import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const customers = [
  { fullName: "Carlos Méndez",   email: "carlos.mendez@gmail.com",   phone: "3101234567", city: "Bogotá",       department: "Cundinamarca", address: "Cra 15 # 85-32" },
  { fullName: "Laura Gómez",     email: "laura.gomez@hotmail.com",   phone: "3157654321", city: "Medellín",     department: "Antioquia",   address: "Cll 50 # 43-20" },
  { fullName: "Andrés Torres",   email: "andres.torres@yahoo.com",   phone: "3209876543", city: "Cali",         department: "Valle",       address: "Av 6N # 23-15" },
  { fullName: "Valentina Ruiz",  email: "vale.ruiz@outlook.com",     phone: "3142345678", city: "Barranquilla", department: "Atlántico",   address: "Cra 43 # 75-10" },
  { fullName: "Diego Herrera",   email: "diego.herrera@gmail.com",   phone: "3165432109", city: "Bucaramanga",  department: "Santander",   address: "Cll 35 # 28-60" },
  { fullName: "Sofía Martínez",  email: "sofia.martinez@gmail.com",  phone: "3118765432", city: "Pereira",      department: "Risaralda",   address: "Cra 8 # 20-45" },
  { fullName: "Julián Ospina",   email: "julian.ospina@yahoo.com",   phone: "3204567890", city: "Manizales",    department: "Caldas",      address: "Cll 23 # 18-10" },
  { fullName: "Camila Vargas",   email: "camila.vargas@hotmail.com", phone: "3152345678", city: "Cartagena",    department: "Bolívar",     address: "Av El Lago # 5-30" },
];

const shippingStatuses = ["PENDING", "PREPARING", "SHIPPED", "DELIVERED"] as const;
const orderStatuses    = ["PENDING", "PAID"] as const;

function randomDate(daysBack: number) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  d.setHours(Math.floor(Math.random() * 10) + 8);
  d.setMinutes(Math.floor(Math.random() * 60));
  return d;
}

function pick<T extends readonly unknown[]>(arr: T): T[number] {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fmtCOP(value: number) {
  return value.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 });
}

async function seedVendor(label: string, products: Awaited<ReturnType<typeof prisma.product.findMany>>, userRecords: { id: string }[], count = 10) {
  if (products.length === 0) { console.log(`  ⚠ Sin productos — saltando`); return; }

  for (let i = 0; i < count; i++) {
    const customerInfo = customers[i % customers.length];
    const customer     = userRecords[i % userRecords.length];
    const itemCount    = Math.floor(Math.random() * 3) + 1;
    const selected     = [...products].sort(() => Math.random() - 0.5).slice(0, itemCount);
    const items        = selected.map((p) => ({ product: p, qty: Math.floor(Math.random() * 3) + 1 }));
    const subtotal     = items.reduce((s, { product, qty }) => s + product.price * qty, 0);
    const totalItems   = items.reduce((s, { qty }) => s + qty, 0);
    const createdAt    = randomDate(120);
    const orderStatus  = pick(orderStatuses) as "PENDING" | "PAID";
    const shippingStatus = orderStatus === "PAID"
      ? pick(shippingStatuses) as "PENDING" | "PREPARING" | "SHIPPED" | "DELIVERED"
      : "PENDING" as const;

    const order = await prisma.order.create({
      data: {
        userId:         customer.id,
        status:         orderStatus,
        paymentStatus:  orderStatus === "PAID" ? "PAID" : "PENDING",
        shippingStatus,
        customerName:   customerInfo.fullName,
        customerEmail:  customerInfo.email,
        customerPhone:  customerInfo.phone,
        department:     customerInfo.department,
        city:           customerInfo.city,
        addressLine1:   customerInfo.address,
        subtotal,
        totalItems,
        createdAt,
        updatedAt: createdAt,
        items: {
          create: items.map(({ product, qty }) => ({
            productId: product.id,
            name:      product.name,
            image:     product.image,
            unitPrice: product.price,
            quantity:  qty,
            lineTotal: product.price * qty,
            createdAt,
          })),
        },
      },
    });

    console.log(`  ✓ #${order.id.slice(-6)} | ${customerInfo.fullName} | ${itemCount} ítem(s) | ${fmtCOP(subtotal)} | ${orderStatus}/${shippingStatus}`);
  }
}

async function main() {
  // Upsert clientes de prueba
  const userRecords = await Promise.all(
    customers.map((c) =>
      prisma.user.upsert({
        where: { email: c.email },
        update: {},
        create: { fullName: c.fullName, email: c.email, passwordHash: "seed-no-login", role: "CUSTOMER" },
      })
    )
  );

  // ── UNIPARS (productos sin vendorId) ──────────────────────────
  console.log("\n🏢 Unipars Colombia");
  const uniProducts = await prisma.product.findMany({
    where: { vendorId: null, active: true },
    orderBy: { createdAt: "desc" },
    take: 40,
  });
  await seedVendor("Unipars", uniProducts, userRecords, 15);

  // ── PROVEEDORES EXTERNOS ──────────────────────────────────────
  const vendorEmails = [
    { email: "cauchosindustriales@unipars.co", label: "Cauchos y Líneas Industriales" },
    { email: "tecnicaautomotriz@unipars.co",   label: "Técnica Automotriz del Caribe" },
    { email: "repuestosmedellin@unipars.co",   label: "Repuestos Medellín LTDA" },
    { email: "autopartesriel@unipars.co",      label: "Autopartes El Riel S.A.S" },
  ];

  for (const { email, label } of vendorEmails) {
    console.log(`\n📦 ${label}`);
    const vendor = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!vendor) { console.log("  ⚠ Usuario no encontrado"); continue; }

    const products = await prisma.product.findMany({
      where: { vendorId: vendor.id, active: true },
    });
    await seedVendor(label, products, userRecords, 10);
  }

  console.log("\n✅ Simulación completa.");
}

main().then(() => prisma.$disconnect()).catch(console.error);
