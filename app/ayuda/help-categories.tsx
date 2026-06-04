"use client";

import { useState } from "react";

type Category = {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
};

type Faq = {
  id: string;
  q: string;
  a: string;
  tags: string;
  categories: string[];
};

export default function HelpCategories({
  categories,
  faqs,
}: {
  categories: Category[];
  faqs: Faq[];
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredFaqs = activeCategory
    ? faqs.filter((f) => f.categories.includes(activeCategory))
    : faqs;

  const activeMeta = categories.find((c) => c.id === activeCategory);

  return (
    <>
      {/* Tarjetas de categoría */}
      <section className="mx-auto max-w-[1200px] px-6 py-14 lg:px-8">
        <h2 className="mb-8 text-center text-xl font-semibold text-[#1E3445]">
          Explora por categoría
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(isActive ? null : cat.id);
                  setTimeout(() => {
                    document.getElementById("faq-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 50);
                }}
                className={`group flex flex-col gap-3 rounded-2xl border p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                  isActive
                    ? "border-[#F28C28]/40 bg-[#fff6ee] shadow-[0_0_0_2px_#F28C28]"
                    : "border-black/6 bg-white"
                }`}
              >
                <div className={`w-fit rounded-xl p-3 ${cat.color}`}>
                  {cat.icon}
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-[#1E3445]">{cat.title}</h3>
                  <p className="text-sm leading-6 text-[#6b7280]">{cat.description}</p>
                </div>
                <span className={`mt-auto text-sm font-medium transition-colors ${isActive ? "text-[#d4722a]" : "text-[#F28C28] group-hover:text-[#d4722a]"}`}>
                  {isActive ? "Filtrando esta categoría ✓" : "Ver ayuda →"}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* FAQ filtrado */}
      <section id="faq-section" className="mx-auto max-w-[860px] scroll-mt-24 px-6 pb-14 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-[#1E3445]">
            {activeCategory
              ? `Preguntas sobre ${activeMeta?.title}`
              : "Preguntas frecuentes"}
          </h2>
          {activeCategory && (
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className="text-xs font-medium text-[#6b7280] hover:text-[#1E3445] transition-colors"
            >
              Ver todas →
            </button>
          )}
        </div>

        {filteredFaqs.length === 0 ? (
          <div className="rounded-2xl border border-black/6 bg-white px-6 py-10 text-center text-sm text-[#6b7280] shadow-sm">
            No hay preguntas para esta categoría aún.{" "}
            <a href="https://wa.me/573057249454" target="_blank" rel="noreferrer" className="text-[#F28C28] hover:underline">
              Contactar soporte
            </a>
          </div>
        ) : (
          <div className="divide-y divide-black/6 rounded-2xl border border-black/6 bg-white shadow-sm">
            {filteredFaqs.map((faq) => (
              <details key={faq.id} className="group px-6 py-0">
                <summary className="flex cursor-pointer select-none list-none items-center justify-between gap-4 py-5 text-sm font-medium text-[#1E3445] [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 shrink-0 text-[#F28C28] transition-transform duration-200 group-open:rotate-180"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <p className="pb-5 text-sm leading-7 text-[#6b7280]">{faq.a}</p>
              </details>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
