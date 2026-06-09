"use client";

import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

type FormFiles = {
  rut: File | null;
  camaraComercio: File | null;
  docRepLegal: File | null;
  certBancaria: File | null;
  logo: File | null;
  catalogo: File | null;
};

const CATEGORIAS = [
  "Espejos retrovisores y soportes",
  "Motores y ventiladores",
  "Luces y direccionales",
  "Sistemas limpiaparabrisas",
  "Línea neumática",
  "Línea inyección y extrusión",
  "Línea mecanizado",
  "Línea cauchos",
  "Adhesivos, lubricantes y sellantes",
  "Línea eléctrica",
];

const TIPOS_EMPRESA = ["Persona natural", "SAS", "LTDA", "SA", "Cooperativa", "Otra"];
const TIPOS_DOC = ["Cédula de ciudadanía", "Pasaporte", "Cédula extranjería"];
const TIPOS_CUENTA = ["Ahorros", "Corriente"];
const BANCOS = [
  "Bancolombia", "Davivienda", "Banco de Bogotá", "BBVA", "Banco Popular",
  "Banco Caja Social", "Colpatria", "Itaú", "Scotiabank Colpatria", "Nequi", "Otro",
];

const STEPS_META: Record<Step, { label: string; title: string }> = {
  1: { label: "Empresa", title: "Datos de la empresa" },
  2: { label: "Representante", title: "Representante legal" },
  3: { label: "Comercial", title: "Información comercial" },
  4: { label: "Documentos", title: "Documentos requeridos" },
  5: { label: "Productos", title: "Información de productos" },
  6: { label: "Pagos", title: "Pagos y facturación" },
  7: { label: "Condiciones", title: "Condiciones del marketplace" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span className="block text-sm font-medium text-[#4f545a]">
      {children}
      {required && <span className="ml-1 text-[#ed8435]">*</span>}
    </span>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={props.rows ?? 3}
      className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435] resize-none"
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select
      {...props}
      className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
    />
  );
}

