"use client";

import { useState, useRef, type FormEvent, type ChangeEvent } from "react";

const TIPOS_TALLER = [
  "Mecánica general",
  "Frenos y suspensión",
  "Latonería y pintura",
  "Electricidad automotriz",
  "Transmisiones",
  "Aire acondicionado",
  "Neumáticos y alineación",
  "Vidrios y panorámicos",
  "Diagnóstico computarizado",
  "Otro",
];

const SERVICIOS_OPCIONES = [
  "Frenos", "Motor", "Suspensión", "ABS", "Electricidad",
  "Alarmas", "Diagnóstico", "Latonería", "Pintura", "Detallado",
  "Transmisión", "Caja de cambios", "Diferencial",
  "Aire acondicionado", "Radiador",
  "Neumáticos", "Alineación", "Balanceo",
  "Vidrios", "Parabrisas", "Polarizado",
  "Mantenimiento preventivo", "Cambio de aceite", "Filtros",
];

const CIUDADES = [
  "Bogotá, D.C.", "Medellín", "Cali", "Barranquilla", "Bucaramanga",
  "Manizales", "Pereira", "Cartagena", "Cúcuta", "Ibagué",
  "Santa Marta", "Villavicencio", "Pasto", "Montería", "Otra",
];

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors focus:border-[#ed8435]"
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select
      {...props}
      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors focus:border-[#ed8435]"
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={3}
      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors focus:border-[#ed8435] resize-none"
    />
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-[#38454f]">
      {children}
      {required && <span className="ml-1 text-[#ed8435]">*</span>}
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-base font-bold text-[#16384f]">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function AliadorForm() {
  const [servicios, setServicios] = useState<string[]>([]);
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function toggleServicio(s: string) {
    setServicios((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function handleFoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFoto(file);
    setFotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    servicios.forEach((s) => fd.append("servicios", s));
    if (foto) fd.set("foto", foto);

    try {
      const res = await fetch("/api/aliado", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error al enviar");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
          ✓
        </div>
        <h2 className="mt-4 text-xl font-bold text-[#16384f]">¡Solicitud enviada!</h2>
        <p className="mt-2 text-sm text-gray-500">
          Recibimos tu registro. Nuestro equipo revisará tu taller y te contactará pronto.
        </p>
        <a
          href="/servicio-de-reparacion"
          className="mt-6 inline-block rounded-full bg-[#ed8435] px-8 py-3 text-sm font-bold text-white hover:bg-[#d67024]"
        >
          Volver a Uniparceros
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 1. Datos del taller */}
      <Section title="1. Datos del taller">
        <div>
          <Label required>Nombre del taller</Label>
          <Input name="nombreTaller" placeholder="Ej. Taller Mecánico El Parche" required />
        </div>
        <div>
          <Label required>Tipo de taller</Label>
          <Select name="tipoTaller" required>
            <option value="">Selecciona un tipo</option>
            {TIPOS_TALLER.map((t) => <option key={t}>{t}</option>)}
          </Select>
        </div>
        <div>
          <Label>Descripción breve del taller</Label>
          <Textarea name="descripcion" placeholder="Cuéntanos qué hace especial a tu taller…" />
        </div>
      </Section>

      {/* 2. Servicios */}
      <Section title="2. Servicios que prestas">
        <p className="text-xs text-gray-400">Selecciona todos los que apliquen</p>
        <div className="flex flex-wrap gap-2">
          {SERVICIOS_OPCIONES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleServicio(s)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                servicios.includes(s)
                  ? "border-[#ed8435] bg-[#ed8435] text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-[#ed8435] hover:text-[#ed8435]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {servicios.length === 0 && (
          <p className="text-xs text-amber-500">Selecciona al menos un servicio</p>
        )}
      </Section>

      {/* 3. Ubicación */}
      <Section title="3. Ubicación del taller">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label required>Ciudad</Label>
            <Select name="ciudad" required>
              <option value="">Selecciona</option>
              {CIUDADES.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </div>
          <div>
            <Label>Departamento</Label>
            <Input name="departamento" placeholder="Cundinamarca" />
          </div>
        </div>
        <div>
          <Label required>Dirección</Label>
          <Input name="direccion" placeholder="Cra 30 #15-40, Puente Aranda" required />
        </div>
      </Section>

      {/* 4. Contacto */}
      <Section title="4. Información de contacto">
        <div>
          <Label required>Nombre del responsable</Label>
          <Input name="nombreContacto" placeholder="Juan Pérez" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label required>Teléfono</Label>
            <Input name="telefono" type="tel" placeholder="3001234567" required />
          </div>
          <div>
            <Label>WhatsApp</Label>
            <Input name="whatsapp" type="tel" placeholder="3001234567" />
          </div>
        </div>
        <div>
          <Label>Correo electrónico</Label>
          <Input name="correo" type="email" placeholder="taller@correo.com" />
        </div>
        <div>
          <Label>Horario de atención</Label>
          <Input name="horario" placeholder="Lun–Sáb 8am–6pm" />
        </div>
      </Section>

      {/* 5. Foto */}
      <Section title="5. Foto del taller (opcional)">
        <p className="text-xs text-gray-400">Una buena foto aumenta la confianza de los clientes.</p>
        <div
          onClick={() => fileRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-8 transition-colors hover:border-[#ed8435]"
        >
          {fotoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fotoPreview} alt="Preview" className="max-h-40 rounded-xl object-cover" />
          ) : (
            <>
              <span className="text-3xl">📷</span>
              <p className="mt-2 text-sm text-gray-500">Haz clic para subir una foto</p>
              <p className="text-xs text-gray-400">JPG, PNG · máx. 10 MB</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
      </Section>

      {error && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading || servicios.length === 0}
        className="w-full rounded-2xl bg-[#ed8435] py-4 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Enviando solicitud…" : "Enviar solicitud — Es gratis"}
      </button>
    </form>
  );
}
