"use client";

import { useState } from "react";
import { useCart } from "./cart-provider";

type Props = {
  id: string;
  nombre: string;
  precio: string;
  imagen: string;
  disabled?: boolean;
};

export default function AddToCartButton({
  id,
  nombre,
  precio,
  imagen,
  disabled = false,
}: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        addItem({ id, nombre, precio, imagen });
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1200);
      }}
      className={`inline-flex rounded-full px-5 py-3 text-sm font-semibold transition-colors duration-200 ${
        disabled
          ? "cursor-not-allowed bg-[#d8dbe0] text-[#6b7280]"
          : added
          ? "bg-[#16384f] text-white"
          : "bg-[#ed8435] text-white hover:bg-[#d67024]"
      }`}
    >
      {disabled ? "Sin stock" : added ? "Agregado" : "Agregar al carrito"}
    </button>
  );
}
