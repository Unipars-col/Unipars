"use client";

import { useState } from "react";
import { useCart } from "./cart-provider";

type Props = {
  id: string;
  nombre: string;
  precio: string;
  imagen: string;
};

export default function AddToCartButton({
  id,
  nombre,
  precio,
  imagen,
}: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        addItem({ id, nombre, precio, imagen });
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1200);
      }}
      className={`inline-flex rounded-full px-5 py-3 text-sm font-semibold transition-colors duration-200 ${
        added
          ? "bg-[#16384f] text-white"
          : "bg-[#ed8435] text-white hover:bg-[#d67024]"
      }`}
    >
      {added ? "Agregado" : "Agregar al carrito"}
    </button>
  );
}
