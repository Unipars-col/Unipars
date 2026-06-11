"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { departamentosColombia, getCitiesForDepartment } from "@/lib/colombia-locations";

type Role = "CUSTOMER" | "SELLER";

type RegisterFormState = {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  department: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  password: string;
  confirmPassword: string;
};

type ToastState = { tone: "success" | "error"; message: string } | null;

const initialState: RegisterFormState = {
  fullName: "", company: "", email: "", phone: "",
  department: "", city: "", addressLine1: "", addressLine2: "",
  password: "", confirmPassword: "",
};

function RoleSelector({ onSelect }: { onSelect: (role: Role) => void }) {
  return (
    <main className="flex min-h-[calc(100vh-88px)] items-center justify-center bg-[#f5f5f5] px-6 py-16">
      <div className="w-full max-w-2xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ed8435]">Totalpars</p>
          <h1 className="mt-2 text-3xl font-bold text-[#16384f] md:text-4xl">Crear cuenta</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">¿Cómo quieres usar Totalpars?</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Cliente */}
          <button
            onClick={() => onSelect("CUSTOMER")}
            className="group flex flex-col items-start gap-4 rounded-[1.5rem] border-2 border-slate-200 bg-white p-7 text-left shadow-sm transition-all duration-200 hover:border-[#ed8435] hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff6ee] text-[#ed8435]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#ed8435]">Comprador</p>
              <h2 className="mt-1 text-xl font-bold text-[#16384f]">Registrarme como cliente</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Busca repuestos, compara precios y gestiona tus pedidos desde un solo lugar.
              </p>
            </div>
            <span className="mt-auto flex items-center gap-1 text-sm font-semibold text-[#ed8435] group-hover:underline">
              Continuar como cliente
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </span>
          </button>

          {/* Proveedor */}
          <button
            onClick={() => onSelect("SELLER")}
            className="group flex flex-col items-start gap-4 rounded-[1.5rem] border-2 border-slate-200 bg-white p-7 text-left shadow-sm transition-all duration-200 hover:border-[#16384f] hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef4f8] text-[#16384f]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#16384f]">Vendedor</p>
              <h2 className="mt-1 text-xl font-bold text-[#16384f]">Registrarme como proveedor</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Publica tu catálogo de repuestos y conecta con talleres y transportistas de toda Colombia.
              </p>
            </div>
            <span className="mt-auto flex items-center gap-1 text-sm font-semibold text-[#16384f] group-hover:underline">
              Continuar como proveedor
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </span>
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-slate-600">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="font-semibold text-[#16384f] transition-colors hover:text-[#ed8435]">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function RegistroPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);

  const handleRoleSelect = (selected: Role) => {
    if (selected === "SELLER") {
      router.push("/registro-empresa");
      return;
    }
    setRole(selected);
  };
  const [form, setForm] = useState<RegisterFormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [inlineError, setInlineError] = useState("");

  const cityOptions = useMemo(() => getCitiesForDepartment(form.department), [form.department]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = event.target;
    setForm((current) => id === "department" ? { ...current, department: value, city: "" } : { ...current, [id]: value });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInlineError("");
    setToast(null);

    if (form.password !== form.confirmPassword) {
      const message = "Las contraseñas no coinciden.";
      setInlineError(message);
      setToast({ tone: "error", message });
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, role }),
    });

    const payload = await response.json() as { error?: string; message?: string };
    setIsSubmitting(false);

    if (!response.ok) {
      const message = payload.error || "No fue posible crear la cuenta.";
      setInlineError(message);
      setToast({ tone: "error", message });
      return;
    }

    setForm(initialState);
    setInlineError("");
    setToast({ tone: "success", message: payload.message || "Cuenta creada correctamente." });
  };

  if (!role) return <RoleSelector onSelect={handleRoleSelect} />;

  const isClient = role === "CUSTOMER";
  const accentColor = isClient ? "#ed8435" : "#16384f";
  const accentBg = isClient ? "bg-[#ed8435] hover:bg-[#d67024]" : "bg-[#16384f] hover:bg-[#0f2a3d]";
  const focusBorder = isClient ? "focus:border-[#ed8435]" : "focus:border-[#16384f]";

  return (
    <main className="flex min-h-[calc(100vh-88px)] items-center justify-center bg-[#f5f5f5] px-6 py-16">
      {toast && (
        <div className="fixed right-5 top-5 z-[80] w-[min(92vw,380px)]">
          <div className={`rounded-[1.4rem] border px-5 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.16)] backdrop-blur-sm ${toast.tone === "success" ? "border-[#1f8b45]/18 bg-[#effaf2] text-[#1f6b39]" : "border-[#ed8435]/18 bg-[#fff6ee] text-[#b85d12]"}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em]">{toast.tone === "success" ? "Correcto" : "Atención"}</p>
                <p className="mt-2 text-sm font-medium leading-6">{toast.message}</p>
              </div>
              <button type="button" onClick={() => setToast(null)} className="text-lg leading-none opacity-60 hover:opacity-100">×</button>
            </div>
          </div>
        </div>
      )}

      <section className="w-full max-w-2xl rounded-[2rem] bg-white p-8 shadow-lg shadow-black/10 md:p-10">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setRole(null)}
            className="text-sm font-semibold uppercase tracking-wide text-[#16384f] transition-colors hover:text-[#ed8435]"
          >
            ← Volver
          </button>
          <span className="text-slate-300">|</span>
          <Link href="/" className="text-sm font-semibold uppercase tracking-wide text-[#16384f] transition-colors hover:text-[#ed8435]">
            Inicio
          </Link>
        </div>

        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: accentColor }}>
            {isClient ? "Cuenta cliente" : "Cuenta proveedor"}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#16384f] md:text-4xl">Crear cuenta</h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
            {isClient
              ? "Regístrate para guardar pedidos, explorar categorías y comprar con una experiencia más ágil."
              : "Registra tu negocio para publicar tu catálogo y conectar con clientes en toda Colombia."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-slate-700">Nombre completo</label>
            <input id="fullName" type="text" value={form.fullName} onChange={handleChange} placeholder="Tu nombre" required className={`w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors ${focusBorder}`} />
          </div>

          <div>
            <label htmlFor="company" className="mb-2 block text-sm font-medium text-slate-700">{isClient ? "Empresa o taller" : "Nombre del negocio"}</label>
            <input id="company" type="text" value={form.company} onChange={handleChange} placeholder={isClient ? "Nombre de tu negocio" : "Tu empresa o almacén"} className={`w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors ${focusBorder}`} />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Correo electrónico</label>
            <input id="email" type="email" value={form.email} onChange={handleChange} placeholder="tu@correo.com" required className={`w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors ${focusBorder}`} />
          </div>

          <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-700">Teléfono</label>
            <input id="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="Tu número" className={`w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors ${focusBorder}`} />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">Contraseña</label>
            <input id="password" type="password" value={form.password} onChange={handleChange} placeholder="Mínimo 8 caracteres" required className={`w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors ${focusBorder}`} />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-700">Confirmar contraseña</label>
            <input id="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Repite tu contraseña" required className={`w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors ${focusBorder}`} />
          </div>

          <div>
            <label htmlFor="department" className="mb-2 block text-sm font-medium text-slate-700">Departamento</label>
            <select id="department" value={form.department} onChange={handleChange} required className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition-colors ${focusBorder}`}>
              <option value="">Selecciona un departamento</option>
              {departamentosColombia.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="city" className="mb-2 block text-sm font-medium text-slate-700">Ciudad</label>
            <input id="city" type="text" value={form.city} onChange={handleChange} list="registro-cities" placeholder={form.department ? "Busca o escribe tu ciudad" : "Primero selecciona un departamento"} required disabled={!form.department} className={`w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors ${focusBorder}`} />
            <datalist id="registro-cities">{cityOptions.map((c) => <option key={c} value={c} />)}</datalist>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="addressLine1" className="mb-2 block text-sm font-medium text-slate-700">Dirección principal</label>
            <input id="addressLine1" type="text" value={form.addressLine1} onChange={handleChange} placeholder="Calle, carrera, barrio o punto de entrega" required className={`w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors ${focusBorder}`} />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="addressLine2" className="mb-2 block text-sm font-medium text-slate-700">Complemento de dirección</label>
            <input id="addressLine2" type="text" value={form.addressLine2} onChange={handleChange} placeholder="Apto, interior, piso, bodega..." className={`w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors ${focusBorder}`} />
          </div>

          {inlineError && (
            <p className="rounded-xl border border-[#ed8435]/20 bg-[#fff6ee] px-4 py-3 text-sm font-medium text-[#b85d12] md:col-span-2">{inlineError}</p>
          )}

          <div className="md:col-span-2">
            <button type="submit" disabled={isSubmitting} className={`w-full rounded-xl px-4 py-3 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${accentBg}`}>
              {isSubmitting ? "Creando cuenta..." : `Crear cuenta ${isClient ? "cliente" : "proveedor"}`}
            </button>
          </div>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="font-semibold text-[#16384f] transition-colors hover:text-[#ed8435]">Inicia sesión</Link>
        </p>
      </section>
    </main>
  );
}
