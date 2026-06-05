"use client";

import { useState } from "react";

const OPCIONES = [
  "Voz a voz",
  "Redes sociales",
  "Google",
  "Publicidad",
  "Me lo recomendaron",
  "Otro",
];

export default function EncuestaReferido({ orderId }: { orderId?: string }) {
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function enviar() {
    if (!seleccion) return;
    setCargando(true);
    try {
      await fetch("/api/encuesta-referido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opcion: seleccion, orderId }),
      });
    } finally {
      setCargando(false);
      setEnviado(true);
    }
  }

  if (enviado) {
    return (
      <div className="mt-8 rounded-[1.4rem] bg-[#16384f] px-6 py-6 text-center">
        <p className="text-lg font-bold text-white">¡Gracias por contarnos!</p>
        <p className="mt-1 text-sm text-white/50">Tu opinión nos ayuda a crecer.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-[1.4rem] bg-[#0d1b2a] px-6 py-8">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-white/30">
        Una pregunta rápida
      </p>
      <p className="mt-2 text-center text-lg font-bold text-white">
        ¿Cómo te enteraste de nosotros?
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2.5">
        {OPCIONES.map((op) => (
          <button
            key={op}
            type="button"
            onClick={() => setSeleccion(op)}
            className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
              seleccion === op
                ? "border-[#ed8435] bg-[#ed8435] text-white shadow-[0_4px_20px_rgba(237,132,53,0.4)]"
                : "border-white/15 bg-white/5 text-white/70 hover:border-white/40 hover:text-white"
            }`}
          >
            {op}
          </button>
        ))}
      </div>

      {seleccion && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={enviar}
            disabled={cargando}
            className="rounded-full bg-[#ed8435] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(237,132,53,0.35)] transition-all hover:bg-[#d67024] hover:shadow-[0_6px_28px_rgba(237,132,53,0.5)] disabled:opacity-60"
          >
            {cargando ? "Enviando…" : "Enviar respuesta"}
          </button>
        </div>
      )}
    </div>
  );
}
