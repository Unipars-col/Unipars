"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  categorias,
  productosCatalogo,
  type Categoria,
  type ProductoCatalogo,
} from "../data/catalog";

export type AdminProductInput = {
  categoria: Categoria;
  nombre: string;
  marca: string;
  precioValor: number;
  precioAnteriorValor: number;
  imagen: string;
  disponibilidad: ProductoCatalogo["disponibilidad"];
};

type ProductsContextValue = {
  products: ProductoCatalogo[];
  adminProducts: ProductoCatalogo[];
  createProduct: (input: AdminProductInput) => void;
  removeProduct: (slug: string) => void;
};

const ProductsContext = createContext<ProductsContextValue | null>(null);
const STORAGE_KEY = "unipars-admin-products";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function sanitizeStoredProducts(value: unknown): ProductoCatalogo[] {
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is ProductoCatalogo => {
    if (!item || typeof item !== "object") return false;
    const candidate = item as ProductoCatalogo;

    return (
      typeof candidate.slug === "string" &&
      categorias.includes(candidate.categoria) &&
      typeof candidate.nombre === "string" &&
      typeof candidate.marca === "string" &&
      typeof candidate.precio === "string" &&
      typeof candidate.precioAnterior === "string" &&
      typeof candidate.precioValor === "number" &&
      typeof candidate.descuento === "string" &&
      typeof candidate.imagen === "string" &&
      typeof candidate.disponibilidad === "string"
    );
  });
}

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [adminProducts, setAdminProducts] = useState<ProductoCatalogo[]>(() => {
    if (typeof window === "undefined") return [];

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    try {
      return sanitizeStoredProducts(JSON.parse(stored));
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(adminProducts));
  }, [adminProducts]);

  const value = useMemo<ProductsContextValue>(() => {
    const products = [...adminProducts, ...productosCatalogo];

    return {
      products,
      adminProducts,
      createProduct: (input) => {
        const baseSlug = slugify(input.nombre);
        const uniqueSlug = products.some((item) => item.slug === baseSlug)
          ? `${baseSlug}-${Date.now().toString().slice(-6)}`
          : baseSlug;

        const safeCurrentPrice = Math.max(1, Math.round(input.precioValor));
        const safePreviousPrice = Math.max(
          safeCurrentPrice,
          Math.round(input.precioAnteriorValor),
        );
        const discount = Math.max(
          0,
          Math.round(
            ((safePreviousPrice - safeCurrentPrice) / safePreviousPrice) * 100,
          ),
        );

        const nextProduct: ProductoCatalogo = {
          slug: uniqueSlug,
          categoria: input.categoria,
          nombre: input.nombre.trim(),
          marca: input.marca.trim(),
          precio: formatCurrency(safeCurrentPrice),
          precioAnterior: formatCurrency(safePreviousPrice),
          precioValor: safeCurrentPrice,
          descuento: `-${discount}%`,
          imagen:
            input.imagen.trim().startsWith("/")
              ? input.imagen.trim()
              : "/hero-unipars.jpg",
          disponibilidad: input.disponibilidad,
        };

        setAdminProducts((current) => [nextProduct, ...current]);
      },
      removeProduct: (slug) => {
        setAdminProducts((current) =>
          current.filter((product) => product.slug !== slug),
        );
      },
    };
  }, [adminProducts]);

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts must be used within ProductsProvider");
  }

  return context;
}
