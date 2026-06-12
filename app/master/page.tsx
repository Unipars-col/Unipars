"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function fmt(v: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v);
}

type VendorMetric = {
  id: string;
  nombre: string;
  tipo: string;
  ciudad?: string;
  estado: string;
  categorias?: string[];
  createdAt: string;
  user?: { fullName: string; email: string } | null;
  contactEmail?: string | null;
  contactName?: string | null;
  productCount: number;
  orderCount: number;
  paidOrderCount: number;
  totalSales: number;
  isTotalpars: boolean;
  brands?: string[];
  calificacion?: number | null;
};

type TopProduct = { id: string; name: string; brand: string; category: string; slug: string; units: number; revenue: number };
type MonthlySale = { label: string; revenue: number; items: number };
type CalMonth = { month: string; monthIndex: number; revenue: number; units: number };
type PeriodSales = { revenue: number; units: number };

type VendorDetail = {
  solicitud: Record<string, unknown> | null;
  products: number;
  topProducts: TopProduct[];
  monthlySales: MonthlySale[];
  yearCalendar: CalMonth[];
  periodSales: { thisMonth: PeriodSales; lastMonth: PeriodSales; thisYear: PeriodSales };
  pendingDispatch: number;
  totalRevenue: number;
  totalUnits: number;
  avgOrderValue: number;
};

type GlobalStats = { totalVendors: number; totalProducts: number; totalOrders: number; totalSales: number };

type MasterData = {
  global: GlobalStats;
  totalpars: VendorMetric;
  vendors: VendorMetric[];
};

const estadoColors: Record<string, string> = {
  ACTIVO: "bg-[#effaf2] text-[#1f6b39]",
  APROBADA: "bg-[#effaf2] text-[#1f6b39]",
  PENDIENTE: "bg-[#fff6ee] text-[#b85d12]",
  EN_REVISION: "bg-[#f0f0ff] text-[#4338ca]",
  RECHAZADA: "bg-[#fff1f1] text-[#c53b3b]",
};
const estadoLabel: Record<string, string> = {
  ACTIVO: "Activo",
  APROBADA: "Aprobado",
  PENDIENTE: "Pendiente",
  EN_REVISION: "En revisión",
  RECHAZADA: "Rechazado",
};

function InfoRow({ label, value }: { label: string; value?: string | null | boolean | string[] }) {
  if (value === null || value === undefined || value === "") return null;
  const display =
    typeof value === "boolean"
      ? value ? "Sí" : "No"
      : Array.isArray(value)
        ? value.join(", ")
        : String(value);
  return (
    <div className="flex gap-2">
      <span className="w-44 shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a2a5aa]">{label}</span>
      <span className="text-sm text-[#1f2328]">{display}</span>
    </div>
  );
}

function generatePassword() {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function ManageAccountModal({
  vendor,
  onClose,
  onCreated,
}: {
  vendor: VendorMetric;
  onClose: () => void;
  onCreated: (email: string) => void;
}) {
  const hasUser = !!vendor.user;
  const [fullName, setFullName] = useState(vendor.user?.fullName ?? vendor.contactName ?? "");
  const [email, setEmail] = useState(vendor.user?.email ?? vendor.contactEmail ?? "");
  const [password, setPassword] = useState(() => generatePassword());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    let res: Response;
    if (hasUser) {
      res = await fetch("/api/master/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: vendor.user!.email, newPassword: password }),
      });
    } else {
      res = await fetch("/api/master/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solicitudId: vendor.id, fullName, email, password, company: vendor.nombre }),
      });
    }

    const data = await res.json() as { ok?: boolean; error?: string };
    setSaving(false);
    if (!res.ok || !data.ok) { setError(data.error ?? "Error al procesar."); return; }
    setDone(true);
    onCreated(email);
  };

  const copyCredentials = () => {
    void navigator.clipboard.writeText(`Usuario: ${email}\nContraseña: ${password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="h-1.5 w-full bg-[#16384f]" />
        <div className="p-6">
          <button onClick={onClose} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">✕</button>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b8d91]">Panel maestro</p>
          <h3 className="mt-1 text-lg font-bold text-[#16384f]">
            {hasUser ? "Cambiar contraseña" : "Generar cuenta de acceso"}
          </h3>
          <p className="mt-1 text-sm text-[#8b8d91]">{vendor.nombre}</p>

          {hasUser && (
            <div className="mt-3 space-y-2">
              <div className="rounded-xl bg-[#f5f5f4] px-3 py-2.5 text-xs text-[#555]">
                Usuario actual: <span className="font-semibold text-[#16384f]">{vendor.user!.email}</span>
              </div>
              <div className="rounded-xl border border-[#ed8435]/30 bg-[#fff8f2] px-3 py-2.5 text-xs text-[#7a4010]">
                La contraseña actual no puede mostrarse — está cifrada. Usa el campo de abajo para establecer una nueva y compartirla con el proveedor.
              </div>
            </div>
          )}

          {done ? (
            <div className="mt-5">
              <div className="rounded-xl bg-[#effaf2] p-4">
                <p className="text-sm font-semibold text-[#1f6b39]">
                  {hasUser ? "Contraseña actualizada" : "Cuenta creada exitosamente"}
                </p>
                <p className="mt-3 text-xs text-[#555]">Comparte estas credenciales con el proveedor:</p>
                <div className="mt-3 space-y-2 rounded-lg bg-white p-3 font-mono text-sm">
                  <p><span className="text-[#a2a5aa]">Usuario:</span> {email}</p>
                  <p><span className="text-[#a2a5aa]">Contraseña:</span> {password}</p>
                </div>
                <button type="button" onClick={copyCredentials} className="mt-3 w-full rounded-xl bg-[#16384f] py-2.5 text-xs font-bold text-white hover:bg-[#0f2a3b]">
                  {copied ? "Copiado ✓" : "Copiar credenciales"}
                </button>
              </div>
              <button onClick={onClose} className="mt-3 w-full rounded-xl border border-black/10 py-2.5 text-xs font-semibold text-[#16384f] hover:bg-[#f5f5f4]">
                Cerrar
              </button>
            </div>
          ) : (
            <form onSubmit={(e) => void handleSubmit(e)} className="mt-5 space-y-4">
              {!hasUser && (
                <>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold text-[#6e7379]">Nombre completo</span>
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full rounded-xl border border-black/10 bg-[#fafaf9] px-3 py-2.5 text-sm outline-none focus:border-[#16384f]" />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold text-[#6e7379]">Correo electrónico</span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-xl border border-black/10 bg-[#fafaf9] px-3 py-2.5 text-sm outline-none focus:border-[#16384f]" />
                  </label>
                </>
              )}
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-[#6e7379]">
                  {hasUser ? "Nueva contraseña" : "Contraseña temporal"}
                </span>
                <div className="flex gap-2">
                  <input value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="w-full rounded-xl border border-black/10 bg-[#fafaf9] px-3 py-2.5 font-mono text-sm outline-none focus:border-[#16384f]" />
                  <button type="button" onClick={() => setPassword(generatePassword())} className="shrink-0 rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold text-[#16384f] hover:bg-[#f0f0ee]" title="Generar">↻</button>
                </div>
              </label>
              {error && <p className="rounded-xl bg-[#fff1f1] px-3 py-2 text-xs font-medium text-[#c53b3b]">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-black/10 py-2.5 text-xs font-semibold text-[#16384f] hover:bg-[#f5f5f4]">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-[#16384f] py-2.5 text-xs font-bold text-white hover:bg-[#0f2a3b] disabled:opacity-50">
                  {saving ? "Procesando..." : hasUser ? "Cambiar contraseña" : "Crear cuenta"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function DocSlot({ label, url }: { label: string; url?: string | null }) {
  return (
    <div className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${url ? "border-[#1f8b45]/20 bg-[#effaf2]" : "border-dashed border-black/12 bg-[#fafaf9]"}`}>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${url ? "bg-[#1f8b45]" : "bg-[#c5c7cb]"}`} />
        <span className="text-xs font-medium text-[#1f2328]">{label}</span>
      </div>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="rounded-full bg-[#1f8b45] px-3 py-1 text-[10px] font-semibold text-white hover:bg-[#186a36]">
          Abrir
        </a>
      ) : (
        <span className="text-[10px] text-[#a2a5aa]">No subido</span>
      )}
    </div>
  );
}

function AdminNotesBox({ vendorId, initial }: { vendorId: string; initial?: string | null }) {
  const [text, setText] = useState(initial ?? "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSaving(true);
    await fetch(`/api/master/${vendorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNotes: text }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="border-t border-black/6 px-6 pb-6 pt-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#16384f]">
          <svg viewBox="0 0 14 14" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 10V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4l-2 2Z"/>
          </svg>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#16384f]">Nota interna al proveedor</p>
        {saved && <span className="rounded-full bg-[#effaf2] px-2 py-0.5 text-[9px] font-black text-[#1f8b45]">Guardado ✓</span>}
      </div>
      <div className="overflow-hidden rounded-2xl border border-[#16384f]/15 bg-white shadow-[0_2px_8px_rgba(22,56,79,0.06)]">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ej: Ya casi tienes todo, solo falta subir la cámara de comercio actualizada y el RUT con fecha reciente. Escríbenos si tienes dudas."
          rows={3}
          className="w-full resize-none bg-transparent px-4 py-3 text-sm leading-6 text-[#1f2328] outline-none placeholder:text-[#c5c7cb]"
        />
        <div className="flex items-center justify-between border-t border-[#f0f0ee] px-4 py-2.5">
          <p className="text-[10px] text-[#c5c7cb]">Solo visible para el equipo Totalpars</p>
          <button
            type="button"
            disabled={saving || !text.trim()}
            onClick={() => void handleSend()}
            className="rounded-full bg-[#16384f] px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {saving ? "Guardando..." : "Guardar nota"}
          </button>
        </div>
      </div>
    </div>
  );
}

