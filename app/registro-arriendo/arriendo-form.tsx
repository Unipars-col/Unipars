"use client";

import { useState, type FormEvent } from "react";

const TIPOS_VEHICULO = ["Bus urbano", "Bus intermunicipal", "Buseta", "Camión de carga", "Camioneta", "Minibús", "Vehículo de pasajeros", "Otro"];
const CIUDADES = ["Bogotá, D.C.", "Medellín", "Cali", "Barranquilla", "Bucaramanga", "Manizales", "Pereira", "Cartagena", "Cúcuta", "Ibagué", "Santa Marta", "Villavicencio", "Pasto", "Montería", "Otra"];

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors focus:border-[#ed8435]" />;
}
function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return <select {...props} className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors focus:border-[#ed8435]" />;
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} rows={3} className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors focus:border-[#ed8435] resize-none" />;
}
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return <label className="mb-1.5 block text-sm font-medium text-[#38454f]">{children}{required && <span className="ml-1 text-[#ed8435]">*</span>}</label>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-2xl bg-white p-6 shadow-sm"><h2 className="mb-5 text-base font-bold text-[#16384f]">{title}</h2><div className="space-y-4">{children}</div></div>;
}

export default function ArriendoForm() {
  const [tipos, setTipos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTipo = (t: string) => setTipos(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const data = {
      nombreEmpresa: fd.get("nombreEmpresa"),
      tiposVehiculo: tipos,
      cantidad: fd.get("cantidad"),
      descripcion: fd.get("descripcion"),
      ciudad: fd.get("ciudad"),
      departamento: fd.get("departamento"),
      cobertura: fd.get("cobertura"),
      nombreContacto: fd.get("nombreContacto"),
      telefono: fd.get("telefono"),
      whatsapp: fd.get("whatsapp"),
      correo: fd.get("correo"),
      disponibilidad: fd.get("disponibilidad"),
    };
    try {
      const res = await fetch("/api/arriendo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
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
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">✓</div>
        <h2 className="mt-4 text-xl font-bold text-[#16384f]">¡Solicitud enviada!</h2>
        <p className="mt-2 text-sm text-gray-500">Recibimos tu registro de flota. Nuestro equipo te contactará pronto.</p>
        <a href="/servicio-de-reparacion" className="mt-6 inline-block rounded-full bg-[#ed8435] px-8 py-3 text-sm font-bold text-white hover:bg-[#d67024]">
          Volver a Servicios
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Section title="1. Datos de la empresa o propietario">
        <div><Label required>Nombre de la empresa o propietario</Label><Input name="nombreEmpresa" placeholder="Ej. Transportes El Rápido S.A.S." required /></div>
        <div><Label>Descripción de la flota</Label><Textarea name="descripcion" placeholder="Cuéntanos sobre tu flota..." /></div>
        <div><Label>Cantidad de vehículos disponibles</Label><Input name="cantidad" type="number" min="1" placeholder="Ej. 5" /></div>
      </Section>

      <Section title="2. Tipos de vehículos">
        <p className="text-xs text-gray-400">Selecciona todos los que apliquen</p>
        <div className="flex flex-wrap gap-2">
          {TIPOS_VEHICULO.map(t => (
            <button key={t} type="button" onClick={() => toggleTipo(t)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${tipos.includes(t) ? "border-[#16a34a] bg-[#16a34a] text-white" : "border-gray-200 bg-white text-gray-600 hover:border-[#16a34a] hover:text-[#16a34a]"}`}>
              {t}
            </button>
          ))}
        </div>
      </Section>

      <Section title="3. Cobertura geográfica">
        <div className="grid grid-cols-2 gap-3">
          <div><Label required>Ciudad principal</Label>
            <Select name="ciudad" required><option value="">Selecciona</option>{CIUDADES.map(c => <option key={c}>{c}</option>)}</Select>
          </div>
          <div><Label>Departamento</Label><Input name="departamento" placeholder="Cundinamarca" /></div>
        </div>
        <div><Label>Cobertura adicional</Label><Input name="cobertura" placeholder="Ej. Costa Atlántica, Eje Cafetero..." /></div>
      </Section>

      <Section title="4. Información de contacto">
        <div><Label required>Nombre del responsable</Label><Input name="nombreContacto" placeholder="Juan Pérez" required /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label required>Teléfono</Label><Input name="telefono" type="tel" placeholder="3001234567" required /></div>
          <div><Label>WhatsApp</Label><Input name="whatsapp" type="tel" placeholder="3001234567" /></div>
        </div>
        <div><Label>Correo electrónico</Label><Input name="correo" type="email" placeholder="empresa@correo.com" /></div>
        <div><Label>Disponibilidad</Label><Input name="disponibilidad" placeholder="Ej. Inmediata, desde julio..." /></div>
      </Section>

      {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <button type="submit" disabled={loading}
        className="w-full rounded-2xl bg-[#16a34a] py-4 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? "Enviando solicitud…" : "Enviar solicitud — Es gratis"}
      </button>
    </form>
  );
}
