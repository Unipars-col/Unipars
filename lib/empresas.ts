import { prisma } from "@/lib/prisma";
import type { SolicitudEstado } from "@/generated/prisma/client";

export type CreateEmpresaSolicitudInput = {
  // 1. Empresa
  nombreEmpresa: string;
  razonSocial: string;
  nit: string;
  tipoEmpresa: string;
  pais: string;
  ciudad: string;
  direccion: string;
  telefonoEmpresa: string;
  correoEmpresa: string;
  paginaWeb?: string;
  // 2. Representante legal
  repNombre: string;
  repTipoDoc: string;
  repNumDoc: string;
  repCargo: string;
  repCelular: string;
  repCorreo: string;
  // 3. Comercial
  categorias: string[];
  subcategorias?: string;
  descripcion: string;
  anosEnMercado: string;
  vendeOnline: boolean;
  linkTienda?: string;
  operaEn?: string;
  // 4. Documentos
  urlRut?: string;
  urlCamaraComercio?: string;
  urlDocRepLegal?: string;
  urlCertBancaria?: string;
  urlLogo?: string;
  urlCatalogo?: string;
  // 5. Productos
  cantidadProductos: string;
  inventarioPropio: boolean;
  preciosMayoristas: boolean;
  ofreceGarantia: boolean;
  tiempoDespacho: string;
  coberturaEnvios: string;
  // 6. Pagos
  banco: string;
  tipoCuenta: string;
  numeroCuenta: string;
  titularCuenta: string;
  emiteFactura: boolean;
  correoFacturacion: string;
  // Relación
  userId?: string;
};

export async function createEmpresaSolicitud(input: CreateEmpresaSolicitudInput) {
  if (!prisma) throw new Error("DATABASE_NOT_CONFIGURED");
  return prisma.empresaSolicitud.create({ data: input });
}

export async function getEmpresaSolicitudes() {
  if (!prisma) throw new Error("DATABASE_NOT_CONFIGURED");
  return prisma.empresaSolicitud.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, fullName: true, email: true } } },
  });
}

export async function getEmpresaSolicitudByUser(userId: string) {
  if (!prisma) throw new Error("DATABASE_NOT_CONFIGURED");
  return prisma.empresaSolicitud.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateEmpresaSolicitudEstado(
  id: string,
  estado: SolicitudEstado,
  adminNotes?: string,
) {
  if (!prisma) throw new Error("DATABASE_NOT_CONFIGURED");
  return prisma.empresaSolicitud.update({
    where: { id },
    data: { estado, adminNotes },
  });
}

export type VendorWithMetrics = {
  id: string;
  nombreEmpresa: string;
  razonSocial: string;
  nit: string;
  correoEmpresa: string;
  telefonoEmpresa: string;
  ciudad: string;
  direccion: string;
  paginaWeb: string | null;
  repNombre: string;
  repCargo: string;
  repCelular: string;
  repCorreo: string;
  categorias: string[];
  descripcion: string;
  anosEnMercado: string;
  vendeOnline: boolean;
  linkTienda: string | null;
  operaEn: string | null;
  cantidadProductos: string;
  inventarioPropio: boolean;
  preciosMayoristas: boolean;
  ofreceGarantia: boolean;
  tiempoDespacho: string;
  coberturaEnvios: string;
  // documentos
  urlRut: string | null;
  urlCamaraComercio: string | null;
  urlDocRepLegal: string | null;
  urlCertBancaria: string | null;
  urlLogo: string | null;
  urlCatalogo: string | null;
  estado: SolicitudEstado;
  adminNotes: string | null;
  createdAt: Date;
  user: { id: string; fullName: string; email: string } | null;
  productCount: number;
  orderCount: number;
  totalSales: number;
};

export async function getVendorsWithMetrics(): Promise<VendorWithMetrics[]> {
  if (!prisma) throw new Error("DATABASE_NOT_CONFIGURED");

  const solicitudes = await prisma.empresaSolicitud.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, fullName: true, email: true } } },
  });

  return Promise.all(
    solicitudes.map(async (s) => {
      if (!s.userId) {
        return { ...s, productCount: 0, orderCount: 0, totalSales: 0 };
      }

      const [productCount, orders] = await Promise.all([
        prisma!.product.count({ where: { vendorId: s.userId } }),
        prisma!.order.findMany({
          where: { userId: s.userId, paymentStatus: "PAID" },
          select: { subtotal: true },
        }),
      ]);

      const totalSales = orders.reduce((sum, o) => sum + o.subtotal, 0);
      const orderCount = await prisma!.order.count({ where: { userId: s.userId } });

      return { ...s, productCount, orderCount, totalSales };
    }),
  );
}
