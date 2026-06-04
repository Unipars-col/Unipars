"use client";

import { useState } from "react";

const OPCIONES = [
  { id: "voz", label: "Voz a voz", emoji: "🗣️" },
  { id: "redes", label: "Redes sociales", emoji: "📱" },
  { id: "google", label: "Google", emoji: "🔍" },
  { id: "publicidad", label: "Publicidad", emoji: "📢" },
  { id: "recomendacion", label: "Me lo recomendaron", emoji: "👥" },
  { id: "otro", label: "Otro", emoji: "✨" },
];

export default function EncuestaReferido() {
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  if (enviado) {
    return (
      <div className="mt-8 flex flex-col items-center gap-2 rounded-[1.4rem] border border-green-100 bg-green-50 py-5">
        <span className="text-2xl">🙌</span>
        <p className="text-sm font-semibold text-green-700">¡Gracias por contarnos!</p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-[1.4rem] border border-black/8 bg-[#fafaf9] px-6 py-6">
      <p className="text-base font-bold text-[#16384f]">¿Cómo te enteraste de nosotros?</p>
      <p className="mt-1 text-xs text-[#8b8d91]">Tu opinión nos ayuda a mejorar.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {OPCIONES.map((op) => (
          <button
            key={op.id}
            type="button"
            onClick={() => setSeleccion(op.id)}
            className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
              seleccion === op.id
                ? "border-[#ed8435] bg-[#ed8435] text-white shadow-sm"
                : "border-black/10 bg-white text-[#38454f] hover:border-[#ed8435] hover:text-[#ed8435]"
            }`}
          >
            <span className="text-base leading-none">{op.emoji}</span>
            {op.label}
          </button>
        ))}
      </div>

      {seleccion && (
        <button
          type="button"
          onClick={() => setEnviado(true)}
          className="mt-4 rounded-full bg-[#ed8435] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d67024]"
        >
          Enviar →
        </button>
      )}
    </div>
  );
}
