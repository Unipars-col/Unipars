"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  id: string;
  nombre: string;
  precio: string;
  imagen: string;
  cantidad: number;
};

function normalizeCartId(id: string) {
  return id.replace(/^(home|catalogo|detalle)-/, "");
}

function normalizeCartItems(items: CartItem[]) {
  return items.reduce<CartItem[]>((acc, item) => {
    const normalizedId = normalizeCartId(item.id);
    const existing = acc.find((entry) => entry.id === normalizedId);

    if (existing) {
      existing.cantidad += item.cantidad;
      return acc;
    }

    acc.push({ ...item, id: normalizedId });
    return acc;
  }, []);
}

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  addItem: (item: Omit<CartItem, "cantidad">) => void;
  incrementItem: (id: string) => void;
  decrementItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "unipars-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
      return normalizeCartItems(JSON.parse(stored));
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      totalItems: items.reduce((acc, item) => acc + item.cantidad, 0),
      addItem: (item: Omit<CartItem, "cantidad">) => {
        setItems((current) => {
          const normalizedId = normalizeCartId(item.id);
          const existing = current.find((entry) => entry.id === normalizedId);
          if (existing) {
            return current.map((entry) =>
              entry.id === normalizedId
                ? { ...entry, cantidad: entry.cantidad + 1 }
                : entry,
            );
          }
          return [...current, { ...item, id: normalizedId, cantidad: 1 }];
        });
      },
      incrementItem: (id: string) => {
        const normalizedId = normalizeCartId(id);
        setItems((current) =>
          current.map((item) =>
            item.id === normalizedId
              ? { ...item, cantidad: item.cantidad + 1 }
              : item,
          ),
        );
      },
      decrementItem: (id: string) => {
        const normalizedId = normalizeCartId(id);
        setItems((current) =>
          current.flatMap((item) => {
            if (item.id !== normalizedId) return [item];
            if (item.cantidad <= 1) return [];
            return [{ ...item, cantidad: item.cantidad - 1 }];
          }),
        );
      },
      removeItem: (id: string) => {
        const normalizedId = normalizeCartId(id);
        setItems((current) =>
          current.filter((item) => item.id !== normalizedId),
        );
      },
      clearCart: () => setItems([]),
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