function Toggle({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-3">
      <div
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-[#ed8435]" : "bg-[#d0d0d0]"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </div>
      <span className="text-sm text-[#4f545a]">{label}</span>
    </label>
  );
}

function FileUpload({
  id,
  label,
  accept,
  file,
  onChange,
  required,
  hint,
}: {
  id: string;
  label: string;
  accept: string;
  file: File | null;
  onChange: (f: File | null) => void;
  required?: boolean;
  hint?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <FieldLabel required={required}>{label}</FieldLabel>
      <div
        onClick={() => ref.current?.click()}
        className={`flex cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
          file ? "border-[#ed8435] bg-[#ed8435]/5" : "border-black/10 bg-[#fafaf9] hover:border-[#ed8435]/50"
        }`}
      >
        <input
          ref={ref}
          id={id}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <div className="flex items-center gap-2 text-sm text-[#16384f]">
            <svg className="h-5 w-5 text-[#ed8435]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{file.name}</span>
            <span className="text-[#777]">({Math.round(file.size / 1024)} KB)</span>
          </div>
        ) : (
          <div className="text-sm text-[#737373]">
            <svg className="mx-auto mb-2 h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="font-medium text-[#16384f]">Haz clic para subir</span>
            <p className="mt-1 text-xs">{hint ?? "PDF, JPG o PNG hasta 10 MB"}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function EmpresaForm() {
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Step 1 — Empresa
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [nit, setNit] = useState("");
  const [tipoEmpresa, setTipoEmpresa] = useState(TIPOS_EMPRESA[0]);
  const [pais, setPais] = useState("Colombia");
  const [ciudad, setCiudad] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefonoEmpresa, setTelefonoEmpresa] = useState("");
  const [correoEmpresa, setCorreoEmpresa] = useState("");
  const [paginaWeb, setPaginaWeb] = useState("");

  // Step 2 — Representante
  const [repNombre, setRepNombre] = useState("");
  const [repTipoDoc, setRepTipoDoc] = useState(TIPOS_DOC[0]);
  const [repNumDoc, setRepNumDoc] = useState("");
  const [repCargo, setRepCargo] = useState("");
  const [repCelular, setRepCelular] = useState("");
  const [repCorreo, setRepCorreo] = useState("");

  // Step 3 — Comercial
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([]);
  const [subcategorias, setSubcategorias] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [anosEnMercado, setAnosEnMercado] = useState("");
  const [vendeOnline, setVendeOnline] = useState(false);
  const [linkTienda, setLinkTienda] = useState("");
  const [operaEn, setOperaEn] = useState("");

  // Step 4 — Documentos
  const [files, setFiles] = useState<FormFiles>({
    rut: null,
    camaraComercio: null,
    docRepLegal: null,
    certBancaria: null,
    logo: null,
    catalogo: null,
  });

  // Step 5 — Productos
  const [cantidadProductos, setCantidadProductos] = useState("");
  const [inventarioPropio, setInventarioPropio] = useState(false);
  const [preciosMayoristas, setPreciosMayoristas] = useState(false);
  const [ofreceGarantia, setOfreceGarantia] = useState(false);
  const [tiempoDespacho, setTiempoDespacho] = useState("");
  const [coberturaEnvios, setCoberturaEnvios] = useState("");

  // Step 6 — Pagos
  const [banco, setBanco] = useState(BANCOS[0]);
  const [tipoCuenta, setTipoCuenta] = useState(TIPOS_CUENTA[0]);
  const [numeroCuenta, setNumeroCuenta] = useState("");
  const [titularCuenta, setTitularCuenta] = useState("");
  const [emiteFactura, setEmiteFactura] = useState(false);
  const [correoFacturacion, setCorreoFacturacion] = useState("");

  // Step 7 — Condiciones
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [aceptaComisiones, setAceptaComisiones] = useState(false);
  const [autorizaDatos, setAutorizaDatos] = useState(false);
  const [autorizaValidacion, setAutorizaValidacion] = useState(false);

  const toggleCategoria = (cat: string) => {
    setCategoriasSeleccionadas((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const handleNext = () => {
    if (step < 7) setStep((s) => (s + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!aceptaTerminos || !aceptaComisiones || !autorizaDatos || !autorizaValidacion) {
      setError("Debes aceptar todas las condiciones para continuar.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const fd = new FormData();

    // Step 1
    fd.append("nombreEmpresa", nombreEmpresa);
    fd.append("razonSocial", razonSocial);
    fd.append("nit", nit);
    fd.append("tipoEmpresa", tipoEmpresa);
    fd.append("pais", pais);
    fd.append("ciudad", ciudad);
    fd.append("direccion", direccion);
    fd.append("telefonoEmpresa", telefonoEmpresa);
    fd.append("correoEmpresa", correoEmpresa);
    if (paginaWeb) fd.append("paginaWeb", paginaWeb);

    // Step 2
    fd.append("repNombre", repNombre);
    fd.append("repTipoDoc", repTipoDoc);
    fd.append("repNumDoc", repNumDoc);
    fd.append("repCargo", repCargo);
    fd.append("repCelular", repCelular);
    fd.append("repCorreo", repCorreo);

    // Step 3
    fd.append("categorias", categoriasSeleccionadas.join(","));
    if (subcategorias) fd.append("subcategorias", subcategorias);
    fd.append("descripcion", descripcion);
    fd.append("anosEnMercado", anosEnMercado);
    fd.append("vendeOnline", String(vendeOnline));
    if (linkTienda) fd.append("linkTienda", linkTienda);
    if (operaEn) fd.append("operaEn", operaEn);

    // Step 4 — files
    if (files.rut) fd.append("rut", files.rut);
    if (files.camaraComercio) fd.append("camaraComercio", files.camaraComercio);
    if (files.docRepLegal) fd.append("docRepLegal", files.docRepLegal);
    if (files.certBancaria) fd.append("certBancaria", files.certBancaria);
    if (files.logo) fd.append("logo", files.logo);
    if (files.catalogo) fd.append("catalogo", files.catalogo);

    // Step 5
    fd.append("cantidadProductos", cantidadProductos);
    fd.append("inventarioPropio", String(inventarioPropio));
    fd.append("preciosMayoristas", String(preciosMayoristas));
    fd.append("ofreceGarantia", String(ofreceGarantia));
    fd.append("tiempoDespacho", tiempoDespacho);
    fd.append("coberturaEnvios", coberturaEnvios);

    // Step 6
    fd.append("banco", banco);
    fd.append("tipoCuenta", tipoCuenta);
    fd.append("numeroCuenta", numeroCuenta);
    fd.append("titularCuenta", titularCuenta);
    fd.append("emiteFactura", String(emiteFactura));
    fd.append("correoFacturacion", correoFacturacion);

    try {
      const res = await fetch("/api/empresa", { method: "POST", body: fd });
      const data = (await res.json()) as { error?: string; message?: string };

      if (!res.ok) {
        setError(data.error ?? "Error enviando la solicitud.");
        setIsSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
      setIsSubmitting(false);
    }
  };

  // ─── Success screen ──────────────────────────────────────────────────────
  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f8f7] px-5">
        <div className="max-w-[540px] rounded-3xl border border-black/8 bg-white p-10 text-center shadow-[0_8px_32px_rgba(15,23,42,0.08)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#16384f]/10">
            <svg className="h-8 w-8 text-[#16384f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-[#16384f]">
            ¡Solicitud enviada!
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#555]">
            Gracias por registrar tu empresa. Nuestro equipo revisará tu información y te contactará para activar tu perfil vendedor.
          </p>
          <p className="mt-2 text-xs text-[#777]">
            Revisaremos tu solicitud en un plazo de 2 a 5 días hábiles.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[#16384f] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0f2a3b]"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  const totalSteps = 7;
  const progress = ((step - 1) / (totalSteps - 1)) * 100;

  return (
    <main className="min-h-screen bg-[#f8f8f7] text-[#16384f]">
      {/* Header */}
      <section className="bg-[#16384f] px-5 pb-20 pt-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[860px]">
          <Link href="/vender" className="mb-6 inline-flex items-center gap-1 text-sm text-white/70 hover:text-white">
            <span>‹</span> Volver
          </Link>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-white/60">
            Registro de empresa
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
            {STEPS_META[step].title}
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Paso {step} de {totalSteps}
          </p>
        </div>
      </section>

      {/* Progress + stepper */}
      <div className="sticky top-0 z-20 bg-white border-b border-black/8 px-5 py-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="mx-auto max-w-[860px]">
          {/* Steps pills (desktop) */}
          <div className="hidden sm:flex items-center gap-1 overflow-x-auto">
            {(Object.keys(STEPS_META).map(Number) as Step[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => s < step && setStep(s)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  s === step
                    ? "bg-[#16384f] text-white"
                    : s < step
                      ? "bg-[#ed8435]/15 text-[#ed8435] cursor-pointer hover:bg-[#ed8435]/25"
                      : "bg-black/5 text-[#999] cursor-default"
                }`}
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                  s === step ? "bg-white text-[#16384f]" : s < step ? "bg-[#ed8435] text-white" : "bg-[#ccc] text-white"
                }`}>
                  {s < step ? "✓" : s}
                </span>
                {STEPS_META[s].label}
              </button>
            ))}
          </div>
          {/* Progress bar (mobile) */}
          <div className="sm:hidden">
            <div className="flex justify-between text-xs text-[#777] mb-1">
              <span>{STEPS_META[step].label}</span>
              <span>{step}/{totalSteps}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-black/10">
              <div
                className="h-full rounded-full bg-[#ed8435] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form body */}
      <div className="-mt-8 px-5 pb-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[860px]">
          <div className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.06)] md:p-10">

            {/* ── STEP 1: Datos de la empresa ─────────────────────────── */}
            {step === 1 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2 sm:col-span-2">
                  <FieldLabel required>Nombre de la empresa</FieldLabel>
                  <Input value={nombreEmpresa} onChange={(e) => setNombreEmpresa(e.target.value)} placeholder="Ej. Repuestos del Norte S.A.S." />
                </label>
                <label className="space-y-2">
                  <FieldLabel required>Razón social</FieldLabel>
                  <Input value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)} placeholder="Razón social oficial" />
                </label>
                <label className="space-y-2">
                  <FieldLabel required>NIT / RUT</FieldLabel>
                  <Input value={nit} onChange={(e) => setNit(e.target.value)} placeholder="900.123.456-7" />
                </label>
                <label className="space-y-2">
                  <FieldLabel required>Tipo de empresa</FieldLabel>
                  <Select value={tipoEmpresa} onChange={(e) => setTipoEmpresa(e.target.value)}>
                    {TIPOS_EMPRESA.map((t) => <option key={t}>{t}</option>)}
                  </Select>
                </label>
                <label className="space-y-2">
                  <FieldLabel required>País</FieldLabel>
                  <Input value={pais} onChange={(e) => setPais(e.target.value)} placeholder="Colombia" />
                </label>
                <label className="space-y-2">
                  <FieldLabel required>Ciudad</FieldLabel>
                  <Input value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Bogotá" />
                </label>
                <label className="space-y-2 sm:col-span-2">
                  <FieldLabel required>Dirección comercial</FieldLabel>
                  <Input value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Cra 15 # 80-45, Bogotá" />
                </label>
                <label className="space-y-2">
                  <FieldLabel required>Teléfono</FieldLabel>
                  <Input type="tel" value={telefonoEmpresa} onChange={(e) => setTelefonoEmpresa(e.target.value)} placeholder="+57 601 234 5678" />
                </label>
                <label className="space-y-2">
                  <FieldLabel required>Correo corporativo</FieldLabel>
                  <Input type="email" value={correoEmpresa} onChange={(e) => setCorreoEmpresa(e.target.value)} placeholder="ventas@empresa.com" />
                </label>
                <label className="space-y-2 sm:col-span-2">
                  <FieldLabel>Página web o redes sociales</FieldLabel>
                  <Input value={paginaWeb} onChange={(e) => setPaginaWeb(e.target.value)} placeholder="https://www.empresa.com o @empresa_ig" />
                </label>
              </div>
            )}

            {/* ── STEP 2: Representante legal ─────────────────────────── */}
            {step === 2 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2 sm:col-span-2">
                  <FieldLabel required>Nombre completo</FieldLabel>
                  <Input value={repNombre} onChange={(e) => setRepNombre(e.target.value)} placeholder="Juan Carlos Pérez Gómez" />
                </label>
                <label className="space-y-2">
                  <FieldLabel required>Tipo de documento</FieldLabel>
                  <Select value={repTipoDoc} onChange={(e) => setRepTipoDoc(e.target.value)}>
                    {TIPOS_DOC.map((t) => <option key={t}>{t}</option>)}
                  </Select>
                </label>
                <label className="space-y-2">
                  <FieldLabel required>Número de documento</FieldLabel>
                  <Input value={repNumDoc} onChange={(e) => setRepNumDoc(e.target.value)} placeholder="1.234.567.890" />
                </label>
                <label className="space-y-2">
                  <FieldLabel required>Cargo</FieldLabel>
                  <Input value={repCargo} onChange={(e) => setRepCargo(e.target.value)} placeholder="Gerente General" />
                </label>
                <label className="space-y-2">
                  <FieldLabel required>Celular</FieldLabel>
                  <Input type="tel" value={repCelular} onChange={(e) => setRepCelular(e.target.value)} placeholder="+57 300 123 4567" />
                </label>
                <label className="space-y-2 sm:col-span-2">
                  <FieldLabel required>Correo electrónico</FieldLabel>
                  <Input type="email" value={repCorreo} onChange={(e) => setRepCorreo(e.target.value)} placeholder="juan.perez@empresa.com" />
                </label>
              </div>
            )}

            {/* ── STEP 3: Información comercial ───────────────────────── */}
            {step === 3 && (
              <div className="grid gap-6">
                <div className="space-y-3">
                  <FieldLabel>Categoría principal de productos</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIAS.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategoria(cat)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          categoriasSeleccionadas.includes(cat)
                            ? "border-[#ed8435] bg-[#ed8435] text-white"
                            : "border-black/15 bg-white text-[#4f545a] hover:border-[#ed8435]/50"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="space-y-2">
                  <FieldLabel>Subcategorías</FieldLabel>
                  <Input value={subcategorias} onChange={(e) => setSubcategorias(e.target.value)} placeholder="Ej. Faros, luces LED, stop..." />
                </label>
                <label className="space-y-2">
                  <FieldLabel required>Descripción de la empresa</FieldLabel>
                  <Textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={4} placeholder="Cuéntanos qué hace tu empresa, qué productos ofrece y qué te diferencia..." />
                </label>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="space-y-2">
                    <FieldLabel required>Años en el mercado</FieldLabel>
                    <Input type="number" min="0" value={anosEnMercado} onChange={(e) => setAnosEnMercado(e.target.value)} placeholder="5" />
                  </label>
                  <label className="space-y-2">
                    <FieldLabel>Países / ciudades donde opera</FieldLabel>
                    <Input value={operaEn} onChange={(e) => setOperaEn(e.target.value)} placeholder="Colombia, Ecuador, Perú..." />
                  </label>
                </div>
                <div className="space-y-3">
                  <Toggle id="vendeOnline" checked={vendeOnline} onChange={setVendeOnline} label="¿Vende actualmente online?" />
                  {vendeOnline && (
                    <label className="space-y-2">
                      <FieldLabel>Link de tienda actual</FieldLabel>
                      <Input value={linkTienda} onChange={(e) => setLinkTienda(e.target.value)} placeholder="https://tu-tienda.com" />
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* ── STEP 4: Documentos ──────────────────────────────────── */}
            {step === 4 && (
              <div className="grid gap-6 sm:grid-cols-2">
                <FileUpload
                  id="rut"
                  label="RUT"
                  accept=".pdf,.jpg,.jpeg,.png"
                  file={files.rut}
                  onChange={(f) => setFiles((p) => ({ ...p, rut: f }))}
                  required
                  hint="PDF o imagen hasta 10 MB"
                />
                <FileUpload
                  id="camaraComercio"
                  label="Cámara de comercio"
                  accept=".pdf,.jpg,.jpeg,.png"
                  file={files.camaraComercio}
                  onChange={(f) => setFiles((p) => ({ ...p, camaraComercio: f }))}
                  required
                  hint="Vigente, máximo 90 días"
                />
                <FileUpload
                  id="docRepLegal"
                  label="Documento del representante legal"
                  accept=".pdf,.jpg,.jpeg,.png"
                  file={files.docRepLegal}
                  onChange={(f) => setFiles((p) => ({ ...p, docRepLegal: f }))}
                  required
                  hint="Cédula o pasaporte"
                />
                <FileUpload
                  id="certBancaria"
                  label="Certificación bancaria"
                  accept=".pdf,.jpg,.jpeg,.png"
                  file={files.certBancaria}
                  onChange={(f) => setFiles((p) => ({ ...p, certBancaria: f }))}
                  required
                  hint="No mayor a 30 días"
                />
                <FileUpload
                  id="logo"
                  label="Logo de la empresa"
                  accept=".jpg,.jpeg,.png,.svg,.webp"
                  file={files.logo}
                  onChange={(f) => setFiles((p) => ({ ...p, logo: f }))}
                  hint="JPG, PNG o SVG — fondo transparente ideal"
                />
                <FileUpload
                  id="catalogo"
                  label="Catálogo de productos (opcional)"
                  accept=".pdf"
                  file={files.catalogo}
                  onChange={(f) => setFiles((p) => ({ ...p, catalogo: f }))}
                  hint="PDF hasta 10 MB"
                />
              </div>
            )}

            {/* ── STEP 5: Información de productos ───────────────────── */}
            {step === 5 && (
              <div className="grid gap-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="space-y-2">
                    <FieldLabel required>Cantidad aproximada de productos</FieldLabel>
                    <Select value={cantidadProductos} onChange={(e) => setCantidadProductos(e.target.value)}>
                      <option value="">Selecciona</option>
                      {["1–50", "51–200", "201–500", "501–1000", "Más de 1000"].map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </Select>
                  </label>
                  <label className="space-y-2">
                    <FieldLabel required>Tiempo promedio de despacho</FieldLabel>
                    <Select value={tiempoDespacho} onChange={(e) => setTiempoDespacho(e.target.value)}>
                      <option value="">Selecciona</option>
                      {["Mismo día", "1–2 días hábiles", "3–5 días hábiles", "5–10 días hábiles", "Más de 10 días"].map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </Select>
                  </label>
                  <label className="space-y-2 sm:col-span-2">
                    <FieldLabel required>Cobertura de envíos</FieldLabel>
                    <Input value={coberturaEnvios} onChange={(e) => setCoberturaEnvios(e.target.value)} placeholder="Ej. Nacional, solo Bogotá, Medellín y Cali..." />
                  </label>
                </div>
                <div className="grid gap-4 rounded-2xl border border-black/8 bg-[#fafaf9] p-5">
                  <p className="text-sm font-semibold text-[#16384f]">Características adicionales</p>
                  <Toggle id="inventarioPropio" checked={inventarioPropio} onChange={setInventarioPropio} label="¿Tiene inventario propio?" />
                  <Toggle id="preciosMayoristas" checked={preciosMayoristas} onChange={setPreciosMayoristas} label="¿Maneja precios mayoristas?" />
                  <Toggle id="ofreceGarantia" checked={ofreceGarantia} onChange={setOfreceGarantia} label="¿Ofrece garantía en sus productos?" />
                </div>
              </div>
            )}

            {/* ── STEP 6: Pagos y facturación ─────────────────────────── */}
            {step === 6 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2">
                  <FieldLabel required>Banco</FieldLabel>
                  <Select value={banco} onChange={(e) => setBanco(e.target.value)}>
                    {BANCOS.map((b) => <option key={b}>{b}</option>)}
                  </Select>
                </label>
                <label className="space-y-2">
                  <FieldLabel required>Tipo de cuenta</FieldLabel>
                  <Select value={tipoCuenta} onChange={(e) => setTipoCuenta(e.target.value)}>
                    {TIPOS_CUENTA.map((t) => <option key={t}>{t}</option>)}
                  </Select>
                </label>
                <label className="space-y-2">
                  <FieldLabel required>Número de cuenta</FieldLabel>
                  <Input value={numeroCuenta} onChange={(e) => setNumeroCuenta(e.target.value)} placeholder="123456789012" />
                </label>
                <label className="space-y-2">
                  <FieldLabel required>Titular de la cuenta</FieldLabel>
                  <Input value={titularCuenta} onChange={(e) => setTitularCuenta(e.target.value)} placeholder="Nombre como aparece en el banco" />
                </label>
                <label className="space-y-2 sm:col-span-2">
                  <FieldLabel required>Correo para facturación</FieldLabel>
                  <Input type="email" value={correoFacturacion} onChange={(e) => setCorreoFacturacion(e.target.value)} placeholder="facturacion@empresa.com" />
                </label>
                <div className="sm:col-span-2 rounded-2xl border border-black/8 bg-[#fafaf9] p-5">
                  <Toggle id="emiteFactura" checked={emiteFactura} onChange={setEmiteFactura} label="¿Emite factura electrónica?" />
                </div>
              </div>
            )}

            {/* ── STEP 7: Condiciones ──────────────────────────────────── */}
            {step === 7 && (
              <div className="space-y-4">
                <p className="text-sm leading-6 text-[#555]">
                  Para activar tu perfil vendedor en Totalpars debes aceptar las siguientes condiciones:
                </p>
                {[
                  {
                    id: "aceptaTerminos",
                    val: aceptaTerminos,
                    set: setAceptaTerminos,
                    label: "Acepto los Términos y Condiciones Generales de Totalpars",
                    desc: "He leído y acepto los Términos y Condiciones de Totalpars. Entiendo que la plataforma actúa como intermediaria entre compradores y vendedores del sector automotriz. Me comprometo a publicar información veraz, cumplir con las obligaciones de calidad, legalidad, garantías y disponibilidad de los productos, y respetar las conductas establecidas en la plataforma. Acepto que Totalpars podrá suspender o cancelar mi cuenta ante fraude, incumplimientos o reclamaciones reiteradas.",
                  },
                  {
                    id: "aceptaComisiones",
                    val: aceptaComisiones,
                    set: setAceptaComisiones,
                    label: "💰 Acepto la Política de Pagos y Comisiones del Marketplace",
                    desc: "Entiendo y acepto que Totalpars cobrará una comisión del 14% sobre el valor total de cada venta realizada a través de la plataforma. La comisión será descontada automáticamente antes de la transferencia de fondos al vendedor o facturada según el modelo operativo implementado. Acepto que podrán aplicarse retenciones legales e impuestos según la normatividad colombiana vigente.",
                  },
                  {
                    id: "autorizaDatos",
                    val: autorizaDatos,
                    set: setAutorizaDatos,
                    label: "🔒 Autorizo el Tratamiento de Datos Personales y Empresariales",
                    desc: "Autorizo libre y expresamente a Totalpars para recolectar, almacenar, procesar y utilizar mis datos personales y empresariales con fines de creación de cuenta, validación documental, prevención de fraude, gestión de pagos y comunicaciones comerciales autorizadas. Totalpars protegerá la información conforme a la legislación colombiana de protección de datos. Los titulares podrán ejercer derechos de consulta, actualización y supresión en cualquier momento.",
                  },
                  {
                    id: "autorizaValidacion",
                    val: autorizaValidacion,
                    set: setAutorizaValidacion,
                    label: "📄 Autorizo la Validación Documental y Política Antifraude",
                    desc: "Autorizo a Totalpars para verificar la autenticidad, vigencia y validez de los documentos suministrados: documento de identidad, RUT, cámara de comercio, certificados bancarios y demás soportes requeridos. Entiendo que la activación de mi perfil vendedor está sujeta al resultado satisfactorio de estas verificaciones, y que Totalpars podrá solicitar documentación adicional o suspender operaciones sospechosas para proteger la plataforma.",
                  },
                  {
                    id: "aceptaResponsabilidad",
                    val: aceptaTerminos && aceptaComisiones && autorizaDatos && autorizaValidacion,
                    set: () => {},
                    label: "☑️ Declaro responsabilidad sobre mis productos, garantías y devoluciones",
                    desc: "Declaro que los productos y servicios ofrecidos cumplen con la normativa colombiana vigente, que poseo los derechos sobre el contenido publicado y que soy el único responsable de las garantías, devoluciones, entregas y atención al cliente derivadas de mis ventas. Me comprometo a mantener inventarios actualizados, cumplir obligaciones tributarias y responder ante reclamaciones de mis compradores.",
                    readonly: true,
                  },
                ].map(({ id, val, set, label, desc, readonly }) => (
                  <label key={id} htmlFor={id} className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-colors ${val ? "border-[#ed8435]/50 bg-orange-50/40" : "border-black/8 bg-[#fafaf9] hover:border-[#ed8435]/30"}`}>
                    <input
                      id={id}
                      type="checkbox"
                      checked={val}
                      onChange={(e) => !readonly && set(e.target.checked)}
                      readOnly={readonly}
                      className="mt-1 h-5 w-5 shrink-0 accent-[#ed8435] rounded"
                    />
                    <div className="space-y-1.5">
                      <p className="text-sm font-semibold leading-5 text-[#1f2328]">{label}</p>
                      <p className="text-xs leading-5 text-[#6e7379]">{desc}</p>
                    </div>
                  </label>
                ))}

                {error && (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                    {error}
                  </p>
                )}
              </div>
            )}

          </div>

          {/* Navigation buttons */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleBack}
              className={`rounded-full border border-black/15 bg-white px-7 py-3 text-sm font-semibold text-[#16384f] transition-colors hover:bg-[#16384f]/5 ${step === 1 ? "invisible" : ""}`}
            >
              ← Anterior
            </button>

            {step < 7 ? (
              <button
                type="button"
                onClick={handleNext}
                className="rounded-full bg-[#16384f] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0f2a3b]"
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-full bg-[#ed8435] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d67024] disabled:opacity-60"
              >
                {isSubmitting ? "Enviando..." : "Enviar solicitud de inscripción"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
