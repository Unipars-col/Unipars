import { getSessionFromCookies } from "@/lib/auth";
import { getOrderByIdForUser } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-CO", { year: "numeric", month: "long", day: "numeric" }).format(date);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromCookies();
  if (!session) return new Response("No autorizado", { status: 401 });

  const { id } = await params;
  const order = await getOrderByIdForUser(id, session.userId);
  if (!order) return new Response("Pedido no encontrado", { status: 404 });

  const slugs = order.items.map((i) => i.productId);
  const products = prisma && slugs.length
    ? await prisma.product.findMany({ where: { slug: { in: slugs } }, select: { slug: true, sku: true, brand: true } })
    : [];
  const productMap = Object.fromEntries(products.map((p) => [p.slug, p]));

  const IVA_RATE = 0.19;
  const subtotalConIva = order.subtotal;
  const subtotalBase = Math.round(subtotalConIva / (1 + IVA_RATE));
  const totalIva = subtotalConIva - subtotalBase;

  const statusLabel: Record<string, string> = {
    PENDING: "Pendiente",
    PAID: "Pagado",
    PREPARING: "En preparación",
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
    FAILED: "Fallido",
  };

  const rows = order.items.map((item) => {
    const prod = productMap[item.productId];
    const unitBase = Math.round(item.unitPrice / (1 + IVA_RATE));
    const unitIva = item.unitPrice - unitBase;
    return `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;">
        <strong style="font-size:12px;">${item.name}</strong>
        ${prod?.sku ? `<br><span style="font-size:10px;color:#8b8d91;font-family:monospace;">Ref: ${prod.sku}</span>` : ""}
        ${prod?.brand ? `<span style="font-size:10px;color:#8b8d91;"> · ${prod.brand}</span>` : ""}
      </td>
      <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatCOP(unitBase)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:right;color:#5d6167;">${formatCOP(unitIva)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700;">${formatCOP(item.lineTotal)}</td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Pedido #${String(order.orderNumber).padStart(4, "0")} — Totalpars</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1f2328; background: #fff; font-size: 13px; }
    .page { max-width: 680px; margin: 0 auto; padding: 40px 36px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 3px solid #ed8435; }
    .logo { font-size: 24px; font-weight: 800; color: #16384f; letter-spacing: -0.04em; }
    .logo span { color: #ed8435; }
    .order-id { text-align: right; }
    .order-id p { font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #8b8d91; margin-bottom: 3px; }
    .order-id strong { font-size: 14px; color: #16384f; word-break: break-all; }
    .boxes { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .box { background: #f7f7f7; border-radius: 10px; padding: 16px 18px; }
    .box-title { font-size: 9px; text-transform: uppercase; letter-spacing: 0.22em; color: #8b8d91; margin-bottom: 8px; }
    .box p { font-size: 12px; color: #16384f; margin-bottom: 3px; }
    .box strong { color: #1f2328; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
    thead th { padding: 9px 8px; background: #16384f; color: #fff; font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; text-align: left; }
    thead th:nth-child(2) { text-align: center; }
    thead th:nth-child(3), thead th:nth-child(4), thead th:nth-child(5) { text-align: right; }
    tbody td { font-size: 12px; }
    .subtotal-row td { padding: 7px 8px; font-size: 11px; color: #5d6167; border-top: 1px solid #e5e7eb; }
    .subtotal-row td:last-child { text-align: right; font-weight: 600; }
    .subtotal-row td:nth-child(1) { text-align: right; padding-right: 14px; }
    .total-row { background: #fff6ee; }
    .total-row td { padding: 12px 8px; font-size: 13px; font-weight: 700; color: #ed8435; }
    .total-row td:first-child { text-align: right; padding-right: 14px; }
    .total-row td:last-child { text-align: right; }
    .badge { display: inline-block; padding: 2px 9px; border-radius: 99px; font-size: 10px; font-weight: 700; }
    .badge-paid { background: #effaf2; color: #1f8b45; }
    .badge-pending { background: #fff6ee; color: #b85d12; }
    .footer { margin-top: 36px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #8b8d91; text-align: center; }
    .notes { background: #fffaf5; border: 1px solid #fde8d0; border-radius: 8px; padding: 12px 14px; margin-bottom: 20px; font-size: 12px; color: #5d6167; white-space: pre-wrap; }
    @media print {
      body { background: #fff; }
      .page { padding: 0; max-width: 100%; }
      @page { margin: 18mm 16mm; size: A4 portrait; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="page">
  <div class="header">
    <div class="logo">Total<span>pars</span></div>
    <div class="order-id">
      <p>Orden de pedido</p>
      <strong>#${String(order.orderNumber).padStart(4, "0")}</strong>
      <p style="margin-top:6px;font-size:12px;color:#8b8d91;">${formatDate(order.createdAt)}</p>
    </div>
  </div>

  <div class="boxes">
    <div class="box">
      <p class="box-title">Cliente</p>
      <p><strong>${order.customerName}</strong></p>
      ${order.company ? `<p>${order.company}</p>` : ""}
      <p>${order.customerEmail}</p>
      <p>${order.customerPhone}</p>
    </div>
    <div class="box">
      <p class="box-title">Dirección de entrega</p>
      <p><strong>${order.addressLine1}</strong></p>
      ${order.addressLine2 ? `<p>${order.addressLine2}</p>` : ""}
      <p>${order.city}, ${order.department}</p>
      <p style="margin-top:10px;">
        Estado de pago:
        <span class="badge ${order.paymentStatus === "PAID" ? "badge-paid" : "badge-pending"}">
          ${statusLabel[order.paymentStatus] ?? order.paymentStatus}
        </span>
      </p>
    </div>
  </div>

  ${order.notes ? `<div class="notes"><strong style="font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#8b8d91;">Notas:</strong><br>${order.notes}</div>` : ""}

  <table>
    <thead>
      <tr>
        <th>Producto / Ref.</th>
        <th>Cant.</th>
        <th>Precio base</th>
        <th>IVA 19%</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      <tr class="subtotal-row">
        <td colspan="4">Subtotal (sin IVA)</td>
        <td>${formatCOP(subtotalBase)}</td>
      </tr>
      <tr class="subtotal-row">
        <td colspan="4">IVA 19%</td>
        <td>${formatCOP(totalIva)}</td>
      </tr>
      <tr class="total-row">
        <td colspan="4" style="text-align:right;padding-right:14px;">Total del pedido (IVA incl.)</td>
        <td style="text-align:right;">${formatCOP(subtotalConIva)}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <p>Totalpars — Repuestos para transporte público y de carga</p>
    <p style="margin-top:3px;">Este documento es una confirmación de pedido. No reemplaza la factura electrónica.</p>
  </div>
  </div>

  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`;

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
