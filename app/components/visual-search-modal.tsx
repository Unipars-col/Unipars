"use client";

import { useEffect, useState } from "react";
import ImageSearchClient from "../buscar-por-imagen/image-search-client";
import { useProducts } from "./products-provider";

export default function VisualSearchModal() {
  const { products } = useProducts();
  const [isOpen, setIsOpen] = useState(false);
  const fallbackProduct = products[0] ?? null;

  useEffect(() => {
    const handleToggle = (event: Event) => {
      const customEvent = event as CustomEvent<{ isOpen?: boolean }>;
      setIsOpen((current) => customEvent.detail?.isOpen ?? !current);
    };

    window.addEventListener("totalpars:visual-search-toggle", handleToggle);
    return () => {
      window.removeEventListener("totalpars:visual-search-toggle", handleToggle);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        window.dispatchEvent(
          new CustomEvent("totalpars:visual-search-toggle", {
            detail: { isOpen: false },
          }),
        );
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const closeModal = () => {
    setIsOpen(false);
    window.dispatchEvent(
      new CustomEvent("totalpars:visual-search-toggle", {
        detail: { isOpen: false },
      }),
    );
  };

  if (!isOpen || !fallbackProduct) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/58 px-4 py-4 backdrop-blur-[2px] sm:py-8 md:py-12">
      <button
        type="button"
        aria-label="Cerrar búsqueda por imagen"
        className="absolute inset-0 cursor-default"
        onClick={closeModal}
      />

      <section className="relative z-10 flex w-full max-w-[520px] max-h-[calc(100svh-2rem)] flex-col rounded-[6px] border border-black/10 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.34)]">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-black/8 px-6 py-5">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#1f2328]">
              Buscar por imagen
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#5f666d]">
              Sube una imagen del repuesto en formato JPG, PNG o WEBP.
            </p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 text-xl leading-none text-[#5f666d] transition-colors hover:bg-[#16384f] hover:text-white"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto">
          <ImageSearchClient
            fallbackProduct={fallbackProduct}
            onNavigate={closeModal}
          />
        </div>
      </section>
    </div>
  );
}
