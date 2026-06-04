"use client";

import { useState } from "react";
import Link from "next/link";

type Faq = {
  id: string;
  q: string;
  a: string;
  tags: string;
};

export default function HelpSearch({ faqs }: { faqs: Faq[] }) {
  const [query, setQuery] = useState("");

  const results = query.trim().length < 2
    ? []
    : faqs.filter((faq) => {
        const q = query.toLowerCase();
        return (
          faq.q.toLowerCase().includes(q) ||
          faq.a.toLowerCase().includes(q) ||
          faq.tags.toLowerCase().includes(q)
        );
      });

  return (
    <div className="relative mx-auto w-full max-w-[640px]">
      <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3.5 shadow-lg">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 shrink-0"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="search"
          placeholder="Buscar en el centro de ayuda..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent text-sm text-[#1E3445] placeholder-gray-400 outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="shrink-0 text-gray-400 hover:text-gray-600"
            aria-label="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </div>

      {/* Resultados */}
      {query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl bg-white shadow-xl">
          {results.length === 0 ? (
            <div className="px-6 py-5 text-sm text-gray-500">
              Sin resultados para <strong>"{query}"</strong>.{" "}
              <Link href="/contacto" className="text-[#F28C28] hover:underline">
                Contactar soporte
              </Link>
            </div>
          ) : (
            <ul>
              {results.map((faq) => (
                <li key={faq.id}>
                  <a
                    href={`#${faq.id}`}
                    onClick={() => setQuery("")}
                    className="flex flex-col gap-1 px-6 py-4 text-left transition-colors hover:bg-gray-50"
                  >
                    <span className="text-sm font-medium text-[#1E3445]">{faq.q}</span>
                    <span className="line-clamp-1 text-xs text-gray-500">{faq.a}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
