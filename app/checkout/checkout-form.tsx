"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { departamentosColombia, getCitiesForDepartment } from "@/lib/colombia-locations";

type CheckoutItem = {
  id: string;
  nombre: string;
  precio: string;
  imagen: string;
  cantidad: number;
};

type CheckoutUser = {
  fullName: string;
  company: string | null;
  email: string;
  phone: string | null;
  department: string | null;
  city: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
};

type SavedAddress = {
  id: string;
  label: string | null;
  department: string;
  city: string;
  addressLine1: string;
  addressLine2: string | null;
  isDefault: boolean;
};

type ToastState = {
  tone: "success" | "error";
  message: string;
} | null;

type FormState = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  company: string;
  department: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  notes: string;
};

type PendingOrderState = {
  id: string;
  totalItems: number;
  subtotal: number;
} | null;

type WompiParams = {
  publicKey: string;
  reference: string;
  amountInCents: number;
  currency: string;
  integrityHash: string;
  redirectUrl: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CheckoutForm({
  user,
  items,
  subtotal,
}: {
  user: CheckoutUser;
  items: CheckoutItem[];
  subtotal: number;
}) {
  const router = useRouter();
  const hasSavedAddress = Boolean(user.city || user.addressLine1 || user.addressLine2);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "profile" | "new">("profile");
  const [form, setForm] = useState<FormState>({
    customerName: user.fullName,
    customerEmail: user.email,
    customerPhone: user.phone || "",
    company: user.company || "",
    department: user.department || "",
    city: user.city || "",
    addressLine1: user.addressLine1 || "",
    addressLine2: user.addressLine2 || "",
    notes: "",
  });
  const [useDifferentAddress, setUseDifferentAddress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState("");
  const [toast, setToast] = useState<ToastState>(null);
  const [pendingOrder, setPendingOrder] = useState<PendingOrderState>(null);
  const [wompiParams, setWompiParams] = useState<WompiParams | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const cityOptions = useMemo(
    () => getCitiesForDepartment(form.department),
    [form.department],
  );

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    fetch("/api/mi-cuenta/direcciones")
      .then((r) => r.ok ? r.json() : null)
      .then((d: { addresses?: SavedAddress[] } | null) => {
        if (!d?.addresses?.length) return;
        setSavedAddresses(d.addresses);
        const def = d.addresses.find((a) => a.isDefault) ?? d.addresses[0];
        if (def) {
          setSelectedAddressId(def.id);
          setForm((f) => ({ ...f, department: def.department, city: def.city, addressLine1: def.addressLine1, addressLine2: def.addressLine2 ?? "" }));
        }
      })
      .catch(() => undefined);
  }, []);

  const totalItems = useMemo(
    () => items.reduce((total, item) => total + item.cantidad, 0),
    [items],
  );

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { id, value } = event.target;
    setForm((current) => {
      if (id === "department") {
        return { ...current, department: value, city: "" };
      }

      return { ...current, [id]: value };
    });
  };

  const handleToggleDifferentAddress = () => {
    setUseDifferentAddress((current) => {
      const nextValue = !current;
      setForm((currentForm) => ({
        ...currentForm,
        department: nextValue ? "" : user.department || "",
        city: nextValue ? "" : user.city || "",
        addressLine1: nextValue ? "" : user.addressLine1 || "",
        addressLine2: nextValue ? "" : user.addressLine2 || "",
      }));
      return nextValue;
    });
  };

  const selectSavedAddress = (addrId: string) => {
    setSelectedAddressId(addrId);
    if (addrId === "new") {
      setForm((f) => ({ ...f, department: "", city: "", addressLine1: "", addressLine2: "" }));
      return;
    }
    if (addrId === "profile") {
      setForm((f) => ({ ...f, department: user.department || "", city: user.city || "", addressLine1: user.addressLine1 || "", addressLine2: user.addressLine2 || "" }));
      return;
    }
    const addr = savedAddresses.find((a) => a.id === addrId);
    if (addr) setForm((f) => ({ ...f, department: addr.department, city: addr.city, addressLine1: addr.addressLine1, addressLine2: addr.addressLine2 ?? "" }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInlineError("");
    setToast(null);
    setIsSubmitting(true);

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 30_000);

      let response: Response;
      try {
        response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
          signal: controller.signal,
        });
      } catch (fetchErr) {
        window.clearTimeout(timeoutId);
        setIsSubmitting(false);
        const message = fetchErr instanceof Error && fetchErr.name === "AbortError"
          ? "La solicitud tardó demasiado. Intenta de nuevo."
          : "Error de conexión. Verifica tu red e intenta de nuevo.";
        setInlineError(message);
        setToast({ tone: "error", message });
        return;
      }
      window.clearTimeout(timeoutId);

      let payload: { error?: string; message?: string; order?: { id: string; totalItems: number; subtotal: number } };
      try {
        payload = await response.json();
      } catch {
        setIsSubmitting(false);
        const message = `Error del servidor (${response.status}). Intenta de nuevo.`;
        setInlineError(message);
        setToast({ tone: "error", message });
        return;
      }

      if (!response.ok || !payload.order) {
        setIsSubmitting(false);
        const message = payload.error || "No fue posible crear el pedido.";
        setInlineError(message);
        setToast({ tone: "error", message });
        return;
      }

      // Fetch Wompi parameters server-side (hash generation)
      const wompiRes = await fetch(`/api/checkout/wompi-hash?orderId=${payload.order.id}`);
      let wompiData: WompiParams & { error?: string };
      try {
        wompiData = await wompiRes.json();
      } catch {
        setPendingOrder(payload.order);
        setIsSubmitting(false);
        setInlineError("No fue posible iniciar el pago. Intenta desde Mis pedidos.");
        return;
      }

      setIsSubmitting(false);

      if (!wompiRes.ok || !wompiData.integrityHash) {
        setPendingOrder(payload.order);
        setInlineError(wompiData.error || "No fue posible iniciar el pago. Intenta desde Mis pedidos.");
        return;
      }

      setPendingOrder(payload.order);
      setWompiParams(wompiData);
    } catch {
      setIsSubmitting(false);
      const message = "Ocurrió un error inesperado. Intenta de nuevo.";
      setInlineError(message);
      setToast({ tone: "error", message });
    }
  };

  const handleGoToWompi = () => {
    if (!wompiParams) return;
    setIsRedirecting(true);

    const params = new URLSearchParams({
      "public-key": wompiParams.publicKey,
      currency: wompiParams.currency,
      "amount-in-cents": String(wompiParams.amountInCents),
      reference: wompiParams.reference,
      "signature:integrity": wompiParams.integrityHash,
      "redirect-url": wompiParams.redirectUrl,
      "customer-data:email": form.customerEmail,
      "customer-data:full-name": form.customerName,
      "customer-data:phone-number": form.customerPhone,
    });

    window.location.href = `https://checkout.wompi.co/p/?${params.toString()}`;
  };

  return (
    <main className="min-h-screen bg-[#f5f5f5] text-[#111]">
      {pendingOrder && wompiParams && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0f172a]/45 px-6 backdrop-blur-[2px]">
          <div className="w-full max-w-lg rounded-[1.9rem] border border-black/8 bg-white p-7 shadow-[0_30px_80px_rgba(15,23,42,0.28)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#ed8435]">
              Pago seguro
            </p>
            <h2 className="mt-3 text-3xl font-bold text-[#16384f]">
              Pagar con Wompi
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Tu pedido está listo. Serás redirigido a la pasarela de pago seguro de Wompi para completar la transacción.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <div className="rounded-[1.2rem] border border-black/8 bg-[#fafaf9] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                  Pedido
                </p>
                <p className="mt-2 text-sm font-semibold text-[#16384f]">{pendingOrder.id}</p>
              </div>
              <div className="rounded-[1.2rem] border border-black/8 bg-[#fafaf9] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                  Total a pagar
                </p>
                <p className="mt-2 text-sm font-semibold text-[#16384f]">
                  {formatCurrency(pendingOrder.subtotal)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => { setPendingOrder(null); setWompiParams(null); }}
                disabled={isRedirecting}
                className="flex-1 rounded-xl border border-[#16384f]/20 px-4 py-3 font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Pagar luego
              </button>
              <button
                type="button"
                onClick={handleGoToWompi}
                disabled={isRedirecting}
                className="flex-1 rounded-xl bg-[#ed8435] px-4 py-3 font-semibold text-white transition-colors duration-200 hover:bg-[#d67024] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isRedirecting ? "Redirigiendo..." : "Ir a pagar →"}
              </button>
            </div>
          </div>
        </div>
      )}

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

      <section className="mx-auto max-w-[1440px] px-6 py-16">
        <div className="mb-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.35em] text-[#8b8d91]">
            Checkout
          </p>
          <h1 className="text-4xl font-semibold uppercase tracking-[-0.04em] text-[#4f545a] md:text-6xl">
            Finalizar pedido
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#6e7379]">
            Completa tus datos de entrega y paga de forma segura con Wompi. Aceptamos tarjetas de crédito/débito, PSE y Nequi.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_16px_35px_rgba(15,23,42,0.05)] md:p-8"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="customerName" className="mb-2 block text-sm font-medium text-slate-700">
                  Nombre completo
                </label>
                <input
                  id="customerName"
                  value={form.customerName}
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
                  value={form.company}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors duration-200 focus:border-[#ed8435]"
                />
              </div>

              <div>
                <label htmlFor="customerEmail" className="mb-2 block text-sm font-medium text-slate-700">
                  Correo electrónico
                </label>
                <input
                  id="customerEmail"
                  type="email"
                  value={form.customerEmail}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors duration-200 focus:border-[#ed8435]"
                />
              </div>

              <div>
                <label htmlFor="customerPhone" className="mb-2 block text-sm font-medium text-slate-700">
                  Teléfono
                </label>
                <input
                  id="customerPhone"
                  type="tel"
                  value={form.customerPhone}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors duration-200 focus:border-[#ed8435]"
                />
              </div>

              {(selectedAddressId === "new" || (!savedAddresses.length && !hasSavedAddress) || (!savedAddresses.length && useDifferentAddress)) && (
                <>
                  <div>
                    <label htmlFor="department" className="mb-2 block text-sm font-medium text-slate-700">
                      Departamento
                    </label>
                    <select
                      id="department"
                      value={form.department}
                      onChange={handleChange}
                      required
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
                      value={form.city}
                      onChange={handleChange}
                      list="checkout-cities"
                      required
                      disabled={!form.department}
                      placeholder={
                        form.department
                          ? "Busca o escribe tu ciudad"
                          : "Primero selecciona un departamento"
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors duration-200 focus:border-[#ed8435]"
                    />
                    <datalist id="checkout-cities">
                      {cityOptions.map((city) => (
                        <option key={city} value={city} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label htmlFor="addressLine2" className="mb-2 block text-sm font-medium text-slate-700">
                      Complemento de dirección
                    </label>
                    <input
                      id="addressLine2"
                      value={form.addressLine2}
                      onChange={handleChange}
                      placeholder="Apto, interior, piso..."
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors duration-200 focus:border-[#ed8435]"
                    />
                  </div>
                </>
              )}

              {savedAddresses.length > 0 && (
                <div className="md:col-span-2">
                  <p className="mb-3 text-sm font-semibold text-[#16384f]">Dirección de entrega</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {hasSavedAddress && (
                      <button
                        type="button"
                        onClick={() => selectSavedAddress("profile")}
                        className={`rounded-[1.25rem] border p-4 text-left transition-colors ${selectedAddressId === "profile" ? "border-[#ed8435] bg-[#fff6ee]" : "border-black/8 bg-[#fafaf9] hover:border-[#ed8435]/50"}`}
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#ed8435]">Principal</p>
                        <p className="mt-1 text-sm font-medium text-[#16384f]">{user.addressLine1}</p>
                        <p className="text-xs text-[#8b8d91]">{user.city}, {user.department}</p>
                      </button>
                    )}
                    {savedAddresses.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => selectSavedAddress(addr.id)}
                        className={`rounded-[1.25rem] border p-4 text-left transition-colors ${selectedAddressId === addr.id ? "border-[#ed8435] bg-[#fff6ee]" : "border-black/8 bg-[#fafaf9] hover:border-[#ed8435]/50"}`}
                      >
                        {addr.label && <p className="text-xs font-semibold uppercase tracking-wide text-[#ed8435]">{addr.label}</p>}
                        <p className="mt-1 text-sm font-medium text-[#16384f]">{addr.addressLine1}</p>
                        <p className="text-xs text-[#8b8d91]">{addr.city}, {addr.department}</p>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => selectSavedAddress("new")}
                      className={`rounded-[1.25rem] border border-dashed p-4 text-left transition-colors ${selectedAddressId === "new" ? "border-[#ed8435] bg-[#fff6ee]" : "border-slate-300 hover:border-[#ed8435]/50"}`}
                    >
                      <p className="text-sm font-medium text-[#16384f]">+ Nueva dirección</p>
                      <p className="text-xs text-[#8b8d91]">Ingresar manualmente</p>
                    </button>
                  </div>
                </div>
              )}

              {!savedAddresses.length && hasSavedAddress && (
                <div className="md:col-span-2 rounded-[1.25rem] border border-black/8 bg-[#fafaf9] p-4">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={useDifferentAddress}
                      onChange={handleToggleDifferentAddress}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-[#ed8435] focus:ring-[#ed8435]"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#16384f]">
                        Usar otra dirección para este pedido
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#6e7379]">
                        Si la activas, este pedido usará una dirección distinta sin cambiar
                        la guardada en tu cuenta.
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {(selectedAddressId === "new" || (!savedAddresses.length && !hasSavedAddress) || (!savedAddresses.length && useDifferentAddress)) && (
                <div className="md:col-span-2">
                  <label htmlFor="addressLine1" className="mb-2 block text-sm font-medium text-slate-700">
                    Dirección principal
                  </label>
                  <input
                    id="addressLine1"
                    value={form.addressLine1}
                    onChange={handleChange}
                    required
                    placeholder="Calle, carrera, barrio o punto de entrega"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors duration-200 focus:border-[#ed8435]"
                  />
                </div>
              )}

              {selectedAddressId !== "new" && (savedAddresses.length > 0 || hasSavedAddress) && (
                <div className="md:col-span-2">
                  <label htmlFor="addressLine1" className="mb-2 block text-sm font-medium text-slate-700">
                    Dirección principal
                  </label>
                  <input
                    id="addressLine1"
                    value={form.addressLine1}
                    onChange={handleChange}
                    required
                    readOnly
                    placeholder="Calle, carrera, barrio o punto de entrega"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none text-slate-500"
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label htmlFor="notes" className="mb-2 block text-sm font-medium text-slate-700">
                  Notas del pedido
                </label>
                <textarea
                  id="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Indicaciones especiales para la entrega o la compra"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors duration-200 focus:border-[#ed8435]"
                />
              </div>
            </div>

            {inlineError && (
              <p className="mt-6 rounded-xl border border-[#ed8435]/20 bg-[#fff6ee] px-4 py-3 text-sm font-medium text-[#b85d12]">
                {inlineError}
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-[#ed8435] px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#d67024] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Preparando pedido..." : "Continuar al pago"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/carrito")}
                className="rounded-full border border-[#16384f]/18 px-6 py-3 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
              >
                Volver al carrito
              </button>
            </div>
          </form>

          <aside className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_16px_35px_rgba(15,23,42,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b8d91]">
              Resumen del pedido
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#16384f]">
              {totalItems} producto{totalItems === 1 ? "" : "s"}
            </h2>

            <div className="mt-6 space-y-4">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="flex items-center gap-3 rounded-[1.2rem] border border-black/8 bg-[#fafaf9] p-3"
                >
                  <Image
                    src={item.imagen}
                    alt={item.nombre}
                    width={88}
                    height={88}
                    className="h-20 w-20 rounded-[1rem] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold text-[#1f2328]">
                      {item.nombre}
                    </p>
                    <p className="mt-1 text-xs text-[#6e7379]">Cantidad: {item.cantidad}</p>
                    <p className="mt-2 text-sm font-semibold text-[#ed8435]">
                      {item.precio}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 rounded-[1.25rem] border border-black/8 bg-[#fafaf9] p-4">
              <div className="flex items-center justify-between text-sm text-[#5d6167]">
                <span>Subtotal</span>
                <span className="font-semibold text-[#16384f]">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-[#5d6167]">
                <span>Pago</span>
                <span className="font-semibold text-[#16384f]">Wompi</span>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