function VendorStatusSelect({ vendorId, initial }: { vendorId: string; initial: string }) {
  const [estado, setEstado] = useState(initial);
  const [saving, setSaving] = useState(false);

  const options = [
    { value: "PENDIENTE",   label: "Pendiente" },
    { value: "EN_REVISION", label: "En revisión" },
    { value: "APROBADA",    label: "Aprobado" },
    { value: "RECHAZADA",   label: "Rechazado" },
  ];

  const colors: Record<string, string> = {
    APROBADA:    "bg-[#effaf2] text-[#1f6b39] border-[#1f8b45]/20",
    PENDIENTE:   "bg-[#fff6ee] text-[#b85d12] border-[#ed8435]/20",
    EN_REVISION: "bg-[#f0f0ff] text-[#4338ca] border-[#4338ca]/20",
    RECHAZADA:   "bg-[#fff1f1] text-[#c53b3b] border-[#c53b3b]/20",
  };

  const handleChange = async (next: string) => {
    setSaving(true);
    setEstado(next);
    await fetch(`/api/master/${vendorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: next }),
    });
    setSaving(false);
  };

  return (
    <div className="relative">
      <select
        value={estado}
        disabled={saving}
        onChange={(e) => void handleChange(e.target.value)}
        className={`cursor-pointer appearance-none rounded-full border py-1 pl-3 pr-7 text-xs font-semibold outline-none transition-opacity ${colors[estado] ?? "bg-[#f5f5f4] text-[#6e7379] border-black/10"} ${saving ? "opacity-50" : ""}`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 opacity-50" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 1l4 4 4-4"/>
      </svg>
    </div>
  );
}

function StarRating({ vendorId, initial }: { vendorId: string; initial: number | null | undefined }) {
  const [rating, setRating] = useState(initial ?? 0);
  const [hover, setHover] = useState(0);
  const [saving, setSaving] = useState(false);

  const save = async (stars: number) => {
    setSaving(true);
    setRating(stars);
    await fetch(`/api/master/${vendorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calificacion: stars }),
    });
    setSaving(false);
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={saving}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => void save(s)}
          className="text-xl leading-none transition-transform duration-100 hover:scale-110 disabled:cursor-wait"
          aria-label={`${s} estrellas`}
        >
          <span className={(hover || rating) >= s ? "text-[#ed8435]" : "text-[#d1d5db]"}>★</span>
        </button>
      ))}
      {rating > 0 && (
        <span className="ml-1 text-xs font-semibold text-[#8b8d91]">{rating}/5</span>
      )}
    </div>
  );
}

type DetailTab = "productos" | "ventas" | "informacion";

