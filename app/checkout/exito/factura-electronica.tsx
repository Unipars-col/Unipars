"use client";

import { useState } from "react";

// ⚠️ Cambia este número por el WhatsApp de soporte de Totalpars (formato internacional sin + ni espacios)
const WHATSAPP_SOPORTE = "573001234567";

export default function FacturaElectronica({ pedido }: { pedido?: string }) {
  const [open, setOpen] = useState(false);
  const [nit, setNit] = useState("");
  const [nombre, setNombre] = useState("");

  const mensaje = encodeURIComponent(
    `Hola Totalpars! Acabo de realizar el pedido *${pedido ?? "reciente"}* y necesito factura electrónica.\n\n` +
    `• Nombre / Razón social: ${nombre || "[Tu nombre o empresa]"}\n` +
    `• NIT / Cédula: ${nit || "[Tu NIT]"}\n\n` +
    `¿Me pueden ayudar con la factura? Gracias.`,
  );

  const whatsappUrl = `https://wa.me/${WHATSAPP_SOPORTE}?text=${mensaje}`;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-[1.2rem] border border-[#25d366]/30 bg-[#25d366]/8 px-5 py-3 text-sm font-semibold text-[#128c3e] transition-colors hover:bg-[#25d366]/15"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.122 1.524 5.855L.057 23.882l6.17-1.617A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.793 9.793 0 01-5.017-1.378l-.36-.213-3.721.976 1-3.623-.234-.374A9.785 9.785 0 012.182 12c0-5.412 4.406-9.818 9.818-9.818 5.412 0 9.818 4.406 9.818 9.818 0 5.412-4.406 9.818-9.818 9.818z"/>
        </svg>
        ¿Necesitas factura electrónica?
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-[1.4rem] border border-[#25d366]/25 bg-[#f0fdf4] p-5 text-left">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-[#128c3e]">Solicitar factura electrónica</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-slate-400 hover:text-slate-600 text-lg leading-none"
        >
          ×
        </button>
      </div>

      <p className="mb-4 text-xs leading-5 text-slate-500">
        Completa tus datos y te contactaremos por WhatsApp para coordinar la factura con el proveedor.
      </p>

      <div className="grid gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Nombre o razón social
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre o empresa"
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#25d366]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            NIT o cédula <span className="text-[#ed8435]">*</span>
          </label>
          <input
            type="text"
            value={nit}
            onChange={(e) => setNit(e.target.value)}
            placeholder="Ej. 900.123.456-7"
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#25d366]"
          />
        </div>
      </div>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-4 flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-colors ${
          nit.trim()
            ? "bg-[#25d366] hover:bg-[#1fbb58]"
            : "pointer-events-none bg-[#a0d6b0] cursor-not-allowed"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.122 1.524 5.855L.057 23.882l6.17-1.617A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.793 9.793 0 01-5.017-1.378l-.36-.213-3.721.976 1-3.623-.234-.374A9.785 9.785 0 012.182 12c0-5.412 4.406-9.818 9.818-9.818 5.412 0 9.818 4.406 9.818 9.818 0 5.412-4.406 9.818-9.818 9.818z"/>
        </svg>
        Enviar solicitud por WhatsApp
      </a>

      <p className="mt-3 text-center text-xs text-slate-400">
        Se abrirá WhatsApp con el mensaje prellenado
      </p>
    </div>
  );
}
