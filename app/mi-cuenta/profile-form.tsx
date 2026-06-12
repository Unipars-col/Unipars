"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { departamentosColombia, getCitiesForDepartment } from "@/lib/colombia-locations";
import FacturaElectronica from "../checkout/exito/factura-electronica";
import { useProducts } from "../components/products-provider";

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
  role: "CUSTOMER" | "EXCLUSIVE" | "SELLER" | "PROVIDER" | "ADMIN" | "MASTER";
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

type AccountPanel = "summary" | "details" | "orders" | "referencias" | "catalogo" | "direcciones";
type ClientCode = { id: string; productSlug: string; productName: string; customCode: string };
type SavedAddress = { id: string; label: string | null; department: string; city: string; addressLine1: string; addressLine2: string | null; isDefault: boolean };

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatOrderDate(value: Date) {
  return new Date(value).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

function getShippingStatusClasses(status: AccountOrder["shippingStatus"]) {
  if (status === "DELIVERED") return "border-[#1f8b45]/18 bg-[#effaf2] text-[#1f6b39]";
  if (status === "SHIPPED") return "border-[#16384f]/15 bg-[#eaf3f8] text-[#16384f]";
  if (status === "PREPARING") return "border-[#ed8435]/18 bg-[#fff6ee] text-[#b85d12]";
  if (status === "CANCELLED") return "border-black/10 bg-[#f3f4f6] text-[#60656b]";
  return "border-black/8 bg-white text-[#6e7379]";
}

function getPaymentStatusClasses(status: AccountOrder["paymentStatus"]) {
  if (status === "PAID") return "border-[#1f8b45]/18 bg-[#effaf2] text-[#1f6b39]";
  if (status === "FAILED") return "border-[#ed8435]/18 bg-[#fff6ee] text-[#b85d12]";
  return "border-black/8 bg-white text-[#6e7379]";
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
  const [activePanel, setActivePanel] = useState<AccountPanel>("summary");
  const [showFullOrderHistory, setShowFullOrderHistory] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
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
  const [clientCodes, setClientCodes] = useState<ClientCode[]>([]);
  const [codesLoaded, setCodesLoaded] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [inlineInputs, setInlineInputs] = useState<Record<string, string>>({});
  const [inlineSaving, setInlineSaving] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [addressesLoaded, setAddressesLoaded] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "", department: "", city: "", addressLine1: "", addressLine2: "" });
  const { products } = useProducts();
  const cityOptions = useMemo(
    () => getCitiesForDepartment(form.department),
    [form.department],
  );
  const summaryItems = [
    {
      label: "Correo principal",
      value: user.email,
    },
    {
      label: "Teléfono",
      value: user.phone || "Por completar",
    },
    {
      label: "Ubicación",
      value:
        user.department && user.city
          ? `${user.department} · ${user.city}`
          : "Aún sin ubicación guardada",
    },
    {
      label: "Dirección",
      value: user.addressLine1 || "Sin dirección principal",
    },
  ];
  const paidOrders = orders.filter((order) => order.paymentStatus === "PAID").length;
  const activeShipments = orders.filter((order) =>
    ["PREPARING", "SHIPPED"].includes(order.shippingStatus),
  ).length;
  const deliveredOrders = orders.filter(
    (order) => order.shippingStatus === "DELIVERED",
  ).length;
  const recentOrders = showFullOrderHistory ? orders : orders.slice(0, 3);
  const visibleSelectedOrderId = recentOrders.some(
    (order) => order.id === selectedOrderId,
  )
    ? selectedOrderId
    : null;
  const selectedOrder =
    recentOrders.find((order) => order.id === visibleSelectedOrderId) ??
    null;

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

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setActivePanel("summary")}
                className={`rounded-full px-5 py-3 text-sm font-semibold transition-colors duration-200 ${
                  activePanel === "summary"
                    ? "bg-[#16384f] text-white"
                    : "border border-[#16384f]/20 text-[#16384f] hover:bg-[#16384f] hover:text-white"
                }`}
              >
                Resumen
              </button>
              <button
                type="button"
                onClick={() => setActivePanel("details")}
                className={`rounded-full px-5 py-3 text-sm font-semibold transition-colors duration-200 ${
                  activePanel === "details"
                    ? "bg-[#16384f] text-white"
                    : "border border-[#16384f]/20 text-[#16384f] hover:bg-[#16384f] hover:text-white"
                }`}
              >
                Datos
              </button>
              <button
                type="button"
                onClick={() => setActivePanel("orders")}
                className={`rounded-full px-5 py-3 text-sm font-semibold transition-colors duration-200 ${
                  activePanel === "orders"
                    ? "bg-[#16384f] text-white"
                    : "border border-[#16384f]/20 text-[#16384f] hover:bg-[#16384f] hover:text-white"
                }`}
              >
                Pedidos
              </button>
              <button
                type="button"
                onClick={() => {
                  setActivePanel("direcciones");
                  if (!addressesLoaded) {
                    fetch("/api/mi-cuenta/direcciones")
                      .then((r) => r.ok ? r.json() : { addresses: [] })
                      .then((d: { addresses?: SavedAddress[] }) => {
                        setSavedAddresses(d.addresses ?? []);
                        setAddressesLoaded(true);
                      })
                      .catch(() => setAddressesLoaded(true));
                  }
                }}
                className={`rounded-full px-5 py-3 text-sm font-semibold transition-colors duration-200 ${
                  activePanel === "direcciones"
                    ? "bg-[#16384f] text-white"
                    : "border border-[#16384f]/20 text-[#16384f] hover:bg-[#16384f] hover:text-white"
                }`}
              >
                Direcciones
              </button>
              {user.role === "EXCLUSIVE" && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePanel("catalogo");
                      if (!codesLoaded) {
                        fetch("/api/mi-cuenta/codigos")
                          .then((r) => r.json())
                          .then((data: { codes?: ClientCode[] }) => {
                            setClientCodes(data.codes ?? []);
                            const inputs: Record<string, string> = {};
                            for (const c of data.codes ?? []) inputs[c.productSlug] = c.customCode;
                            setInlineInputs(inputs);
                            setCodesLoaded(true);
                          })
                          .catch(() => setCodesLoaded(true));
                      }
                    }}
                    className={`rounded-full px-5 py-3 text-sm font-semibold transition-colors duration-200 ${
                      activePanel === "catalogo"
                        ? "bg-[#16384f] text-white"
                        : "border border-[#16384f]/20 text-[#16384f] hover:bg-[#16384f] hover:text-white"
                    }`}
                  >
                    Catálogo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePanel("referencias");
                      if (!codesLoaded) {
                        fetch("/api/mi-cuenta/codigos")
                          .then((r) => r.json())
                          .then((data: { codes?: ClientCode[] }) => {
                            setClientCodes(data.codes ?? []);
                            setCodesLoaded(true);
                          })
                          .catch(() => setCodesLoaded(true));
                      }
                    }}
                    className={`rounded-full px-5 py-3 text-sm font-semibold transition-colors duration-200 ${
                      activePanel === "referencias"
                        ? "bg-[#16384f] text-white"
                        : "border border-[#16384f]/20 text-[#16384f] hover:bg-[#16384f] hover:text-white"
                    }`}
                  >
                    Mis referencias
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Siempre visible: datos clave del usuario */}
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryItems.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.3rem] border border-black/8 bg-[#fafaf9] px-5 py-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                  {item.label}
                </p>
                <p className="mt-3 text-sm font-semibold leading-7 text-[#16384f]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-[1.25rem] border border-black/8 bg-[#fafaf9] px-5 py-3 text-sm text-[#5d6167]">
            Cuenta creada el{" "}
            <span className="font-semibold text-[#16384f]">
              {new Date(user.createdAt).toLocaleDateString("es-CO")}
            </span>
            {activePanel === "summary" && (
              <span>
                {" "}· Usa <span className="font-semibold text-[#16384f]">Datos</span> para editar tu perfil o{" "}
                <span className="font-semibold text-[#16384f]">Pedidos</span> para revisar tus compras.
              </span>
            )}
          </div>

          {activePanel === "details" && (
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
          )}

          {activePanel === "orders" && (
          <div>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ed8435]">
                Mis pedidos
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[#16384f]">
                Historial de compras
              </h2>
            </div>
            <Link
              href="/categorias"
              className="rounded-full border border-[#16384f]/20 px-5 py-3 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
            >
              Seguir comprando
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.3rem] border border-black/8 bg-[#fafaf9] px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                Pedidos totales
              </p>
              <p className="mt-3 text-3xl font-bold tracking-[-0.04em] text-[#16384f]">
                {orders.length}
              </p>
            </div>
            <div className="rounded-[1.3rem] border border-black/8 bg-[#fafaf9] px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                En proceso
              </p>
              <p className="mt-3 text-3xl font-bold tracking-[-0.04em] text-[#16384f]">
                {activeShipments}
              </p>
            </div>
            <div className="rounded-[1.3rem] border border-black/8 bg-[#fafaf9] px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                Entregados
              </p>
              <p className="mt-3 text-3xl font-bold tracking-[-0.04em] text-[#16384f]">
                {deliveredOrders}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-black/8 bg-[#fafaf9] p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                  Vista del historial
                </p>
                <p className="mt-2 text-sm leading-7 text-[#5d6167]">
                  Tienes {paidOrders} compra{paidOrders === 1 ? "" : "s"} confirmada
                  {paidOrders === 1 ? "" : "s"} y {orders.length} pedido
                  {orders.length === 1 ? "" : "s"} en total.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFullOrderHistory((current) => !current)}
                className="rounded-full border border-[#16384f]/20 px-5 py-3 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
              >
                {showFullOrderHistory ? "Ver solo recientes" : "Ver historial completo"}
              </button>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="mt-6 rounded-[1.5rem] border border-dashed border-black/12 bg-[#fafaf9] p-8 text-center text-sm leading-7 text-[#6e7379]">
              Aún no tienes pedidos guardados. Cuando completes tu checkout, aparecerán
              aquí con su dirección, estado y productos.
            </div>
          ) : (
            <div className="mt-6 grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
              <aside className="space-y-5">
                <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b8d91]">
                    Pedidos
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#16384f]">
                    Historial listo para revisar
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#6e7379]">
                    Elige un pedido de la lista para ver sus productos, despacho y fechas clave.
                  </p>
                </div>

                <div className="rounded-[1.75rem] border border-black/8 bg-white p-5 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                <div className="space-y-4">
                  {recentOrders.map((order) => {
                    const isSelected = selectedOrder?.id === order.id;

                    return (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => setSelectedOrderId(order.id)}
                        className={`w-full rounded-[1.4rem] border px-5 py-5 text-left transition-colors duration-200 ${
                          isSelected
                            ? "border-[#16384f] bg-[#16384f] text-white shadow-[0_14px_28px_rgba(22,56,79,0.18)]"
                            : "border-black/8 bg-[#fafaf9] text-[#16384f] hover:bg-[#f4f7f9]"
                        }`}
                      >
                        <p
                          className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${
                            isSelected ? "text-white/70" : "text-[#8b8d91]"
                          }`}
                        >
                          Pedido
                        </p>
                        <p className="mt-3 truncate text-[1.45rem] font-semibold leading-tight">
                          {order.id}
                        </p>
                        <p
                          className={`mt-2 text-sm ${
                            isSelected ? "text-white/80" : "text-[#5d6167]"
                          }`}
                        >
                          {user.fullName} · {order.city}
                        </p>
                        <p
                          className={`mt-1 text-sm ${
                            isSelected ? "text-white/70" : "text-[#7a7f86]"
                          }`}
                        >
                          {formatOrderDate(order.createdAt)} · {order.totalItems} producto
                          {order.totalItems === 1 ? "" : "s"}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                              isSelected
                                ? "bg-white/12 text-white"
                                : getShippingStatusClasses(order.shippingStatus)
                            }`}
                          >
                            {getShippingStatusLabel(order.shippingStatus)}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                              isSelected
                                ? "bg-white/12 text-white"
                                : getPaymentStatusClasses(order.paymentStatus)
                            }`}
                          >
                            {getPaymentStatusLabel(order.paymentStatus)}
                          </span>
                        </div>
                        <p
                          className={`mt-5 text-base font-semibold ${
                            isSelected ? "text-white" : "text-[#ed8435]"
                          }`}
                        >
                          {formatCurrency(order.subtotal)}
                        </p>
                      </button>
                    );
                  })}
                </div>
                </div>
              </aside>

              {!selectedOrder ? (
                <div className="rounded-[1.75rem] border border-dashed border-black/12 bg-white p-8 text-center text-sm leading-7 text-[#6e7379]">
                  Selecciona un pedido para ver el detalle completo.
                </div>
              ) : (
                <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b8d91]">
                        Pedido seleccionado
                      </p>
                      <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#16384f]">
                        {selectedOrder.id}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-[#6e7379]">
                        {user.fullName} · {user.email}
                        {user.phone ? ` · ${user.phone}` : ""}
                      </p>
                      <p className="text-sm leading-7 text-[#6e7379]">
                        {selectedOrder.department}, {selectedOrder.city} ·{" "}
                        {selectedOrder.addressLine1}
                        {selectedOrder.addressLine2
                          ? ` · ${selectedOrder.addressLine2}`
                          : ""}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#16384f] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                        {getOrderStatusLabel(selectedOrder.status)}
                      </span>
                      <span
                        className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${getPaymentStatusClasses(selectedOrder.paymentStatus)}`}
                      >
                        {getPaymentStatusLabel(selectedOrder.paymentStatus)}
                      </span>
                      <span
                        className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${getShippingStatusClasses(selectedOrder.shippingStatus)}`}
                      >
                        {getShippingStatusLabel(selectedOrder.shippingStatus)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_320px]">
                    <div className="rounded-[1.4rem] border border-black/8 bg-[#fafaf9] p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b8d91]">
                            Resumen del pedido
                          </p>
                          <p className="mt-2 text-sm text-[#6e7379]">
                            Revisa qué compraste y cómo va el despacho.
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#16384f] shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
                          {selectedOrder.totalItems} producto
                          {selectedOrder.totalItems === 1 ? "" : "s"}
                        </span>
                      </div>

                      <div className="mt-5 space-y-3">
                        {selectedOrder.items.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-[1rem] border border-black/8 bg-white px-4 py-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-[#1f2328]">
                                  {item.name}
                                </p>
                                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#8b8d91]">
                                  Cantidad
                                </p>
                                <p className="mt-1 text-sm font-medium text-[#5d6167]">
                                  {item.quantity}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs uppercase tracking-[0.18em] text-[#8b8d91]">
                                  Precio unidad
                                </p>
                                <p className="mt-1 text-sm font-semibold text-[#16384f]">
                                  {formatCurrency(item.unitPrice)}
                                </p>
                                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[#8b8d91]">
                                  Subtotal
                                </p>
                                <p className="mt-1 text-sm font-semibold text-[#ed8435]">
                                  {formatCurrency(item.unitPrice * item.quantity)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <div className="rounded-[1.4rem] border border-black/8 bg-[#fafaf9] px-5 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                          Total del pedido
                        </p>
                        <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#ed8435]">
                          {formatCurrency(selectedOrder.subtotal)}
                        </p>
                      </div>
                      <div className="rounded-[1.4rem] border border-black/8 bg-[#fafaf9] px-5 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                          Transportadora actual
                        </p>
                        <p className="mt-2 text-sm font-semibold text-[#16384f]">
                          {selectedOrder.carrier || "Por definir"}
                        </p>
                      </div>
                      <div className="rounded-[1.4rem] border border-black/8 bg-[#fafaf9] px-5 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                          Guía actual
                        </p>
                        <p className="mt-2 text-sm font-semibold text-[#16384f]">
                          {selectedOrder.trackingNumber || "Aún no asignada"}
                        </p>
                      </div>
                      <div className="rounded-[1.4rem] border border-black/8 bg-[#fafaf9] px-5 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                          Fechas clave
                        </p>
                        <p className="mt-2 text-sm font-semibold text-[#16384f]">
                          Creado: {formatOrderDate(selectedOrder.createdAt)}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-[#16384f]">
                          Enviado:{" "}
                          {selectedOrder.shippedAt
                            ? formatOrderDate(selectedOrder.shippedAt)
                            : "Pendiente"}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-[#16384f]">
                          Entregado:{" "}
                          {selectedOrder.deliveredAt
                            ? formatOrderDate(selectedOrder.deliveredAt)
                            : "Sin confirmar"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <OrderProgressTimeline order={selectedOrder} />
                  </div>

                  <div className="mt-5 rounded-[1.1rem] border border-black/8 bg-[#fafaf9] px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                      Dirección de entrega
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[#5d6167]">
                      {selectedOrder.department} · {selectedOrder.city} ·{" "}
                      {selectedOrder.addressLine1}
                      {selectedOrder.addressLine2
                        ? ` · ${selectedOrder.addressLine2}`
                        : ""}
                    </p>
                  </div>

                  {selectedOrder.adminNotes && (
                    <div className="mt-5 rounded-[1.1rem] border border-black/8 bg-[#fafaf9] px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                        Nota de envío
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[#5d6167]">
                        {selectedOrder.adminNotes}
                      </p>
                    </div>
                  )}

                  <div className="mt-5">
                    <FacturaElectronica pedido={selectedOrder.id} />
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
          )}

          {/* ── Panel Catálogo (solo EXCLUSIVE) ── */}
          {activePanel === "catalogo" && user.role === "EXCLUSIVE" && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b8d91]">Cliente exclusivo</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#16384f]">Asignar mis códigos</h2>
              <p className="mt-2 text-sm text-[#6e7379]">Busca un producto y escribe tu referencia interna. Presiona Enter o clic en Guardar.</p>
            </div>

            <input
              type="text"
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              placeholder="Buscar producto por nombre, marca o categoría..."
              className="w-full rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm outline-none focus:border-[#16384f]/40 shadow-sm"
            />

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {products
                .filter((p) => {
                  const q = catalogSearch.toLowerCase();
                  return !q || p.nombre.toLowerCase().includes(q) || p.marca.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q);
                })
                .slice(0, 500)
                .map((p) => {
                  const saved = clientCodes.find((c) => c.productSlug === p.slug);
                  const inputVal = inlineInputs[p.slug] ?? saved?.customCode ?? "";
                  return (
                    <div key={p.slug} className="flex items-center gap-3 rounded-2xl border border-black/8 bg-white p-3 shadow-sm">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#f0f2f4]">
                        <Image src={p.imagen} alt={p.nombre} fill className="object-contain p-1" sizes="56px" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#1f2328]">{p.nombre}</p>
                        <p className="text-[11px] text-[#8b8d91]">{p.marca} · {p.categoria}</p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <input
                            type="text"
                            value={inputVal}
                            onChange={(e) => setInlineInputs((prev) => ({ ...prev, [p.slug]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && inlineInputs[p.slug]?.trim()) {
                                setInlineSaving(p.slug);
                                fetch("/api/mi-cuenta/codigos", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ productSlug: p.slug, productName: p.nombre, customCode: inlineInputs[p.slug].trim() }),
                                })
                                  .then((r) => r.json())
                                  .then((d: { code?: ClientCode }) => {
                                    if (d.code) {
                                      setClientCodes((prev) => {
                                        const exists = prev.find((c) => c.productSlug === p.slug);
                                        return exists ? prev.map((c) => c.productSlug === p.slug ? d.code! : c) : [...prev, d.code!];
                                      });
                                    }
                                  })
                                  .finally(() => setInlineSaving(null));
                              }
                            }}
                            placeholder="Tu código..."
                            maxLength={30}
                            className="w-full rounded-lg border border-black/10 bg-[#f8f9fb] px-2 py-1 text-xs font-semibold text-[#16384f] outline-none placeholder:font-normal placeholder:text-[#c0c4ca] focus:border-[#16384f]/40"
                          />
                          <button
                            type="button"
                            disabled={!inlineInputs[p.slug]?.trim() || inlineSaving === p.slug}
                            onClick={() => {
                              if (!inlineInputs[p.slug]?.trim()) return;
                              setInlineSaving(p.slug);
                              fetch("/api/mi-cuenta/codigos", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ productSlug: p.slug, productName: p.nombre, customCode: inlineInputs[p.slug].trim() }),
                              })
                                .then((r) => r.json())
                                .then((d: { code?: ClientCode }) => {
                                  if (d.code) {
                                    setClientCodes((prev) => {
                                      const exists = prev.find((c) => c.productSlug === p.slug);
                                      return exists ? prev.map((c) => c.productSlug === p.slug ? d.code! : c) : [...prev, d.code!];
                                    });
                                  }
                                })
                                .finally(() => setInlineSaving(null));
                            }}
                            className="shrink-0 rounded-lg bg-[#16384f] px-2 py-1 text-[10px] font-bold text-white transition-colors hover:bg-[#0f2638] disabled:opacity-40"
                          >
                            {inlineSaving === p.slug ? "..." : saved ? "✓" : "Guardar"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
          )}

          {/* ── Panel Mis referencias (solo EXCLUSIVE) ── */}
          {activePanel === "referencias" && user.role === "EXCLUSIVE" && (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b8d91]">Cliente exclusivo</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#16384f]">Mis referencias internas</h2>
              <p className="mt-2 text-sm text-[#6e7379]">Códigos personalizados que has asignado a los productos del catálogo.</p>
            </div>
            {!codesLoaded ? (
              <p className="text-sm text-[#8b8d91] animate-pulse">Cargando...</p>
            ) : clientCodes.length === 0 ? (
              <div className="rounded-[1.4rem] border border-dashed border-black/12 bg-white p-10 text-center text-[#6e7379]">
                <p className="font-semibold">Aún no tienes referencias guardadas.</p>
                <p className="mt-1 text-sm">Ve al tab Catálogo y asigna tu código a los productos.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {clientCodes.map((c) => {
                  const prod = products.find((p) => p.slug === c.productSlug);
                  return (
                    <a key={c.id} href={`/producto/${c.productSlug}`}
                      className="group flex gap-4 rounded-[1.4rem] border border-black/8 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f0f2f4]">
                        {prod && (
                          <Image src={prod.imagen} alt={c.productName} fill className="object-contain p-2" sizes="80px" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#1f2328] group-hover:text-[#16384f]">{c.productName}</p>
                        {prod && (
                          <p className="mt-0.5 text-base font-bold text-[#ed8435]">{prod.precio}</p>
                        )}
                        <span className="mt-2 inline-flex items-center gap-1 rounded-lg bg-[#e8f0fe] px-2.5 py-1 text-xs font-bold text-[#16384f]">
                          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                          {c.customCode}
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
          )}

          {/* ── Panel Direcciones ── */}
          {activePanel === "direcciones" && (
            <div className="mt-6 space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b8d91]">Entrega</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#16384f]">Mis direcciones</h2>
                <p className="mt-2 text-sm text-[#6e7379]">Hasta 10 direcciones de entrega. En el checkout podrás elegir a cuál enviar cada pedido.</p>
              </div>

              {!addressesLoaded ? (
                <p className="text-sm text-[#8b8d91] animate-pulse">Cargando...</p>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {savedAddresses.map((addr) => (
                      <div key={addr.id} className="relative rounded-[1.4rem] border border-black/8 bg-white p-5 shadow-sm">
                        {addr.isDefault && (
                          <span className="absolute right-4 top-4 rounded-full bg-[#ed8435] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Principal</span>
                        )}
                        {addr.label && <p className="text-xs font-bold uppercase tracking-wide text-[#ed8435]">{addr.label}</p>}
                        <p className="mt-1 text-sm font-semibold text-[#16384f]">{addr.addressLine1}</p>
                        {addr.addressLine2 && <p className="text-xs text-[#8b8d91]">{addr.addressLine2}</p>}
                        <p className="mt-1 text-xs text-[#6e7379]">{addr.city}, {addr.department}</p>
                        <div className="mt-4 flex gap-2">
                          {!addr.isDefault && (
                            <button
                              type="button"
                              onClick={() => {
                                fetch(`/api/mi-cuenta/direcciones/${addr.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isDefault: true }) })
                                  .then((r) => r.ok ? r.json() : null)
                                  .then(() => setSavedAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === addr.id }))))
                                  .catch(() => undefined);
                              }}
                              className="rounded-lg border border-[#16384f]/20 px-3 py-1.5 text-xs font-semibold text-[#16384f] hover:bg-[#16384f] hover:text-white transition-colors"
                            >
                              Hacer principal
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (!confirm("¿Eliminar esta dirección?")) return;
                              fetch(`/api/mi-cuenta/direcciones/${addr.id}`, { method: "DELETE" })
                                .then((r) => r.ok ? r.json() : null)
                                .then(() => {
                                  setSavedAddresses((prev) => {
                                    const remaining = prev.filter((a) => a.id !== addr.id);
                                    if (addr.isDefault && remaining.length > 0) remaining[0].isDefault = true;
                                    return remaining;
                                  });
                                })
                                .catch(() => undefined);
                            }}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}

                    {savedAddresses.length < 10 && !showAddressForm && (
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(true)}
                        className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-[1.4rem] border-2 border-dashed border-slate-200 bg-white text-[#16384f] transition-colors hover:border-[#ed8435] hover:text-[#ed8435]"
                      >
                        <span className="text-3xl leading-none">+</span>
                        <span className="text-sm font-semibold">Agregar dirección</span>
                        <span className="text-xs text-slate-400">{savedAddresses.length}/10</span>
                      </button>
                    )}
                  </div>

                  {savedAddresses.length === 0 && !showAddressForm && (
                    <div className="rounded-[1.4rem] border border-dashed border-black/12 bg-white p-10 text-center text-[#6e7379]">
                      <p className="font-semibold">Aún no tienes direcciones guardadas.</p>
                      <p className="mt-1 text-sm">Agrega hasta 10 puntos de entrega para tus pedidos.</p>
                    </div>
                  )}

                  {showAddressForm && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                      <p className="mb-4 text-sm font-semibold text-[#16384f]">Nueva dirección</p>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <label className="mb-1.5 block text-xs font-medium text-slate-600">Etiqueta (opcional)</label>
                          <input type="text" value={newAddress.label} onChange={(e) => setNewAddress((a) => ({ ...a, label: e.target.value }))} placeholder="Ej: Bodega norte, Taller centro..." className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#ed8435]" />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-slate-600">Departamento *</label>
                          <select value={newAddress.department} onChange={(e) => setNewAddress((a) => ({ ...a, department: e.target.value, city: "" }))} required className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#ed8435]">
                            <option value="">Selecciona un departamento</option>
                            {departamentosColombia.map((d) => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-slate-600">Ciudad *</label>
                          <input type="text" value={newAddress.city} onChange={(e) => setNewAddress((a) => ({ ...a, city: e.target.value }))} list="new-addr-cities" placeholder={newAddress.department ? "Busca o escribe tu ciudad" : "Primero selecciona departamento"} disabled={!newAddress.department} required className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#ed8435]" />
                          <datalist id="new-addr-cities">{getCitiesForDepartment(newAddress.department).map((c) => <option key={c} value={c} />)}</datalist>
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-1.5 block text-xs font-medium text-slate-600">Dirección *</label>
                          <input type="text" value={newAddress.addressLine1} onChange={(e) => setNewAddress((a) => ({ ...a, addressLine1: e.target.value }))} placeholder="Calle, carrera, barrio o punto de entrega" required className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#ed8435]" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-1.5 block text-xs font-medium text-slate-600">Complemento (opcional)</label>
                          <input type="text" value={newAddress.addressLine2} onChange={(e) => setNewAddress((a) => ({ ...a, addressLine2: e.target.value }))} placeholder="Apto, interior, piso, bodega..." className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#ed8435]" />
                        </div>
                      </div>
                      <div className="mt-4 flex gap-3">
                        <button
                          type="button"
                          disabled={addressSaving}
                          onClick={() => {
                            if (!newAddress.department || !newAddress.city || !newAddress.addressLine1) return;
                            setAddressSaving(true);
                            fetch("/api/mi-cuenta/direcciones", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ ...newAddress, isDefault: savedAddresses.length === 0 }),
                            })
                              .then((r) => r.ok ? r.json() : null)
                              .then((d: { address?: SavedAddress } | null) => {
                                if (d?.address) {
                                  setSavedAddresses((prev) => [...prev, d.address!]);
                                  setNewAddress({ label: "", department: "", city: "", addressLine1: "", addressLine2: "" });
                                  setShowAddressForm(false);
                                }
                              })
                              .catch(() => undefined)
                              .finally(() => setAddressSaving(false));
                          }}
                          className="rounded-xl bg-[#ed8435] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d67024] disabled:opacity-60 transition-colors"
                        >
                          {addressSaving ? "Guardando..." : "Guardar dirección"}
                        </button>
                        <button type="button" onClick={() => setShowAddressForm(false)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-[#16384f] hover:bg-slate-100 transition-colors">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
