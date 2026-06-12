import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as never);

const sol = await prisma.empresaSolicitud.create({
  data: {
    nombreEmpresa: "Repuestos Norte S.A.S",
    razonSocial: "Repuestos Norte S.A.S",
    nit: "900123456-7",
    tipoEmpresa: "SA",
    pais: "Colombia",
    ciudad: "Medellín",
    direccion: "Calle 50 # 43-90, El Centro",
    telefonoEmpresa: "6042345678",
    correoEmpresa: "contacto@repuestosnorte.co",
    repNombre: "Carlos Hernández",
    repTipoDoc: "CC",
    repNumDoc: "1045678901",
    repCargo: "Gerente General",
    repCelular: "3001234567",
    repCorreo: "carlos.hernandez@repuestosnorte.co",
    categorias: ["Frenos y suspensión", "Motor y transmisión", "Eléctrico"],
    descripcion: "Empresa especializada en repuestos para buses urbanos e intermunicipales con 12 años en el mercado antioqueño.",
    anosEnMercado: "12",
    vendeOnline: false,
    estado: "PENDIENTE",
  },
});

console.log("Solicitud creada:", sol.id, "-", sol.nombreEmpresa);
await prisma.$disconnect();
