import { getSessionFromCookies } from "@/lib/auth";
import { getCartItemsForUser } from "@/lib/cart";
import { getUserById } from "@/lib/users";

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

function parsePriceValue(price: string) {
  const numeric = Number(price.replace(/[^\d]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) return new Response("No autorizado", { status: 401 });

  const [user, items] = await Promise.all([
    getUserById(session.userId),
    getCartItemsForUser(session.userId),
  ]);

  if (!user || items.length === 0) {
    return new Response("Carrito vacío", { status: 400 });
  }

  const IVA_RATE = 0.19;
  const subtotalConIva = items.reduce((t, i) => t + parsePriceValue(i.precio) * i.cantidad, 0);
  const subtotalBase = Math.round(subtotalConIva / (1 + IVA_RATE));
  const totalIva = subtotalConIva - subtotalBase;

  const rows = items.map((item) => {
    const unitConIva = parsePriceValue(item.precio);
    const unitBase = Math.round(unitConIva / (1 + IVA_RATE));
    const unitIva = unitConIva - unitBase;
    return `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;">
        <strong style="font-size:12px;">${item.nombre}</strong>
        ${item.sku ? `<br><span style="font-size:10px;color:#8b8d91;font-family:monospace;">Ref: ${item.sku}</span>` : ""}
        ${item.brand ? `<span style="font-size:10px;color:#8b8d91;"> · ${item.brand}</span>` : ""}
      </td>
      <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.cantidad}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatCOP(unitBase)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:right;color:#5d6167;">${formatCOP(unitIva)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700;">${formatCOP(unitConIva * item.cantidad)}</td>
    </tr>`;
  }).join("");

  const today = new Intl.DateTimeFormat("es-CO", { year: "numeric", month: "long", day: "numeric" }).format(new Date());

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Vista previa — Orden de pedido</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1f2328; background: #fff; font-size: 13px; }
    .page { max-width: 680px; margin: 0 auto; padding: 40px 36px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 3px solid #ed8435; }
    .logo { font-size: 24px; font-weight: 800; color: #16384f; letter-spacing: -0.04em; }
    .logo span { color: #ed8435; }
    .meta { text-align: right; }
    .meta p { font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #8b8d91; margin-bottom: 3px; }
    .meta strong { font-size: 15px; color: #16384f; }
    .draft-badge { display:inline-block;background:#fff6ee;color:#b85d12;font-size:10px;font-weight:700;padding:2px 9px;border-radius:99px;margin-top:5px; }
    .box { background: #f7f7f7; border-radius: 10px; padding: 16px 18px; margin-bottom: 20px; }
    .box-title { font-size: 9px; text-transform: uppercase; letter-spacing: 0.22em; color: #8b8d91; margin-bottom: 8px; }
    .box p { font-size: 12px; color: #16384f; margin-bottom: 3px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
    thead th { padding: 9px 8px; background: #16384f; color: #fff; font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; text-align: left; }
    thead th:nth-child(2) { text-align: center; }
    thead th:nth-child(3), thead th:nth-child(4), thead th:nth-child(5) { text-align: right; }
    tbody td { font-size: 12px; }
    .subtotal-row td { padding: 8px 8px; font-size: 11px; color: #5d6167; border-top: 1px solid #e5e7eb; }
    .subtotal-row td:last-child { text-align: right; font-weight: 600; }
    .subtotal-row td:nth-child(1) { text-align: right; padding-right: 14px; }
    .iva-note { font-size: 9px; color: #8b8d91; padding: 4px 8px; text-align: right; }
    .total-row td { padding: 12px 8px; font-size: 13px; font-weight: 700; color: #ed8435; background: #fff6ee; }
    .total-row td:nth-child(1) { text-align: right; }
    .total-row td:last-child { text-align: right; }
    .footer { margin-top: 36px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #8b8d91; text-align: center; }
    @media print {
      body { background: #fff; }
      .page { padding: 0; max-width: 100%; }
      @page { margin: 18mm 16mm; size: A4 portrait; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="logo">Total<span>pars</span></div>
      <div class="meta">
        <p>Vista previa de pedido</p>
        <strong>${today}</strong>
        <br><span class="draft-badge">Borrador — pendiente de pago</span>
      </div>
    </div>

    <div class="box">
      <p class="box-title">Cliente</p>
      <p><strong>${user.fullName}</strong></p>
      ${user.company ? `<p>${user.company}</p>` : ""}
      <p>${user.email}</p>
      ${user.phone ? `<p>${user.phone}</p>` : ""}
      ${user.addressLine1 ? `<p style="margin-top:6px;">${user.addressLine1}${user.city ? `, ${user.city}` : ""}${user.department ? `, ${user.department}` : ""}</p>` : ""}
    </div>

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
          <td colspan="4" style="text-align:right;padding-right:14px;">Total estimado (IVA incl.)</td>
          <td>${formatCOP(subtotalConIva)}</td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
      <p>Totalpars — Repuestos para transporte público y de carga</p>
      <p style="margin-top:3px;">Este documento es una vista previa. La orden definitiva se genera al completar el pago.</p>
    </div>
  </div>

  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