function VendorDetailPanel({ vendorId, isTotalpars }: { vendorId: string; isTotalpars: boolean }) {
  const [detail, setDetail] = useState<VendorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<DetailTab>("ventas");

  useEffect(() => {
    void (async () => {
      try {
        const r = await fetch(`/api/master/${vendorId}`);
        const data = await r.json() as VendorDetail & { error?: string };
        if (!r.ok) { setError(data.error ?? `Error ${r.status}`); setLoading(false); return; }
        setDetail(data);
        setLoading(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error de red");
        setLoading(false);
      }
    })();
  }, [vendorId]);

  if (loading) return <div className="px-6 pb-6 pt-2 text-sm text-[#8b8d91]">Cargando detalle...</div>;
  if (error || !detail) return <div className="px-6 pb-6 pt-2 text-sm text-[#c53b3b]">{error}</div>;

  const s = detail.solicitud as Record<string, unknown> | null;

  const allTabs: { id: DetailTab; label: string }[] = [
    { id: "ventas", label: "Ventas" },
    { id: "productos", label: "Métricas de productos" },
    ...(isTotalpars ? [] : [{ id: "informacion" as DetailTab, label: "Información" }]),
  ];

  return (
    <div className="border-t border-black/6 bg-[#fafafa]">
      {/* Sub-nav tabs */}
      <div className="flex gap-1 border-b border-black/6 px-6 pt-4">
        {allTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-t-xl px-5 py-2.5 text-xs font-semibold transition-colors duration-150 ${
              tab === t.id
                ? "bg-white text-[#16384f] shadow-[0_-1px_0_0_inset_#16384f]"
                : "text-[#8b8d91] hover:bg-white/60 hover:text-[#16384f]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-6 pb-8 pt-6">

        {/* ══ VENTAS ══════════════════════════════════════════ */}
        {tab === "ventas" && (() => {
          const maxRev = Math.max(...detail.yearCalendar.map((x) => x.revenue), 1);
          const activeMonths = detail.yearCalendar.filter((m) => m.revenue > 0).length;
          const deltaLastMonth = detail.periodSales.lastMonth.revenue > 0
            ? Math.round(((detail.periodSales.thisMonth.revenue - detail.periodSales.lastMonth.revenue) / detail.periodSales.lastMonth.revenue) * 100)
            : null;

          return (
            <div className="space-y-3">

              {/* ── Fila 1: Hero mes actual ── */}
              <div className="flex items-center justify-between rounded-2xl bg-[#16384f] px-5 py-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-[9px] font-medium uppercase tracking-[0.22em] text-white/35">{new Date().toLocaleString("es-CO",{month:"long",year:"numeric"})}</span>
                  <span className="text-xl font-medium text-white">{fmt(detail.periodSales.thisMonth.revenue)}</span>
                  <span className="text-[10px] text-white/35">{detail.periodSales.thisMonth.units} uds</span>
                </div>
                {deltaLastMonth !== null && (
                  <div className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-black ${deltaLastMonth >= 0 ? "bg-[#27a34f]/40 text-[#a7f3c0]" : "bg-[#e53e3e]/40 text-[#fecaca]"}`}>
                    <span>{deltaLastMonth >= 0 ? "↑" : "↓"}{Math.abs(deltaLastMonth)}%</span>
                    <span className="text-[9px] font-medium opacity-75">vs mes ant.</span>
                  </div>
                )}
              </div>

              {/* ── Fila 2: 3 tarjetas secundarias ── */}
              <div className="grid grid-cols-3 gap-3">
                {/* Mes anterior */}
                <div className="rounded-[1.2rem] border border-black/[0.07] bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.05)]">
                  <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#c5c7cb]">Mes anterior</p>
                  <p className="mt-2 text-xl font-medium tracking-normal text-[#1f2328]">{fmt(detail.periodSales.lastMonth.revenue)}</p>
                  <p className="mt-0.5 text-[10px] text-[#b0b3b8]">{detail.periodSales.lastMonth.units} uds</p>
                </div>
                {/* Este año */}
                <div className="rounded-[1.2rem] bg-[#f7f8fa] p-4">
                  <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#c5c7cb]">Este año</p>
                  <p className="mt-2 text-xl font-medium tracking-normal text-[#16384f]">{fmt(detail.periodSales.thisYear.revenue)}</p>
                  <p className="mt-0.5 text-[10px] text-[#a2a5aa]">{detail.periodSales.thisYear.units} uds</p>
                </div>
                {/* Histórico */}
                <div className="rounded-[1.2rem] border border-[#ed8435]/15 bg-[#fffaf6] p-4">
                  <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#c5c7cb]">Histórico total</p>
                  <p className="mt-2 text-xl font-medium tracking-normal text-[#16384f]">{fmt(detail.totalRevenue)}</p>
                  <p className="mt-0.5 text-[10px] text-[#a2a5aa]">{detail.totalUnits} uds</p>
                </div>
              </div>

              {/* ── Fila 3: Stats compactos ── */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-3 rounded-[1.2rem] border border-black/[0.06] bg-white px-4 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f0f4f7]">
                    <svg viewBox="0 0 14 14" className="h-3.5 w-3.5 text-[#16384f]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 7h12M7 1v12"/></svg>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#c5c7cb]">Ticket prom.</p>
                    <p className="mt-0.5 text-sm font-medium text-[#1f2328]">{fmt(detail.avgOrderValue)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-[1.2rem] border border-black/[0.06] bg-white px-4 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f0f4f7]">
                    <svg viewBox="0 0 14 14" className="h-3.5 w-3.5 text-[#16384f]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="1" width="12" height="12" rx="2"/><path d="M4 7h6M4 4.5h6M4 9.5h3"/></svg>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#c5c7cb]">Productos</p>
                    <p className="mt-0.5 text-sm font-medium text-[#1f2328]">{detail.products}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 rounded-[1.2rem] px-4 py-3 ${detail.pendingDispatch > 0 ? "border border-[#ed8435]/20 bg-[#fffaf5]" : "border border-[#1f8b45]/15 bg-[#f4fbf6]"}`}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${detail.pendingDispatch > 0 ? "bg-[#ed8435]/10" : "bg-[#1f8b45]/10"}`}>
                    {detail.pendingDispatch > 0
                      ? <svg viewBox="0 0 14 14" className="h-3.5 w-3.5 text-[#b85d12]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="7" r="6"/><path d="M7 4v3.5M7 9.5v.5"/></svg>
                      : <svg viewBox="0 0 14 14" className="h-3.5 w-3.5 text-[#1f8b45]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7l3.5 3.5L12 4"/></svg>
                    }
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#c5c7cb]">Por despachar</p>
                    <p className={`mt-0.5 text-sm font-medium ${detail.pendingDispatch > 0 ? "text-[#b85d12]" : "text-[#1f8b45]"}`}>
                      {detail.pendingDispatch > 0 ? `${detail.pendingDispatch} pedido${detail.pendingDispatch > 1 ? "s" : ""}` : "Al día ✓"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Fila 4: Gráfica mensual ── */}
              <div className="overflow-hidden rounded-[1.4rem] border border-black/[0.06] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.05)]">
                <div className="flex items-center justify-between border-b border-[#f2f2f0] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f0f4f7]">
                      <svg viewBox="0 0 14 14" className="h-3.5 w-3.5 text-[#16384f]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 13V8M4 13V5M7 13V2M10 13V7M13 13V10"/></svg>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#6e7379]">Rendimiento mensual {new Date().getFullYear()}</p>
                      <p className="text-[10px] text-[#c5c7cb]">{activeMonths} {activeMonths === 1 ? "mes con ventas" : "meses con ventas"}</p>
                    </div>
                  </div>
                  {detail.totalRevenue > 0 && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-[#16384f]">{fmt(detail.totalRevenue)}</p>
                      <p className="text-[10px] text-[#c5c7cb]">{detail.totalUnits} uds acumuladas</p>
                    </div>
                  )}
                </div>
                <div className="px-6 py-5">
                  {activeMonths === 0 ? (
                    <p className="py-8 text-center text-sm text-[#d5d7db]">Sin ventas registradas este año</p>
                  ) : (
                    <div className="space-y-2">
                      {detail.yearCalendar.filter((m) => m.monthIndex <= new Date().getMonth()).map((m) => {
                        const isNow  = m.monthIndex === new Date().getMonth();
                        const isTop  = m.revenue > 0 && m.revenue === maxRev;
                        const pct    = m.revenue > 0 ? Math.max(5, Math.round((m.revenue / maxRev) * 100)) : 0;
                        const barBg  = isTop
                          ? "bg-gradient-to-r from-[#156832] to-[#27a34f]"
                          : isNow
                            ? "bg-gradient-to-r from-[#b85d12] to-[#ed8435]"
                            : "bg-gradient-to-r from-[#16384f] to-[#1d4f6a]";
                        const badge  = isTop ? (
                          <span className="rounded-full bg-[#effaf2] px-2 py-0.5 text-[8px] font-black uppercase tracking-wide text-[#1f8b45]">peak</span>
                        ) : isNow ? (
                          <span className="rounded-full bg-[#fff3e8] px-2 py-0.5 text-[8px] font-black uppercase tracking-wide text-[#ed8435]">hoy</span>
                        ) : null;
                        return (
                          <div key={m.monthIndex} className="flex items-center gap-2">
                            <span className={`w-9 shrink-0 text-right text-[9px] font-medium uppercase ${isNow ? "text-[#ed8435]" : "text-[#d0d2d6]"}`}>
                              {m.month}
                            </span>
                            {/* Barra */}
                            <div className="h-5 flex-1 overflow-hidden rounded-md bg-[#f0f0ee]">
                              {pct > 0 && (
                                <div className={`h-full ${barBg}`} style={{ width: `${pct}%` }} />
                              )}
                            </div>
                            {/* Precio — siempre fuera de la barra */}
                            <span className={`w-24 shrink-0 text-right text-[10px] font-medium tabular-nums ${
                              m.revenue > 0
                                ? isTop ? "text-[#156832]" : isNow ? "text-[#b85d12]" : "text-[#16384f]"
                                : "text-[#d5d7db]"
                            }`}>
                              {m.revenue > 0 ? fmt(m.revenue).replace(/COP\s?/, "$") : "—"}
                            </span>
                            <span className="w-10 shrink-0 text-[9px] text-[#b0b3b8]">
                              {m.revenue > 0 ? `${m.units} uds` : ""}
                            </span>
                            <div className="w-10 shrink-0 text-right">{badge}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ══ MÉTRICAS DE PRODUCTOS ═══════════════════════════ */}
        {tab === "productos" && (
          <div className="rounded-2xl border border-black/7 bg-white p-5 shadow-[0_3px_10px_rgba(15,23,42,0.04)]">
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8b8d91]">
              Productos con mayor rotación
            </p>
            {detail.topProducts.length === 0 ? (
              <p className="py-10 text-center text-sm text-[#c5c7cb]">Sin ventas registradas</p>
            ) : (
              <div className="space-y-3">
                {detail.topProducts.map((p, i) => {
                  const maxRev = detail.topProducts[0]?.revenue ?? 1;
                  return (
                    <div key={p.id} className="flex items-center gap-3">
                      <span className="w-5 shrink-0 text-right text-[10px] font-bold text-[#c5c7cb]">#{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <a href={`/producto/${p.slug}`} target="_blank" rel="noreferrer" className="group flex min-w-0 items-center gap-1.5 truncate">
                            <span className="truncate text-sm font-medium text-[#1f2328] group-hover:text-[#16384f] group-hover:underline">{p.name}</span>
                            <svg viewBox="0 0 10 10" className="h-3 w-3 shrink-0 text-[#c5c7cb] group-hover:text-[#16384f]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 9L9 1M9 1H4M9 1v5"/></svg>
                          </a>
                          <span className="shrink-0 text-sm font-semibold text-[#1f8b45]">{fmt(p.revenue)}</span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f0f0ee]">
                            <div
                              className="h-full rounded-full bg-[#ed8435]"
                              style={{ width: `${(p.revenue / maxRev) * 100}%` }}
                            />
                          </div>
                          <span className="shrink-0 text-[10px] text-[#a2a5aa]">{p.units} uds · {p.category}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ INFORMACIÓN ═════════════════════════════════════ */}
        {tab === "informacion" && !isTotalpars && s && (
          <div className="grid gap-5 lg:grid-cols-3">
            {/* Datos empresa */}
            <div className="rounded-2xl border border-black/7 bg-white p-5 shadow-[0_3px_10px_rgba(15,23,42,0.04)]">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8b8d91]">Datos de empresa</p>
              <div className="space-y-2.5">
                <InfoRow label="Razón social" value={s.razonSocial as string} />
                <InfoRow label="NIT" value={s.nit as string} />
                <InfoRow label="Correo" value={s.correoEmpresa as string} />
                <InfoRow label="Teléfono" value={s.telefonoEmpresa as string} />
                <InfoRow label="Ciudad" value={s.ciudad as string} />
                <InfoRow label="Dirección" value={s.direccion as string} />
                <InfoRow label="Web" value={s.paginaWeb as string} />
                <InfoRow label="Tipo" value={s.tipoEmpresa as string} />
                <InfoRow label="Años en mercado" value={s.anosEnMercado as string} />
                <InfoRow label="Vende online" value={s.vendeOnline as boolean} />
                <InfoRow label="Tienda" value={s.linkTienda as string | null} />
                <InfoRow label="Opera en" value={s.operaEn as string | null} />
              </div>
            </div>

            {/* Representante + logística */}
            <div className="space-y-5">
              <div className="rounded-2xl border border-black/7 bg-white p-5 shadow-[0_3px_10px_rgba(15,23,42,0.04)]">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8b8d91]">Representante legal</p>
                <div className="space-y-2.5">
                  <InfoRow label="Nombre" value={s.repNombre as string} />
                  <InfoRow label="Cargo" value={s.repCargo as string} />
                  <InfoRow label="Celular" value={s.repCelular as string} />
                  <InfoRow label="Correo" value={s.repCorreo as string} />
                </div>
              </div>
              <div className="rounded-2xl border border-black/7 bg-white p-5 shadow-[0_3px_10px_rgba(15,23,42,0.04)]">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8b8d91]">Logística</p>
                <div className="space-y-2.5">
                  <InfoRow label="Cant. productos" value={s.cantidadProductos as string} />
                  <InfoRow label="Inventario propio" value={s.inventarioPropio as boolean} />
                  <InfoRow label="Precios mayoristas" value={s.preciosMayoristas as boolean} />
                  <InfoRow label="Garantía" value={s.ofreceGarantia as boolean} />
                  <InfoRow label="Despacho" value={s.tiempoDespacho as string} />
                  <InfoRow label="Cobertura" value={s.coberturaEnvios as string} />
                </div>
              </div>
            </div>

            {/* Documentos */}
            <div className="rounded-2xl border border-black/7 bg-white p-5 shadow-[0_3px_10px_rgba(15,23,42,0.04)]">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8b8d91]">Documentos</p>
              <div className="space-y-2">
                <DocSlot label="RUT" url={s.urlRut as string | null} />
                <DocSlot label="Cámara de Comercio" url={s.urlCamaraComercio as string | null} />
                <DocSlot label="Doc. Rep. Legal" url={s.urlDocRepLegal as string | null} />
                <DocSlot label="Cert. Bancaria" url={s.urlCertBancaria as string | null} />
                <DocSlot label="Logo empresa" url={s.urlLogo as string | null} />
                <DocSlot label="Catálogo" url={s.urlCatalogo as string | null} />
              </div>
              {typeof s.descripcion === "string" && s.descripcion && (
                <div className="mt-4 rounded-xl bg-[#f5f5f4] p-3">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a2a5aa]">Descripción</p>
                  <p className="text-xs leading-6 text-[#5d6167]">{s.descripcion}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Nota interna — visible en todas las pestañas, solo para vendors externos */}
      {!isTotalpars && s && (
        <AdminNotesBox vendorId={vendorId} initial={s.adminNotes as string | null} />
      )}
    </div>
  );
}

type TallerSolicitud = {
  id: string;
  nombreTaller: string;
  tipoTaller: string;
  servicios: string[];
  descripcion?: string;
  ciudad: string;
  departamento?: string;
  direccion: string;
  nombreContacto: string;
  telefono: string;
  whatsapp?: string;
  correo?: string;
  horario?: string;
  urlFoto?: string;
  estado: string;
  adminNotes?: string;
  createdAt: string;
};

type ArriendoSolicitud = {
  id: string;
  nombreEmpresa: string;
  tiposVehiculo: string[];
  cantidad?: string;
  descripcion?: string;
  ciudad: string;
  departamento?: string;
  cobertura?: string;
  nombreContacto: string;
  telefono: string;
  whatsapp?: string;
  correo?: string;
  disponibilidad?: string;
  estado: string;
  adminNotes?: string;
  createdAt: string;
};

type MaquinariaSolicitud = {
  id: string;
  nombreEmpresa: string;
  tiposMaquinaria: string[];
  cantidad?: string;
  descripcion?: string;
  ciudad: string;
  departamento?: string;
  cobertura?: string;
  nombreContacto: string;
  telefono: string;
  whatsapp?: string;
  correo?: string;
  disponibilidad?: string;
  estado: string;
  adminNotes?: string;
  createdAt: string;
};

function SolicitudFlotaList<T extends ArriendoSolicitud | MaquinariaSolicitud>({
  items,
  setItems,
  apiPath,
  accentColor,
  tiposKey,
}: {
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  apiPath: string;
  accentColor: string;
  tiposKey: "tiposVehiculo" | "tiposMaquinaria";
}) {
  const [detalle, setDetalle] = useState<T | null>(null);

  async function cambiarEstado(id: string, estado: string) {
    await fetch(apiPath, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, estado }) });
    setItems((prev) => prev.map((x) => x.id === id ? { ...x, estado } : x));
    if (detalle?.id === id) setDetalle((d) => d ? { ...d, estado } : null);
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/10 bg-white p-10 text-center">
        <p className="text-sm text-[#8b8d91]">No hay solicitudes aún.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Modal detalle */}
      {detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setDetalle(null)}>
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="h-1.5 w-full" style={{ backgroundColor: accentColor }} />
            <div className="p-6">
              <button onClick={() => setDetalle(null)} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">✕</button>

              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-black text-white shadow-lg" style={{ backgroundColor: accentColor }}>
                  {detalle.nombreEmpresa.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#16384f]">{detalle.nombreEmpresa}</h3>
                  <p className="text-sm text-[#8b8d91]">{detalle.ciudad}{detalle.departamento ? `, ${detalle.departamento}` : ""}</p>
                  <span className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${estadoColors[detalle.estado] ?? "bg-gray-100 text-gray-500"}`}>
                    {estadoLabel[detalle.estado] ?? detalle.estado}
                  </span>
                </div>
              </div>

              {detalle.descripcion && <p className="mt-4 text-sm leading-6 text-gray-500">{detalle.descripcion}</p>}

              <div className="mt-5 space-y-2.5">
                {([
                  { label: "Contacto", value: detalle.nombreContacto },
                  { label: "Teléfono", value: detalle.telefono },
                  { label: "WhatsApp", value: detalle.whatsapp },
                  { label: "Correo", value: detalle.correo },
                  { label: "Cantidad", value: detalle.cantidad ? `${detalle.cantidad} unidades` : null },
                  { label: "Disponibilidad", value: detalle.disponibilidad },
                  { label: "Cobertura", value: detalle.cobertura },
                  { label: "Registrado", value: new Date(detalle.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" }) },
                ] as { label: string; value?: string | null }[]).filter((r) => r.value).map(({ label, value }) => (
                  <div key={label} className="flex items-start gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
                    <span className="w-28 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</span>
                    <span className="text-sm text-gray-700">{value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Tipos</p>
                <div className="flex flex-wrap gap-1.5">
                  {((detalle as Record<string, unknown>)[tiposKey] as string[]).map((s) => (
                    <span key={s} className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-[#16384f]">{s}</span>
                  ))}
                </div>
              </div>

              {detalle.estado === "PENDIENTE" && (
                <div className="mt-5 flex gap-2">
                  <button onClick={() => cambiarEstado(detalle.id, "APROBADA")} className="flex-1 rounded-xl bg-[#1f8b45] py-2.5 text-xs font-bold text-white hover:bg-[#186a36]">✓ Aprobar</button>
                  <button onClick={() => cambiarEstado(detalle.id, "EN_REVISION")} className="flex-1 rounded-xl border border-black/10 py-2.5 text-xs font-bold text-[#4338ca] hover:bg-[#f0f0ff]">En revisión</button>
                  <button onClick={() => cambiarEstado(detalle.id, "RECHAZADA")} className="flex-1 rounded-xl border border-red-200 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50">✕ Rechazar</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {items.map((t) => (
        <div key={t.id} className="overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-black text-white" style={{ backgroundColor: accentColor }}>
                  {t.nombreEmpresa.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[#1f2328]">{t.nombreEmpresa}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${estadoColors[t.estado] ?? "bg-gray-100 text-gray-500"}`}>
                      {estadoLabel[t.estado] ?? t.estado}
                    </span>
                  </div>
                  <p className="text-xs text-[#8b8d91]">{t.ciudad}{t.departamento ? `, ${t.departamento}` : ""}</p>
                  {t.descripcion && <p className="mt-1 text-xs text-[#8b8d91] line-clamp-2">{t.descripcion}</p>}
                </div>
              </div>
              <p className="text-xs text-[#a2a5aa]">{new Date(t.createdAt).toLocaleDateString("es-CO")}</p>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {((t as Record<string, unknown>)[tiposKey] as string[]).map((s) => (
                <span key={s} className="rounded-full border border-black/8 bg-[#fafaf9] px-2.5 py-0.5 text-xs text-[#5d6167]">{s}</span>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#5d6167]">
              <span>👤 {t.nombreContacto}</span>
              <span>📞 {t.telefono}</span>
              {t.whatsapp && <span>💬 {t.whatsapp}</span>}
              {t.correo && <span>✉ {t.correo}</span>}
              {t.cantidad && <span>🔢 {t.cantidad} unidades</span>}
              {t.disponibilidad && <span>📅 {t.disponibilidad}</span>}
              {t.cobertura && <span>📍 {t.cobertura}</span>}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => setDetalle(t)}
                className="rounded-xl border border-[#16384f]/20 px-5 py-2 text-xs font-bold text-[#16384f] transition-colors hover:bg-[#16384f] hover:text-white"
              >
                Ver detalle
              </button>
              <button onClick={() => cambiarEstado(t.id, "APROBADA")} className="rounded-xl bg-[#1f8b45] px-5 py-2 text-xs font-bold text-white hover:bg-[#186a36]">✓ Aprobar</button>
              <button onClick={() => cambiarEstado(t.id, "EN_REVISION")} className="rounded-xl border border-black/10 px-5 py-2 text-xs font-bold text-[#4338ca] hover:bg-[#f0f0ff]">En revisión</button>
              <button onClick={() => cambiarEstado(t.id, "RECHAZADA")} className="rounded-xl border border-red-200 px-5 py-2 text-xs font-bold text-red-600 hover:bg-red-50">✕ Rechazar</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function UniparcerosList({ talleres, setTalleres }: { talleres: TallerSolicitud[]; setTalleres: React.Dispatch<React.SetStateAction<TallerSolicitud[]>> }) {
  const [detalle, setDetalle] = useState<TallerSolicitud | null>(null);

  async function cambiarEstado(id: string, estado: string) {
    await fetch("/api/aliado", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, estado }) });
    setTalleres((prev) => prev.map((x) => x.id === id ? { ...x, estado } : x));
    if (detalle?.id === id) setDetalle((d) => d ? { ...d, estado } : null);
  }

  return (
    <div className="space-y-3">
      {/* Modal detalle */}
      {detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setDetalle(null)}>
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="h-1.5 w-full bg-[#ed8435]" />
            <div className="p-6">
              <button onClick={() => setDetalle(null)} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">✕</button>

              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#ed8435] text-lg font-black text-white shadow-lg">
                  {detalle.nombreTaller.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#16384f]">{detalle.nombreTaller}</h3>
                  <p className="text-sm text-[#8b8d91]">{detalle.tipoTaller}</p>
                  <span className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${estadoColors[detalle.estado] ?? "bg-gray-100 text-gray-500"}`}>
                    {estadoLabel[detalle.estado] ?? detalle.estado}
                  </span>
                </div>
              </div>

              {detalle.descripcion && <p className="mt-4 text-sm leading-6 text-gray-500">{detalle.descripcion}</p>}

              <div className="mt-5 space-y-2.5">
                {([
                  { label: "Dirección", value: `${detalle.direccion}, ${detalle.ciudad}${detalle.departamento ? `, ${detalle.departamento}` : ""}` },
                  { label: "Contacto", value: detalle.nombreContacto },
                  { label: "Teléfono", value: detalle.telefono },
                  { label: "WhatsApp", value: detalle.whatsapp },
                  { label: "Correo", value: detalle.correo },
                  { label: "Horario", value: detalle.horario },
                  { label: "Registrado", value: new Date(detalle.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" }) },
                ] as { label: string; value?: string | null }[]).filter((r) => r.value).map(({ label, value }) => (
                  <div key={label} className="flex items-start gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
                    <span className="w-24 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</span>
                    <span className="text-sm text-gray-700">{value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Servicios</p>
                <div className="flex flex-wrap gap-1.5">
                  {detalle.servicios.map((s) => (
                    <span key={s} className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-[#16384f]">{s}</span>
                  ))}
                </div>
              </div>

              {detalle.urlFoto && (
                <div className="mt-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Foto del taller</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={detalle.urlFoto} alt="Foto taller" className="w-full max-h-48 rounded-xl object-cover" />
                </div>
              )}

              {detalle.estado === "PENDIENTE" && (
                <div className="mt-5 flex gap-2">
                  <button onClick={() => cambiarEstado(detalle.id, "APROBADA")} className="flex-1 rounded-xl bg-[#1f8b45] py-2.5 text-xs font-bold text-white hover:bg-[#186a36]">✓ Aprobar</button>
                  <button onClick={() => cambiarEstado(detalle.id, "EN_REVISION")} className="flex-1 rounded-xl border border-black/10 py-2.5 text-xs font-bold text-[#4338ca] hover:bg-[#f0f0ff]">En revisión</button>
                  <button onClick={() => cambiarEstado(detalle.id, "RECHAZADA")} className="flex-1 rounded-xl border border-red-200 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50">✕ Rechazar</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {talleres.length === 0 && (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white p-10 text-center">
          <p className="text-sm text-[#8b8d91]">No hay solicitudes de talleres aún.</p>
        </div>
      )}

      {talleres.map((t) => (
        <div key={t.id} className="overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#ed8435] text-sm font-black text-white">
                  {t.nombreTaller.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[#1f2328]">{t.nombreTaller}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${estadoColors[t.estado] ?? "bg-gray-100 text-gray-500"}`}>
                      {estadoLabel[t.estado] ?? t.estado}
                    </span>
                  </div>
                  <p className="text-xs text-[#8b8d91]">{t.tipoTaller} · {t.ciudad}{t.departamento ? `, ${t.departamento}` : ""}</p>
                  <p className="mt-0.5 text-xs text-[#8b8d91]">{t.direccion}</p>
                </div>
              </div>
              <p className="text-xs text-[#a2a5aa]">{new Date(t.createdAt).toLocaleDateString("es-CO")}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {t.servicios.map((s) => (
                <span key={s} className="rounded-full border border-black/8 bg-[#fafaf9] px-2.5 py-0.5 text-xs text-[#5d6167]">{s}</span>
              ))}
            </div>

            {t.descripcion && <p className="mt-3 text-sm text-[#5d6167] line-clamp-2">{t.descripcion}</p>}

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#5d6167]">
              <span>👤 {t.nombreContacto}</span>
              <span>📞 {t.telefono}</span>
              {t.whatsapp && <span>💬 {t.whatsapp}</span>}
              {t.correo && <span>✉ {t.correo}</span>}
              {t.horario && <span>🕐 {t.horario}</span>}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => setDetalle(t)}
                className="rounded-xl border border-[#16384f]/20 px-5 py-2 text-xs font-bold text-[#16384f] transition-colors hover:bg-[#16384f] hover:text-white"
              >
                Ver taller
              </button>
              <button onClick={() => cambiarEstado(t.id, "APROBADA")} className="rounded-xl bg-[#1f8b45] px-5 py-2 text-xs font-bold text-white hover:bg-[#186a36]">✓ Aprobar taller</button>
              <button onClick={() => cambiarEstado(t.id, "EN_REVISION")} className="rounded-xl border border-black/10 px-5 py-2 text-xs font-bold text-[#4338ca] hover:bg-[#f0f0ff]">En revisión</button>
              <button onClick={() => cambiarEstado(t.id, "RECHAZADA")} className="rounded-xl border border-red-200 px-5 py-2 text-xs font-bold text-red-600 hover:bg-red-50">✕ Rechazar</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MasterPage() {
  const router = useRouter();
  const [data, setData] = useState<MasterData | null>(null);
  const [createAccountFor, setCreateAccountFor] = useState<VendorMetric | null>(null);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };
  const [talleres, setTalleres] = useState<TallerSolicitud[]>([]);
  const [arriendos, setArriendos] = useState<ArriendoSolicitud[]>([]);
  const [maquinarias, setMaquinarias] = useState<MaquinariaSolicitud[]>([]);
  const [encuesta, setEncuesta] = useState<{ total: number; conteo: Record<string, number> } | null>(null);
  const [subTabUniparceros, setSubTabUniparceros] = useState<"talleres" | "arriendo" | "maquinaria">("talleres");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [view, setView] = useState<"activos" | "solicitudes" | "uniparceros" | "encuesta" | "exclusivos">("activos");
  const [exclusiveSearch, setExclusiveSearch] = useState("");
  const [exclusiveUsers, setExclusiveUsers] = useState<{ id: string; fullName: string; email: string; company: string | null; role: string }[]>([]);
  const [exclusiveLoaded, setExclusiveLoaded] = useState(false);
  const [exclusiveSaving, setExclusiveSaving] = useState<string | null>(null);

  const loadExclusiveUsers = (q?: string) => {
    const url = q ? `/api/admin/users?q=${encodeURIComponent(q)}` : "/api/admin/users";
    fetch(url)
      .then((r) => r.json())
      .then((d: { users?: typeof exclusiveUsers }) => { setExclusiveUsers(d.users ?? []); setExclusiveLoaded(true); })
      .catch(() => setExclusiveLoaded(true));
  };

  const toggleExclusive = async (userId: string, currentRole: string) => {
    setExclusiveSaving(userId);
    const newRole = currentRole === "EXCLUSIVE" ? "CUSTOMER" : "EXCLUSIVE";
    await fetch(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setExclusiveUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    setExclusiveSaving(null);
  };

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/account", { credentials: "include" });
      if (!res.ok) { router.replace("/login?next=/master"); return; }
      const { user } = await res.json() as { user?: { role: string } };
      if (user?.role !== "MASTER") { router.replace("/login?next=/master"); return; }

      const [r, rt, ra, rm, re] = await Promise.all([fetch("/api/master"), fetch("/api/aliado"), fetch("/api/arriendo"), fetch("/api/maquinaria"), fetch("/api/encuesta-referido")]);
      if (!r.ok) { setError("No fue posible cargar las métricas."); setLoading(false); return; }
      setData(await r.json() as MasterData);
      if (rt.ok) setTalleres(await rt.json() as TallerSolicitud[]);
      if (ra.ok) setArriendos(await ra.json() as ArriendoSolicitud[]);
      if (rm.ok) setMaquinarias(await rm.json() as MaquinariaSolicitud[]);
      if (re.ok) setEncuesta(await re.json() as { total: number; conteo: Record<string, number> });
      setLoading(false);
    })();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <p className="text-sm text-[#6e7379]">Cargando panel maestro...</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <p className="text-sm text-[#c53b3b]">{error || "Error inesperado."}</p>
      </main>
    );
  }

  const allVendors: VendorMetric[] = [data.totalpars, ...data.vendors];
  const g = data.global;

  return (
    <main className="min-h-screen bg-[#f4f5f7] text-[#1f2328]">
      {createAccountFor && (
        <ManageAccountModal
          vendor={createAccountFor}
          onClose={() => setCreateAccountFor(null)}
          onCreated={(email) => {
            setData((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                vendors: prev.vendors.map((v) =>
                  v.id === createAccountFor.id
                    ? { ...v, user: { fullName: createAccountFor.contactName ?? email, email } }
                    : v,
                ),
              };
            });
          }}
        />
      )}
      {/* Header */}
      <header className="border-b border-black/8 bg-white px-4 py-4 sm:px-8 sm:py-5">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8b8d91]">Panel maestro</p>
            <h1 className="mt-0.5 text-lg font-semibold tracking-[-0.03em] text-[#16384f] sm:text-xl">
              Visión global de proveedores
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-[#16384f] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white sm:inline-flex">
              Solo lectura
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-red-500 transition-colors hover:bg-red-50"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 sm:px-8 sm:py-10">

        {/* Global stat cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Proveedores totales", value: g.totalVendors, isCurrency: false },
            { label: "Productos en catálogo", value: g.totalProducts, isCurrency: false },
            { label: "Pedidos recibidos", value: g.totalOrders, isCurrency: false },
            { label: "Ventas confirmadas", value: g.totalSales, isCurrency: true },
          ].map((card) => (
            <div key={card.label} className="rounded-[1.5rem] border border-black/8 bg-white px-4 py-4 shadow-[0_6px_18px_rgba(15,23,42,0.04)] sm:px-5 sm:py-5">
              <p className="text-[10px] font-semibold uppercase leading-tight tracking-[0.12em] text-[#8b8d91] sm:tracking-[0.2em]">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#16384f] sm:mt-3 sm:text-3xl">
                {card.isCurrency ? fmt(card.value) : card.value.toLocaleString("es-CO")}
              </p>
            </div>
          ))}
        </div>

        {/* Vendor cards */}
        <div>
          {/* Tabs */}
          <div className="scrollbar-hidden mb-5 flex items-center gap-1 overflow-x-auto pb-1">
            {([
              { id: "activos", label: "Proveedores activos", count: allVendors.filter((v) => v.isTotalpars || v.estado === "APROBADA" || v.estado === "ACTIVO").length },
              { id: "solicitudes", label: "Solicitudes", count: data.vendors.filter((v) => v.estado === "PENDIENTE" || v.estado === "EN_REVISION").length },
              { id: "uniparceros", label: "Uniparceros", count: talleres.length + arriendos.length + maquinarias.length },
              { id: "encuesta", label: "¿Cómo nos conocieron?", count: encuesta?.total ?? 0 },
              { id: "exclusivos", label: "Clientes exclusivos", count: null },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setView(tab.id);
                  setExpandedId(null);
                  if (tab.id === "exclusivos" && !exclusiveLoaded) loadExclusiveUsers();
                }}
                className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  view === tab.id
                    ? tab.id === "uniparceros" ? "bg-[#ed8435] text-white" : "bg-[#16384f] text-white"
                    : "bg-white text-[#8b8d91] border border-black/10 hover:text-[#16384f]"
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
                    view === tab.id ? "bg-white/20 text-white" : "bg-[#f0f0ee] text-[#8b8d91]"
                  }`}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* ── UNIPARCEROS TAB ── */}
          {view === "uniparceros" && (
            <div>
              {/* Sub-tabs */}
              <div className="mb-4 flex gap-2">
                {([
                  { id: "talleres", label: "Talleres y mecánicos", count: talleres.length, color: "#ed8435" },
                  { id: "arriendo", label: "Arriendo de vehículos", count: arriendos.length, color: "#16a34a" },
                  { id: "maquinaria", label: "Maquinaria pesada", count: maquinarias.length, color: "#d97706" },
                ] as const).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSubTabUniparceros(st.id)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors border ${
                      subTabUniparceros === st.id
                        ? "text-white border-transparent"
                        : "bg-white text-[#8b8d91] border-black/10 hover:text-[#16384f]"
                    }`}
                    style={subTabUniparceros === st.id ? { backgroundColor: st.color } : {}}
                  >
                    {st.label}
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${subTabUniparceros === st.id ? "bg-white/20 text-white" : "bg-[#f0f0ee] text-[#8b8d91]"}`}>
                      {st.count}
                    </span>
                  </button>
                ))}
              </div>

              {subTabUniparceros === "talleres" && (
                <UniparcerosList talleres={talleres} setTalleres={setTalleres} />
              )}
              {subTabUniparceros === "arriendo" && (
                <SolicitudFlotaList
                  items={arriendos}
                  setItems={setArriendos}
                  apiPath="/api/arriendo"
                  accentColor="#16a34a"
                  tiposKey="tiposVehiculo"
                />
              )}
              {subTabUniparceros === "maquinaria" && (
                <SolicitudFlotaList
                  items={maquinarias}
                  setItems={setMaquinarias}
                  apiPath="/api/maquinaria"
                  accentColor="#d97706"
                  tiposKey="tiposMaquinaria"
                />
              )}
            </div>
          )}

          {/* ── ENCUESTA TAB ── */}
          {view === "encuesta" && (
            <div className="rounded-[1.5rem] border border-black/8 bg-white px-6 py-6 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
              {encuesta && encuesta.total > 0 ? (
                <>
                  <p className="mb-5 text-sm text-[#6e7379]">{encuesta.total} respuestas totales</p>
                  <div className="space-y-4">
                    {Object.entries(encuesta.conteo)
                      .sort(([, a], [, b]) => b - a)
                      .map(([opcion, count]) => {
                        const pct = Math.round((count / encuesta.total) * 100);
                        return (
                          <div key={opcion}>
                            <div className="mb-1.5 flex items-center justify-between text-sm">
                              <span className="font-semibold text-[#1f2328]">{opcion}</span>
                              <span className="font-semibold text-[#16384f]">{count} <span className="font-normal text-[#8b8d91]">({pct}%)</span></span>
                            </div>
                            <div className="h-2.5 w-full rounded-full bg-[#f0f1f3]">
                              <div className="h-2.5 rounded-full bg-[#ed8435] transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </>
              ) : (
                <p className="py-8 text-center text-sm text-[#8b8d91]">Aún no hay respuestas registradas.</p>
              )}
            </div>
          )}

          {/* ── CLIENTES EXCLUSIVOS TAB ── */}
          {view === "exclusivos" && (
            <div className="space-y-5">

              {/* Clientes exclusivos activos */}
              <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b8d91]">Activos</p>
                    <h2 className="mt-1 text-xl font-bold text-[#16384f]">Clientes exclusivos</h2>
                  </div>
                  <span className="rounded-full bg-[#e8f0fe] px-3 py-1 text-sm font-bold text-[#16384f]">
                    {exclusiveUsers.filter((u) => u.role === "EXCLUSIVE").length}
                  </span>
                </div>

                {!exclusiveLoaded ? (
                  <p className="py-6 text-center text-sm text-[#8b8d91] animate-pulse">Cargando...</p>
                ) : exclusiveUsers.filter((u) => u.role === "EXCLUSIVE").length === 0 ? (
                  <p className="py-6 text-center text-sm text-[#8b8d91]">Aún no hay clientes exclusivos activados.</p>
                ) : (
                  <div className="overflow-hidden rounded-[1.2rem] border border-black/8">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-black/6 bg-[#f8f9fb]">
                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-[#8b8d91]">Usuario</th>
                          <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-[#8b8d91]">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exclusiveUsers.filter((u) => u.role === "EXCLUSIVE").map((u) => (
                          <tr key={u.id} className="border-b border-black/5 last:border-0 hover:bg-[#fafaf9]">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#16384f] text-sm font-bold text-white">
                                  {u.fullName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-[#1f2328]">{u.fullName}</p>
                                  <p className="text-xs text-[#8b8d91]">{u.email}{u.company ? ` · ${u.company}` : ""}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                disabled={exclusiveSaving === u.id}
                                onClick={() => void toggleExclusive(u.id, u.role)}
                                className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50"
                              >
                                {exclusiveSaving === u.id ? "..." : "Quitar acceso"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Activar nuevo cliente exclusivo */}
              <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b8d91]">Activar acceso</p>
                <h2 className="mt-1 text-xl font-bold text-[#16384f] mb-4">Agregar cliente exclusivo</h2>

                <div className="flex gap-2 mb-5">
                  <input
                    type="text"
                    value={exclusiveSearch}
                    onChange={(e) => setExclusiveSearch(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") loadExclusiveUsers(exclusiveSearch); }}
                    placeholder="Buscar por email, nombre o empresa..."
                    className="flex-1 rounded-xl border border-black/12 bg-[#f8f9fb] px-4 py-2.5 text-sm outline-none focus:border-[#16384f]/40"
                  />
                  <button
                    type="button"
                    onClick={() => loadExclusiveUsers(exclusiveSearch || undefined)}
                    className="rounded-xl bg-[#16384f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0f2638] transition-colors"
                  >
                    Buscar
                  </button>
                </div>

                {exclusiveLoaded && exclusiveSearch && exclusiveUsers.filter((u) => u.role !== "EXCLUSIVE").length > 0 && (
                  <div className="overflow-hidden rounded-[1.2rem] border border-black/8">
                    <table className="w-full text-sm">
                      <tbody>
                        {exclusiveUsers.filter((u) => u.role !== "EXCLUSIVE").map((u) => (
                          <tr key={u.id} className="border-b border-black/5 last:border-0 hover:bg-[#fafaf9]">
                            <td className="px-5 py-4">
                              <p className="font-semibold text-[#1f2328]">{u.fullName}</p>
                              <p className="text-xs text-[#8b8d91]">{u.email}{u.company ? ` · ${u.company}` : ""}</p>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                disabled={exclusiveSaving === u.id}
                                onClick={() => void toggleExclusive(u.id, u.role)}
                                className="rounded-full bg-[#16384f] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#0f2638]"
                              >
                                {exclusiveSaving === u.id ? "..." : "Activar exclusivo"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {exclusiveLoaded && exclusiveSearch && exclusiveUsers.filter((u) => u.role !== "EXCLUSIVE").length === 0 && (
                  <p className="text-center text-sm text-[#8b8d91]">No se encontraron clientes regulares con ese criterio.</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {view !== "uniparceros" && view !== "encuesta" && view !== "exclusivos" && allVendors.filter((v) =>
              view === "activos"
                ? v.isTotalpars || v.estado === "APROBADA" || v.estado === "ACTIVO"
                : !v.isTotalpars && (v.estado === "PENDIENTE" || v.estado === "EN_REVISION" || v.estado === "RECHAZADA")
            ).map((v) => {
              const isExpanded = expandedId === v.id;
              return (
                <div
                  key={v.id}
                  className={`overflow-hidden rounded-[2rem] border bg-white shadow-[0_6px_18px_rgba(15,23,42,0.04)] transition-shadow duration-200 ${v.isTotalpars ? "border-[#16384f]/20" : "border-black/8"} ${isExpanded ? "shadow-[0_12px_32px_rgba(15,23,42,0.10)]" : ""}`}
                >
                  <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto]">
                    {/* Left */}
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${v.isTotalpars ? "bg-[#ed8435]" : "bg-[#16384f]"}`}>
                          {v.nombre.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-[#1f2328]">{v.nombre}</p>
                            {v.isTotalpars && (
                              <span className="rounded-full bg-[#ed8435] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                                Oficial
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#8b8d91]">{v.tipo}{v.ciudad ? ` · ${v.ciudad}` : ""}</p>
                        </div>
                        {v.isTotalpars ? (
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${estadoColors[v.estado] ?? "bg-[#f5f5f4] text-[#6e7379]"}`}>
                            {estadoLabel[v.estado] ?? v.estado}
                          </span>
                        ) : (
                          <VendorStatusSelect vendorId={v.id} initial={v.estado} />
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(v.categorias ?? []).slice(0, 8).map((tag) => (
                          <span key={tag} className="rounded-full border border-black/8 bg-[#fafaf9] px-2.5 py-0.5 text-xs text-[#5d6167]">
                            {tag}
                          </span>
                        ))}
                        {(v.categorias ?? []).length > 8 && (
                          <span className="rounded-full border border-[#ed8435]/20 bg-[#fff6ee] px-2.5 py-0.5 text-xs font-semibold text-[#b85d12]">
                            +{(v.categorias ?? []).length - 8} más
                          </span>
                        )}
                      </div>

                      {!v.isTotalpars && (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {v.user ? (
                            <p className="text-xs text-[#8b8d91]">
                              Usuario vinculado: {v.user.fullName} — {v.user.email}
                            </p>
                          ) : (
                            <span className="rounded-full bg-[#fff6ee] px-2.5 py-0.5 text-[10px] font-semibold text-[#b85d12]">Sin cuenta</span>
                          )}
                          <button
                            type="button"
                            onClick={() => setCreateAccountFor(v)}
                            className="rounded-full bg-[#16384f] px-3 py-1 text-[10px] font-bold text-white hover:bg-[#0f2a3b]"
                          >
                            {v.user ? "Cambiar contraseña" : "+ Generar cuenta"}
                          </button>
                        </div>
                      )}

                      {/* Rating */}
                      {!v.isTotalpars && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a2a5aa]">Calificación</span>
                          <StarRating vendorId={v.id} initial={v.calificacion} />
                        </div>
                      )}
                    </div>

                    {/* Right — metrics + toggle */}
                    <div className="flex shrink-0 flex-col items-end gap-4">
                      <div className="flex flex-wrap items-center gap-6">
                        {[
                          { label: "Productos", value: v.productCount.toString() },
                          { label: "Pedidos", value: v.orderCount.toString() },
                          { label: "Pedidos pagados", value: v.paidOrderCount.toString() },
                          { label: "Ventas totales", value: fmt(v.totalSales), highlight: true },
                        ].map((m) => (
                          <div key={m.label} className="text-center">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a2a5aa]">{m.label}</p>
                            <p className={`mt-1 text-xl font-semibold tracking-[-0.04em] ${m.highlight ? "text-[#1f8b45]" : "text-[#1f2328]"}`}>
                              {m.value}
                            </p>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : v.id)}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                          isExpanded
                            ? "bg-[#16384f] text-white"
                            : "border border-[#16384f]/20 text-[#16384f] hover:border-[#16384f] hover:bg-[#16384f] hover:text-white"
                        }`}
                      >
                        {isExpanded ? "Ocultar detalle ▲" : "Ver detalle ▾"}
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {!v.isTotalpars && g.totalSales > 0 && !isExpanded && (
                    <div className="border-t border-black/5 px-6 py-3">
                      <div className="flex items-center gap-3">
                        <p className="w-28 shrink-0 text-xs text-[#8b8d91]">
                          {v.totalSales > 0 ? `${((v.totalSales / g.totalSales) * 100).toFixed(1)}% del total` : "Sin ventas aún"}
                        </p>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f0f0ee]">
                          <div
                            className="h-full rounded-full bg-[#ed8435] transition-all duration-500"
                            style={{ width: `${(v.totalSales / g.totalSales) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Expanded detail */}
                  {isExpanded && <VendorDetailPanel vendorId={v.id} isTotalpars={v.isTotalpars} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

