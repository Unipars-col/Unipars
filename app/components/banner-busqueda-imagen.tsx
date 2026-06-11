"use client";

import Image from "next/image";

export default function BannerBusquedaImagen() {
  return (
    <button
      type="button"
      className="w-full cursor-pointer"
      onClick={() => window.dispatchEvent(new CustomEvent("totalpars:visual-search-toggle", { detail: { isOpen: true } }))}
    >
      <Image
        src="/banner-busqueda-imagen-v3.jpg"
        alt="Buscá más fácil, buscá por imagen"
        width={1440}
        height={540}
        className="w-full rounded-2xl transition-opacity hover:opacity-95"
      />
    </button>
  );
}
