"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { departamentosColombia, getCitiesForDepartment } from "@/lib/colombia-locations";

type AccountUser = {
  id: string;
  fullName: string;
  company: string | null;
  email: string;
  phone: string | null;
  department: string | null;
  city: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  createdAt: Date;
};

type AccountOrder = {
  id: string;
  status: "PENDING" | "PAID" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  shippingStatus: "PENDING" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  department: string;
  city: string;
  addressLine1: string;
  addressLine2: string | null;
  carrier: string | null;
  trackingNumber: string | null;
  adminNotes: string | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  totalItems: number;
  subtotal: number;
  createdAt: Date;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
};

type ToastState = {
  tone: "success" | "error";
  message: string;
} | null;

type FormState = {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  department: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  newPassword: string;
  confirmPassword: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function getOrderStatusLabel(status: AccountOrder["status"]) {
  if (status === "PAID") return "Pagado";
  if (status === "CANCELLED") return "Cancelado";
  return "Pendiente";
}

function getPaymentStatusLabel(status: AccountOrder["paymentStatus"]) {
  if (status === "PAID") return "Pago confirmado";
  if (status === "FAILED") return "Pago fallido";
  return "Pago pendiente";
}

function getShippingStatusLabel(status: AccountOrder["shippingStatus"]) {
  if (status === "PREPARING") return "En preparación";
  if (status === "SHIPPED") return "Enviado";
  if (status === "DELIVERED") return "Entregado";
  if (status === "CANCELLED") return "Envío cancelado";
  return "Pendiente de despacho";
}

function getOrderProgressStep(order: AccountOrder) {
  if (order.shippingStatus === "DELIVERED") return 3;
  if (order.shippingStatus === "SHIPPED") return 2;
  if (order.shippingStatus === "PREPARING") return 1;
  if (order.paymentStatus === "PAID" || order.status === "PAID") return 0;
  return -1;
}

function OrderProgressTimeline({ order }: { order: AccountOrder }) {
  const activeStep = getOrderProgressStep(order);
  const steps = [
    {
      label: "Pedido confirmado",
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 3h9l3 3v15H6z" />
          <path d="M15 3v3h3" />
          <path d="M9 12h6" />
          <path d="M9 16h4" />
        </svg>
      ),
    },
    {
      label: "En preparación",
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3 4 7l8 4 8-4-8-4Z" />
          <path d="M4 7v10l8 4 8-4V7" />
          <path d="M12 11v10" />
        </svg>
      ),
    },
    {
      label: "Enviado",
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 7h11v8H3z" />
          <path d="M14 10h3l4 3v2h-7z" />
          <circle cx="7.5" cy="17.5" r="1.5" />
          <circle cx="17.5" cy="17.5" r="1.5" />
        </svg>
      ),
    },
    {
      label: "Recibido",
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m5 12 4 4L19 6" />
        </svg>
      ),
    },
  ];

  return (
    <div className="rounded-[1.2rem] border border-black/8 bg-white px-4 py-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
        Seguimiento del pedido
      </p>
      <div className="mt-5 overflow-x-auto">
        <div className="relative min-w-[620px] px-1 py-2">
          <div className="absolute left-[12.5%] right-[12.5%] top-8">
            <span className="block h-[4px] rounded-full bg-black/10" />
            <span
              className="absolute left-0 top-0 h-[4px] rounded-full bg-[#ed8435] transition-all duration-300"
              style={{
                width:
                  activeStep < 0
                    ? "0%"
                    : `${(activeStep / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>

          <div className="relative flex items-start justify-between gap-0">
            {steps.map((step, index) => {
              const isCompleted = activeStep >= 0 && index <= activeStep;
              const isCurrent = index === activeStep;

              return (
                <div
                  key={step.label}
                  className="relative flex min-w-[136px] flex-1 flex-col items-center text-center"
                >
                  <span
                    className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ${
                      isCompleted
                        ? "border-[#ed8435] bg-[#ed8435] text-white"
                        : "border-black/10 bg-[#f8f8f7] text-[#8b8d91]"
                    } ${isCurrent ? "shadow-[0_10px_24px_rgba(237,132,53,0.2)]" : ""}`}
                  >
                    {step.icon}
                  </span>
                  <div className="mt-3">
                    <p
                      className={`text-sm font-semibold ${
                        isCompleted ? "text-[#16384f]" : "text-[#8b8d91]"
                      }`}
                    >
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-[#ed8435]">
                        Actual
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountProfileForm({
  user,
  orders,
}: {
  user: AccountUser;
  orders: AccountOrder[];
}) {
  const router = useRouter();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(
    orders[0]?.id ?? null,
  );
  const [form, setForm] = useState<FormState>({
    fullName: user.fullName,
    company: user.company || "",
    email: user.email,
    phone: user.phone || "",
    department: user.department || "",
    city: user.city || "",
    addressLine1: user.addressLine1 || "",
    addressLine2: user.addressLine2 || "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [inlineError, setInlineError] = useState("");
  const cityOptions = useMemo(
    () => getCitiesForDepartment(form.department),
    [form.department],
  );

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = event.target;
    setForm((current) => {
      if (id === "department") {
        return { ...current, department: value, city: "" };
      }

      return { ...current, [id]: value };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInlineError("");
    setToast(null);

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      const message = "Las nuevas contraseñas no coinciden.";
      setInlineError(message);
      setToast({ tone: "error", message });
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/account", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const payload = (await response.json()) as {
      error?: string;
      message?: string;
    };

    setIsSubmitting(false);

    if (!response.ok) {
      const message = payload.error || "No fue posible actualizar la cuenta.";
      setInlineError(message);
      setToast({ tone: "error", message });
      return;
    }

    setForm((current) => ({
      ...current,
      newPassword: "",
      confirmPassword: "",
    }));
    setToast({
      tone: "success",
      message: payload.message || "Cuenta actualizada correctamente.",
    });
    router.refresh();
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    router.push("/");
    router.refresh();
  };

  return (
    <main className="bg-[#f5f5f5] px-6 py-16">
      {toast && (
        <div className="fixed right-5 top-5 z-[80] w-[min(92vw,380px)]">
          <div
            className={`rounded-[1.4rem] border px-5 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.16)] backdrop-blur-sm ${
              toast.tone === "success"
                ? "border-[#1f8b45]/18 bg-[#effaf2] text-[#1f6b39]"
                : "border-[#ed8435]/18 bg-[#fff6ee] text-[#b85d12]"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em]">
                  {toast.tone === "success" ? "Correcto" : "Atención"}
                </p>
                <p className="mt-2 text-sm font-medium leading-6">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-lg leading-none opacity-60 transition-opacity duration-200 hover:opacity-100"
                aria-label="Cerrar notificación"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="mx-auto w-full max-w-6xl space-y-8">
        <section className="rounded-[2rem] bg-white p-8 shadow-lg shadow-black/10 md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ed8435]">
                Cuenta cliente
              </p>
              <h1 className="mt-2 text-3xl font-bold text-[#16384f] md:text-4xl">
                Mi cuenta
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
                Aquí puedes revisar y actualizar tus datos principales.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/"
                className="rounded-full border border-[#16384f]/20 px-5 py-3 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
              >
                Ir al inicio
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-[#16384f] px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0f2a3b]"
              >
                Cerrar sesión
              </button>
            </div>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-black/8 bg-[#fafaf9] p-5 text-sm text-[#5d6167]">
            Cuenta creada el{" "}
            <span className="font-semibold text-[#16384f]">
              {new Date(user.createdAt).toLocaleDateString("es-CO")}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-slate-700">
                Nombre completo
              </label>
              <input
                id="fullName"
                type="text"
                value={form.fullName}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors duration-200 focus:border-[#ed8435]"
              />
            </div>

            <div>
              <label htmlFor="company" className="mb-2 block text-sm font-medium text-slate-700">
                Empresa o taller
              </label>
              <input
                id="company"
                type="text"
                value={form.company}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors duration-200 focus:border-[#ed8435]"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors duration-200 focus:border-[#ed8435]"
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-700">
                Teléfono
              </label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors duration-200 focus:border-[#ed8435]"
              />
            </div>

            <div>
              <label htmlFor="department" className="mb-2 block text-sm font-medium text-slate-700">
                Departamento
              </label>
              <select
                id="department"
                value={form.department}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition-colors duration-200 focus:border-[#ed8435]"
              >
                <option value="">Selecciona un departamento</option>
                {departamentosColombia.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="city" className="mb-2 block text-sm font-medium text-slate-700">
                Ciudad
              </label>
              <input
                id="city"
                type="text"
                value={form.city}
                onChange={handleChange}
                list="account-cities"
                disabled={!form.department}
                placeholder={
                  form.department
                    ? "Busca o escribe tu ciudad"
                    : "Primero selecciona un departamento"
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors duration-200 focus:border-[#ed8435]"
              />
              <datalist id="account-cities">
                {cityOptions.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="addressLine1" className="mb-2 block text-sm font-medium text-slate-700">
                Dirección principal
              </label>
              <input
                id="addressLine1"
                type="text"
                value={form.addressLine1}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors duration-200 focus:border-[#ed8435]"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="addressLine2" className="mb-2 block text-sm font-medium text-slate-700">
                Complemento de dirección
              </label>
              <input
                id="addressLine2"
                type="text"
                value={form.addressLine2}
                onChange={handleChange}
                placeholder="Opcional"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors duration-200 focus:border-[#ed8435]"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="mb-2 block text-sm font-medium text-slate-700">
                Nueva contraseña
              </label>
              <input
                id="newPassword"
                type="password"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="Opcional"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors duration-200 focus:border-[#ed8435]"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-700">
                Confirmar nueva contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repite la nueva contraseña"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors duration-200 focus:border-[#ed8435]"
              />
            </div>

            {inlineError && (
              <p className="rounded-xl border border-[#ed8435]/20 bg-[#fff6ee] px-4 py-3 text-sm font-medium text-[#b85d12] md:col-span-2">
                {inlineError}
              </p>
            )}

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-[#ed8435] px-4 py-3 font-semibold text-white transition-colors duration-200 hover:bg-[#d67024] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Guardando cambios..." : "Actualizar cuenta"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-[2rem] bg-white p-8 shadow-lg shadow-black/10 md:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ed8435]">
                Mis pedidos
              </p>
              <h2 className="mt-2 text-3xl font-bold text-[#16384f] md:text-4xl">
                Historial de compras
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Aquí verás todos los pedidos que vayas creando desde el checkout,
                junto con su estado y los productos incluidos.
              </p>
            </div>

            <Link
              href="/categorias"
              className="rounded-full border border-[#16384f]/20 px-5 py-3 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
            >
              Seguir comprando
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="mt-6 rounded-[1.5rem] border border-dashed border-black/12 bg-[#fafaf9] p-8 text-center text-sm leading-7 text-[#6e7379]">
              Aún no tienes pedidos guardados. Cuando completes tu checkout, aparecerán
              aquí con su dirección, estado y productos.
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-[1.75rem] border border-black/8 bg-[#fafaf9]"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedOrderId((current) =>
                        current === order.id ? null : order.id,
                      )
                    }
                    className="flex w-full flex-col gap-4 p-5 text-left transition-colors duration-200 hover:bg-white/45"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b8d91]">
                          Pedido
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-[#16384f] md:text-xl">
                          {order.id}
                        </h3>
                        <p className="mt-2 text-sm text-[#6e7379]">
                          {new Date(order.createdAt).toLocaleDateString("es-CO")} ·{" "}
                          {order.city} · {order.totalItems} producto
                          {order.totalItems === 1 ? "" : "s"}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <span className="rounded-full bg-[#16384f] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                          {getOrderStatusLabel(order.status)}
                        </span>
                        <span className="rounded-full border border-[#ed8435]/18 bg-[#fff6ee] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#b85d12]">
                          {getPaymentStatusLabel(order.paymentStatus)}
                        </span>
                        <span className="rounded-full border border-[#1f8b45]/18 bg-[#effaf2] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#1f6b39]">
                          {getShippingStatusLabel(order.shippingStatus)}
                        </span>
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/8 bg-white text-[#16384f]">
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            className={`h-4 w-4 transition-transform duration-200 ${
                              expandedOrderId === order.id ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-black/8 pt-4 text-sm">
                      <span className="text-[#6e7379]">
                        {order.carrier || "Transportadora pendiente"} ·{" "}
                        {order.trackingNumber || "Sin guía"}
                      </span>
                      <span className="text-lg font-semibold text-[#ed8435]">
                        {formatCurrency(order.subtotal)}
                      </span>
                    </div>
                  </button>

                  {expandedOrderId === order.id && (
                    <div className="border-t border-black/8 px-5 pb-5 pt-5">
                      <OrderProgressTimeline order={order} />

                      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-[1.1rem] border border-black/8 bg-white px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                            Transportadora
                          </p>
                          <p className="mt-2 text-sm font-semibold text-[#16384f]">
                            {order.carrier || "Por definir"}
                          </p>
                        </div>
                        <div className="rounded-[1.1rem] border border-black/8 bg-white px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                            Número de guía
                          </p>
                          <p className="mt-2 text-sm font-semibold text-[#16384f]">
                            {order.trackingNumber || "Aún no asignado"}
                          </p>
                        </div>
                        <div className="rounded-[1.1rem] border border-black/8 bg-white px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                            Fecha de envío
                          </p>
                          <p className="mt-2 text-sm font-semibold text-[#16384f]">
                            {order.shippedAt
                              ? new Date(order.shippedAt).toLocaleDateString("es-CO")
                              : "Pendiente"}
                          </p>
                        </div>
                        <div className="rounded-[1.1rem] border border-black/8 bg-white px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                            Fecha de entrega
                          </p>
                          <p className="mt-2 text-sm font-semibold text-[#16384f]">
                            {order.deliveredAt
                              ? new Date(order.deliveredAt).toLocaleDateString("es-CO")
                              : "Sin confirmar"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 rounded-[1.1rem] border border-black/8 bg-white px-4 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                          Dirección de entrega
                        </p>
                        <p className="mt-2 text-sm leading-7 text-[#5d6167]">
                          {order.department} · {order.city} · {order.addressLine1}
                          {order.addressLine2 ? ` · ${order.addressLine2}` : ""}
                        </p>
                      </div>

                      <div className="mt-5 grid gap-3 md:grid-cols-2">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-[1.1rem] border border-black/8 bg-white px-4 py-3"
                          >
                            <p className="text-sm font-semibold text-[#1f2328]">{item.name}</p>
                            <div className="mt-2 flex items-center justify-between text-sm text-[#6e7379]">
                              <span>Cantidad: {item.quantity}</span>
                              <span className="font-semibold text-[#16384f]">
                                {formatCurrency(item.unitPrice)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {order.adminNotes && (
                        <div className="mt-5 rounded-[1.1rem] border border-black/8 bg-white px-4 py-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                            Nota de envío
                          </p>
                          <p className="mt-2 text-sm leading-7 text-[#5d6167]">
                            {order.adminNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
