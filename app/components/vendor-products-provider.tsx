"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { AdminProductInput } from "./products-provider";
import type { StoreProduct } from "@/lib/products";

type VendorProductsContextValue = {
  products: StoreProduct[];
  adminProducts: StoreProduct[];
  createProduct: (input: AdminProductInput) => Promise<{ ok: true } | { ok: false; message: string }>;
  updateProduct: (slug: string, input: AdminProductInput) => Promise<{ ok: true } | { ok: false; message: string }>;
  removeProduct: (slug: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  adjustInventory: (slug: string, quantity: number, note?: string) => Promise<{ ok: true } | { ok: false; message: string }>;
};

const VendorProductsContext = createContext<VendorProductsContextValue | null>(null);

export function VendorProductsProvider({ children, initialProducts }: { children: ReactNode; initialProducts: StoreProduct[] }) {
  const [products, setProducts] = useState<StoreProduct[]>(initialProducts);

  const value: VendorProductsContextValue = {
    products,
    adminProducts: products,
    createProduct: async (input) => {
      const response = await fetch("/api/vendor/products", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = (await response.json()) as { error?: string; details?: string; product?: StoreProduct };
      if (!response.ok || !payload.product) {
        return { ok: false, message: payload.details ? `${payload.error} ${payload.details}` : payload.error || "No fue posible guardar el producto." };
      }
      setProducts((current) => [payload.product!, ...current]);
      return { ok: true };
    },
    updateProduct: async (slug, input) => {
      const response = await fetch(`/api/vendor/products/${slug}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = (await response.json()) as { error?: string; details?: string; product?: StoreProduct };
      if (!response.ok || !payload.product) {
        return { ok: false, message: payload.error || "No fue posible actualizar el producto." };
      }
      setProducts((current) => current.map((p) => p.slug === slug ? payload.product! : p));
      return { ok: true };
    },
    removeProduct: async (slug) => {
      const response = await fetch(`/api/vendor/products/${slug}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        return { ok: false, message: payload.error || "No fue posible eliminar el producto." };
      }
      setProducts((current) => current.filter((p) => p.slug !== slug));
      return { ok: true };
    },
    adjustInventory: async (slug, quantity, note) => {
      const response = await fetch(`/api/vendor/inventory/${slug}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity, note }),
      });
      const payload = (await response.json()) as { error?: string; product?: StoreProduct };
      if (!response.ok || !payload.product) {
        return { ok: false, message: payload.error || "No fue posible ajustar el inventario." };
      }
      setProducts((current) => current.map((p) => p.slug === slug ? payload.product! : p));
      return { ok: true };
    },
  };

  return (
    <VendorProductsContext.Provider value={value}>
      {children}
    </VendorProductsContext.Provider>
  );
}

export function useVendorProducts() {
  const context = useContext(VendorProductsContext);
  if (!context) throw new Error("useVendorProducts must be used within VendorProductsProvider");
  return context;
}
