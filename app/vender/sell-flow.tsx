"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useProducts } from "../components/products-provider";
import { categorias, type Categoria, type ProductoCatalogo } from "../data/catalog";
import type { ProductoEspecificacion } from "../data/catalog";

type AuthGate = "loading" | "unauthenticated" | "no-company" | "vendor" | "ok";

type SearchMode = "keyword" | "photo" | "code";
type ProductFormState = {
  sku: string;
  oemReferencia: string;
  referenciasAlternas: string;
  categoria: Categoria;
  nombre: string;
  marca: string;
  precioValor: string;
  precioAnteriorValor: string;
  stock: string;
  stockMinimo: string;
  disponibilidad: ProductoCatalogo["disponibilidad"];
  descripcion: string;
  aplicacion: string;
  compatibilidad: string;
  garantia: string;
};

type TechnicalSpecFormItem = {
  id: string;
  etiqueta: string;
  valor: string;
};

type ProductImageChoice = {
  label: string;
  image: string | null;
};

const categories: Array<{
  id: "productos";
  label: string;
  description: string;
  icon: "box";
}> = [
  {
    id: "productos",
    label: "Productos",
    description: "Repuestos, partes e insumos",
    icon: "box",
  },
];

const searchModes: Array<{
  id: SearchMode;
  label: string;
  badge?: string;
  icon: "search" | "camera" | "barcode";
}> = [
  { id: "keyword", label: "Por palabras clave", icon: "search" },
  { id: "photo", label: "Por foto", badge: "NUEVO", icon: "camera" },
  { id: "code", label: "Por codigo", icon: "barcode" },
];

const disponibilidades: ProductoCatalogo["disponibilidad"][] = [
  "Entrega inmediata",
  "Disponible por pedido",
  "Recoger en tienda",
];

const initialProductForm: ProductFormState = {
  sku: "",
  oemReferencia: "",
  referenciasAlternas: "",
  categoria: categorias[0],
  nombre: "",
  marca: "Unipars",
  precioValor: "",
  precioAnteriorValor: "",
  stock: "0",
  stockMinimo: "0",
  disponibilidad: "Entrega inmediata",
  descripcion: "",
  aplicacion: "",
  compatibilidad: "",
  garantia: "1 año de garantía del fabricante",
};

const MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024;
const RECOMMENDED_FILE_SIZE_KB = 500;
const EXTRA_IMAGE_SLOTS = 3;

function createTechnicalSpecItem(
  spec?: Partial<ProductoEspecificacion>,
): TechnicalSpecFormItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    etiqueta: spec?.etiqueta || "",
    valor: spec?.valor || "",
  };
}

function normalizeTechnicalSpecFormItems(
  items: TechnicalSpecFormItem[],
): ProductoEspecificacion[] {
  return items
    .map((item) => ({
      etiqueta: item.etiqueta.trim(),
      valor: item.valor.trim(),
    }))
    .filter((item) => item.etiqueta && item.valor);
}

function splitCommaSeparatedValues(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function SellFlow() {
  const [step, setStep] = useState<"category" | "product-search" | "item-form">(
    "category",
  );
  const [mode, setMode] = useState<SearchMode>("keyword");
  const [productQuery, setProductQuery] = useState("");
  const [form, setForm] = useState<ProductFormState>(initialProductForm);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [technicalSpecs, setTechnicalSpecs] = useState<TechnicalSpecFormItem[]>([
    createTechnicalSpecItem({ etiqueta: "Observaciones" }),
  ]);
  const [selectedExtraImages, setSelectedExtraImages] = useState<Array<File | null>>(
    () => Array.from({ length: EXTRA_IMAGE_SLOTS }, () => null),
  );
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [requestError, setRequestError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [authGate, setAuthGate] = useState<AuthGate>("loading");
  const router = useRouter();
  const { createProduct } = useProducts();

  useEffect(() => {
    fetch("/api/account", { credentials: "include" })
      .then((res) => res.json())
      .then((data: { user?: { company?: string | null; role?: string }; isVendor?: boolean; error?: string }) => {
        if (!data.user) {
          setAuthGate("unauthenticated");
        } else if (data.user.role === "ADMIN" || data.isVendor) {
          setAuthGate("vendor");
        } else if (!data.user.company?.trim()) {
          setAuthGate("no-company");
        } else {
          setAuthGate("ok");
        }
      })
      .catch(() => setAuthGate("unauthenticated"));
  }, []);

  const previewImageUrl = useMemo(() => {
    if (selectedImage) {
      return URL.createObjectURL(selectedImage);
    }

    return null;
  }, [selectedImage]);

  const previewExtraImageUrls = useMemo(
    () =>
      Array.from({ length: EXTRA_IMAGE_SLOTS }, (_, index) => {
        const file = selectedExtraImages[index];
        return file ? URL.createObjectURL(file) : null;
      }),
    [selectedExtraImages],
  );

  const productImageChoices = useMemo(
    () => [
      {
        label: "Principal",
        image: previewImageUrl,
      },
      ...previewExtraImageUrls.map((image, index) => ({
        label: `Extra ${index + 1}`,
        image,
      })),
    ],
    [previewExtraImageUrls, previewImageUrl],
  );

  useEffect(() => {
    if (!previewImageUrl?.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(previewImageUrl);
  }, [previewImageUrl]);

  useEffect(() => {
    return () => {
      previewExtraImageUrls.forEach((image) => {
        if (image?.startsWith("blob:")) {
          URL.revokeObjectURL(image);
        }
      });
    };
  }, [previewExtraImageUrls]);

  const openVisualSearch = () => {
    window.dispatchEvent(
      new CustomEvent("unipars:visual-search-toggle", {
        detail: { isOpen: true },
      }),
    );
  };

  const handleModeClick = (nextMode: SearchMode) => {
    setMode(nextMode);

    if (nextMode === "photo") {
      openVisualSearch();
    }
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = String(formData.get("q") || "").trim();

    setProductQuery(query);
    setForm((current) => ({
      ...current,
      nombre: query || current.nombre,
    }));
    setStep("item-form");
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (file && file.size > MAX_FILE_SIZE_BYTES) {
      setRequestError("La imagen supera el limite de 3 MB. Intenta con una version mas liviana.");
      setSelectedImage(null);
      setFileInputKey((current) => current + 1);
      return;
    }

    setRequestError("");
    setSelectedImage(file);
  };

  const handleExtraImageChange =
    (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;

      if (file && file.size > MAX_FILE_SIZE_BYTES) {
        setRequestError("Una de las imagenes extra supera el limite de 3 MB. Intenta con una version mas liviana.");
        setSelectedExtraImages((current) =>
          current.map((item, itemIndex) => (itemIndex === index ? null : item)),
        );
        setFileInputKey((current) => current + 1);
        return;
      }

      setRequestError("");
      setSelectedExtraImages((current) =>
        current.map((item, itemIndex) => (itemIndex === index ? file : item)),
      );
    };

  const uploadFile = async (file: File, productName: string) => {
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("productName", productName);

    const response = await fetch("/api/uploads", {
      method: "POST",
      body: uploadData,
      credentials: "include",
    });

    const payload = (await response.json()) as {
      error?: string;
      publicUrl?: string;
    };

    if (!response.ok || !payload.publicUrl) {
      throw new Error(
        response.status === 401
          ? "Tu sesion se vencio. Ingresa de nuevo para crear productos."
          : payload.error || "No fue posible subir el archivo.",
      );
    }

    return payload.publicUrl;
  };

  const handleResetForm = () => {
    setForm({
      ...initialProductForm,
      nombre: productQuery,
    });
    setSelectedImage(null);
    setSelectedPdf(null);
    setTechnicalSpecs([createTechnicalSpecItem({ etiqueta: "Observaciones" })]);
    setSelectedExtraImages(Array.from({ length: EXTRA_IMAGE_SLOTS }, () => null));
    setPrimaryImageIndex(0);
    setRequestError("");
    setSaved(false);
    setFileInputKey((current) => current + 1);
  };

  const handleCreateProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingProduct(true);
    setRequestError("");
    setSaved(false);

    if (!selectedImage) {
      setIsSavingProduct(false);
      setRequestError("Selecciona una imagen principal para el producto.");
      return;
    }

    try {
      const imageUrl = await uploadFile(selectedImage, form.nombre);
      const fichaTecnicaUrl = selectedPdf
        ? await uploadFile(selectedPdf, form.nombre)
        : undefined;
      const extraImageUrls = await Promise.all(
        selectedExtraImages.map(async (file, index) =>
          file ? uploadFile(file, `${form.nombre}-extra-${index + 1}`) : null,
        ),
      );

      const orderedImages = [imageUrl, ...extraImageUrls];
      const nextPrimaryImage = orderedImages[primaryImageIndex];

      if (!nextPrimaryImage) {
        setIsSavingProduct(false);
        setRequestError("Selecciona una imagen valida como principal.");
        return;
      }

      const result = await createProduct({
        sku: form.sku,
        categoria: form.categoria,
        nombre: form.nombre,
        marca: form.marca,
        precioValor: Number(form.precioValor),
        precioAnteriorValor: Number(form.precioAnteriorValor || form.precioValor),
        stock: Number(form.stock),
        stockMinimo: Number(form.stockMinimo),
        imagen: nextPrimaryImage,
        imagenesExtra: orderedImages.filter(
          (image, index): image is string =>
            index !== primaryImageIndex && Boolean(image),
        ),
        disponibilidad: form.disponibilidad,
        descripcion: form.descripcion,
        oemReferencia: form.oemReferencia,
        referenciasAlternas: splitCommaSeparatedValues(form.referenciasAlternas),
        aplicacion: form.aplicacion,
        compatibilidad: splitCommaSeparatedValues(form.compatibilidad),
        garantia: form.garantia,
        fichaTecnicaUrl,
        especificacionesTecnicas: normalizeTechnicalSpecFormItems(technicalSpecs),
      });

      setIsSavingProduct(false);

      if (!result.ok) {
        setRequestError(result.message);
        return;
      }

      handleResetForm();
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch (error) {
      setIsSavingProduct(false);
      setRequestError(
        error instanceof Error
          ? error.message
          : "No fue posible guardar el producto.",
      );
    }
  };

  if (authGate === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f8f7]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#16384f] border-t-transparent" />
      </main>
    );
  }

  if (authGate === "unauthenticated") {
    return (
      <main className="min-h-screen bg-[#f8f8f7] text-[#16384f]">
        <section className="bg-[#16384f] px-5 pb-24 pt-16 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[760px]">
            <h1 className="text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
              Primero necesitas una cuenta
            </h1>
          </div>
        </section>

        <section className="-mt-10 px-5 pb-28 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[520px] rounded-2xl border border-black/10 bg-white p-8 shadow-[0_4px_20px_rgba(15,23,42,0.08)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#16384f]/10">
              <Icon name="box" className="h-7 w-7 text-[#16384f]" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-[#16384f]">
              Crea tu cuenta de empresa
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#555]">
              Para vender en Unipars necesitas registrarte con tu empresa. Es gratis y solo toma unos minutos.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <a
                href="/registro-empresa"
                className="inline-flex w-full items-center justify-center rounded-full bg-[#ed8435] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d67024]"
              >
                Registrarme como empresa
              </a>
              <a
                href="/login?redirect=/vender"
                className="inline-flex w-full items-center justify-center rounded-full border border-[#16384f]/20 bg-white px-6 py-3 text-sm font-semibold text-[#16384f] transition-colors hover:border-[#16384f]/40 hover:bg-[#16384f]/5"
              >
                Ya tengo cuenta — Iniciar sesión
              </a>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (authGate === "vendor") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f8f7] px-5">
        <div className="w-full max-w-[460px] rounded-2xl border border-black/10 bg-white p-8 shadow-[0_4px_20px_rgba(15,23,42,0.08)]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#16384f]/10">
            <svg className="h-7 w-7 text-[#16384f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <h2 className="mt-5 text-xl font-semibold text-[#16384f]">
            Ya tienes sesión iniciada
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#555]">
            Tu cuenta ya está activa como proveedor en Unipars. Gestiona tus productos, inventario y pedidos desde tu panel.
          </p>
          <div className="mt-6">
            <a
              href="/proveedor"
              className="inline-flex w-full items-center justify-center rounded-full bg-[#16384f] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0f2a3b]"
            >
              Ir a mi panel de proveedor
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (authGate === "no-company") {
    return (
      <main className="min-h-screen bg-[#f8f8f7] text-[#16384f]">
        <section className="bg-[#16384f] px-5 pb-24 pt-16 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[760px]">
            <h1 className="text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
              Completa tu perfil de empresa
            </h1>
          </div>
        </section>

        <section className="-mt-10 px-5 pb-28 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[520px] rounded-2xl border border-black/10 bg-white p-8 shadow-[0_4px_20px_rgba(15,23,42,0.08)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ed8435]/10">
              <svg className="h-7 w-7 text-[#ed8435]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
              </svg>
            </div>
            <h2 className="mt-5 text-xl font-semibold text-[#16384f]">
              Agrega el nombre de tu empresa
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#555]">
              Tu cuenta existe pero no tiene empresa registrada. Ve a tu perfil, agrega el nombre de tu empresa y vuelve aquí para publicar.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <a
                href="/registro-empresa"
                className="inline-flex w-full items-center justify-center rounded-full bg-[#ed8435] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d67024]"
              >
                Registrar mi empresa
              </a>
              <button
                type="button"
                onClick={() => router.push("/vender")}
                className="inline-flex w-full items-center justify-center rounded-full border border-[#16384f]/20 bg-white px-6 py-3 text-sm font-semibold text-[#16384f] transition-colors hover:border-[#16384f]/40"
              >
                Ya lo actualicé — Volver a intentar
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (step === "item-form") {
    return (
      <main className="min-h-screen bg-[#f8f8f7] text-[#16384f]">
        <section className="border-b border-white/10 bg-[#16384f] px-5 py-4 text-white sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setStep("product-search")}
              className="inline-flex items-center gap-1 text-sm font-semibold text-white transition-colors hover:text-[#ed8435]"
            >
              <span aria-hidden="true">‹</span>
              Anterior
            </button>
            <p className="text-xs font-medium text-white/75">Paso 2 de 3</p>
          </div>
        </section>

        <section className="px-5 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1180px] gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="hidden lg:block">
              <div className="sticky top-28 rounded-md border border-black/10 bg-white p-5 shadow-[0_2px_6px_rgba(15,23,42,0.08)]">
                <p className="text-sm font-semibold text-[#16384f]">Tu publicacion</p>
                <div className="mt-5 space-y-4 text-sm">
                  {[
                    ["1", "Producto", "Completo"],
                    ["2", "Datos", "En progreso"],
                    ["3", "Revision", "Pendiente"],
                  ].map(([number, label, status]) => (
                    <div key={label} className="flex gap-3">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                          number === "1"
                            ? "bg-[#16384f] text-white"
                            : number === "2"
                              ? "bg-[#ed8435] text-white"
                              : "bg-[#e6e6e6] text-[#666]"
                        }`}
                      >
                        {number}
                      </span>
                      <span>
                        <span className="block font-medium text-[#16384f]">{label}</span>
                        <span className="text-xs text-[#777]">{status}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#16384f] sm:text-3xl">
                  Completa los datos de tu producto
                </h1>
                <p className="mt-2 max-w-[620px] text-sm leading-6 text-[#555]">
                  Usamos esta informacion para revisar tu repuesto y dejarlo listo para cotizacion o publicacion.
                </p>
              </div>

              <form
                onSubmit={handleCreateProduct}
                className="rounded-[2rem] border border-black/8 bg-white p-5 shadow-[0_16px_35px_rgba(15,23,42,0.05)] md:p-8"
              >
                <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b8d91]">
                      Producto encontrado
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#16384f]">
                      Crear producto
                    </h2>
                    <p className="mt-3 max-w-[620px] text-sm leading-6 text-[#555]">
                      {productQuery
                        ? `Partimos de "${productQuery}" y puedes completar todos los datos antes de guardarlo.`
                        : "Completa la ficha del producto con la informacion comercial, tecnica y visual."}
                    </p>
                  </div>
                  {saved && (
                    <span className="rounded-full bg-[#16384f] px-4 py-2 text-sm font-semibold text-white">
                      Guardado
                    </span>
                  )}
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#4f545a]">SKU</span>
                    <input
                      name="sku"
                      value={form.sku}
                      onChange={handleChange}
                      placeholder="Ej. FAROLA001"
                      className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#4f545a]">Categoria</span>
                    <select
                      name="categoria"
                      value={form.categoria}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
                    >
                      {categorias.map((categoria) => (
                        <option key={categoria} value={categoria}>
                          {categoria}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#4f545a]">Marca</span>
                    <input
                      name="marca"
                      value={form.marca}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#4f545a]">Referencia OEM</span>
                    <input
                      name="oemReferencia"
                      value={form.oemReferencia}
                      onChange={handleChange}
                      placeholder="Codigo OEM o referencia"
                      className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
                    />
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-[#4f545a]">Nombre del producto</span>
                    <input
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#4f545a]">Precio actual</span>
                    <input
                      name="precioValor"
                      type="number"
                      min="1"
                      value={form.precioValor}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#4f545a]">Precio anterior</span>
                    <input
                      name="precioAnteriorValor"
                      type="number"
                      min="1"
                      value={form.precioAnteriorValor}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#4f545a]">Stock actual</span>
                    <input
                      name="stock"
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#4f545a]">Stock minimo</span>
                    <input
                      name="stockMinimo"
                      type="number"
                      min="0"
                      value={form.stockMinimo}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
                    />
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-[#4f545a]">Referencias alternas</span>
                    <input
                      name="referenciasAlternas"
                      value={form.referenciasAlternas}
                      onChange={handleChange}
                      placeholder="Separadas por coma"
                      className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
                    />
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-[#4f545a]">
                      Subir imagen a Supabase Storage
                    </span>
                    <input
                      key={fileInputKey}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      required
                      className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 file:mr-4 file:rounded-full file:border-0 file:bg-[#16384f] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#0f2a3b]"
                    />
                    <p className="text-xs leading-6 text-[#6e7379]">
                      Formatos permitidos: JPG, PNG o WEBP. Recomendado: hasta {RECOMMENDED_FILE_SIZE_KB} KB por imagen. Limite maximo: 3 MB.
                    </p>
                    {selectedImage && (
                      <p className="text-xs leading-6 text-[#16384f]">
                        Archivo seleccionado: {selectedImage.name} ({Math.round(selectedImage.size / 1024)} KB)
                      </p>
                    )}
                  </label>

                  <div className="grid gap-5 md:col-span-2 md:grid-cols-3">
                    {Array.from({ length: EXTRA_IMAGE_SLOTS }, (_, index) => (
                      <label
                        key={`sell-extra-${index}`}
                        className="space-y-2 rounded-[1.4rem] border border-black/8 bg-[#fafaf9] p-4"
                      >
                        <span className="text-sm font-medium text-[#4f545a]">
                          Imagen extra {index + 1}
                        </span>
                        <input
                          key={`${fileInputKey}-sell-extra-${index}`}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleExtraImageChange(index)}
                          className="w-full rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 file:mr-3 file:rounded-full file:border-0 file:bg-[#16384f] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-[#0f2a3b]"
                        />
                        <p className="text-xs leading-6 text-[#6e7379]">
                          Opcional. Se mostrara como miniatura en la galeria.
                        </p>
                        {selectedExtraImages[index] && (
                          <p className="text-xs leading-6 text-[#16384f]">
                            Archivo: {selectedExtraImages[index]?.name} ({Math.round((selectedExtraImages[index]?.size || 0) / 1024)} KB)
                          </p>
                        )}
                        {previewExtraImageUrls[index] && (
                          <div className="overflow-hidden rounded-[1rem] border border-black/8 bg-white">
                            <Image
                              src={previewExtraImageUrls[index] || ""}
                              alt={`Vista previa extra ${index + 1}`}
                              width={500}
                              height={500}
                              className="h-28 w-full bg-white object-contain"
                              unoptimized
                            />
                          </div>
                        )}
                      </label>
                    ))}
                  </div>

                  {previewImageUrl && (
                    <div className="rounded-[1.5rem] border border-black/8 bg-[#fafaf9] p-4 md:col-span-2">
                      <p className="text-sm font-medium text-[#4f545a]">
                        Vista previa de la nueva imagen
                      </p>
                      <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-black/8 bg-white">
                        <Image
                          src={previewImageUrl}
                          alt={form.nombre || "Vista previa del producto"}
                          width={1200}
                          height={900}
                          className="h-64 w-full bg-white object-contain"
                          unoptimized
                        />
                      </div>
                    </div>
                  )}

                  <ProductImageSelector
                    choices={productImageChoices}
                    primaryImageIndex={primaryImageIndex}
                    onSelect={setPrimaryImageIndex}
                    description="Puedes escoger cual de las imagenes sera la principal del producto."
                  />

                  <TechnicalSpecsEditor
                    items={technicalSpecs}
                    onChange={setTechnicalSpecs}
                  />

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-[#4f545a]">Descripcion comercial</span>
                    <textarea
                      name="descripcion"
                      value={form.descripcion}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Describe el producto, su uso principal y el beneficio para el cliente."
                      className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm leading-7 text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#4f545a]">Disponibilidad</span>
                    <select
                      name="disponibilidad"
                      value={form.disponibilidad}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
                    >
                      {disponibilidades.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#4f545a]">Garantia</span>
                    <input
                      name="garantia"
                      value={form.garantia}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
                    />
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-[#4f545a]">Aplicacion</span>
                    <input
                      name="aplicacion"
                      value={form.aplicacion}
                      onChange={handleChange}
                      placeholder="Ej. Aplicacion recomendada para buses de transporte masivo"
                      className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
                    />
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-[#4f545a]">Compatibilidad</span>
                    <input
                      name="compatibilidad"
                      value={form.compatibilidad}
                      onChange={handleChange}
                      placeholder="Modelos o lineas separados por coma"
                      className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
                    />
                  </label>
                </div>

                <div className="mt-6 space-y-2">
                  <span className="text-sm font-medium text-[#4f545a]">Ficha tecnica (PDF)</span>
                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-black/15 bg-[#fafaf9] px-4 py-3 transition-colors hover:border-[#ed8435]/50">
                    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ed8435" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                    <span className="text-sm text-[#4f545a]">
                      {selectedPdf ? selectedPdf.name : "Sube aca tu ficha tecnica"}
                    </span>
                    <input
                      key={`pdf-${fileInputKey}`}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(event) => setSelectedPdf(event.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>

                <div className="sticky bottom-0 mt-8 flex flex-wrap justify-end gap-3 border-t border-black/10 bg-white/95 py-5 backdrop-blur">
                  {requestError && (
                    <p className="w-full rounded-2xl border border-[#ed8435]/20 bg-[#fff6ee] px-4 py-3 text-sm font-medium text-[#b85d12]">
                      {requestError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => router.push(`/categorias?q=${encodeURIComponent(productQuery)}`)}
                    className="rounded-full border border-[#16384f]/20 bg-white px-6 py-3 text-sm font-semibold text-[#16384f] transition-colors hover:border-[#ed8435] hover:text-[#ed8435]"
                  >
                    Ver catalogo
                  </button>
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
                  >
                    Limpiar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProduct}
                    className="rounded-full bg-[#ed8435] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d67024] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingProduct ? "Guardando..." : "Crear producto"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (step === "product-search") {
    return (
      <main className="min-h-screen bg-[#f8f8f7] text-[#16384f]">
        <section className="bg-[#16384f] px-5 pb-14 pt-7 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[820px]">
            <button
              type="button"
              onClick={() => setStep("category")}
              className="inline-flex items-center gap-1 text-sm font-semibold text-white transition-colors hover:text-[#ed8435]"
            >
              <span aria-hidden="true">‹</span>
              Anterior
            </button>

            <div className="mt-10 grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_220px]">
              <div>
                <p className="text-xs font-medium text-white/75">Paso 1 de 3</p>
                <h1 className="mt-3 max-w-[560px] text-2xl font-semibold leading-tight tracking-[-0.02em] text-white sm:text-3xl">
                  Para publicar mas rapido, busca tu producto en nuestro catalogo
                </h1>
              </div>
              <PublishIllustration />
            </div>
          </div>
        </section>

        <section className="-mt-8 px-5 pb-20 sm:px-6 lg:px-8">
          <form
            onSubmit={handleSearch}
            className="mx-auto max-w-[820px] overflow-hidden rounded-md border border-black/8 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.12)]"
          >
            <div className="p-6 sm:p-8">
              <div className="grid gap-2 sm:grid-cols-3">
                {searchModes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleModeClick(item.id)}
                    className={`relative flex min-h-[92px] flex-col items-center justify-center gap-3 rounded-md border bg-white px-4 text-center text-sm transition-colors duration-200 ${
                      mode === item.id
                        ? "border-[#ed8435] text-[#ed8435] shadow-[0_0_0_1px_#ed8435]"
                        : "border-black/20 text-[#16384f] hover:border-[#ed8435]"
                    }`}
                  >
                    {item.badge && (
                      <span className="absolute right-0 top-0 rounded-bl-md rounded-tr-md bg-[#ed8435] px-3 py-1 text-[11px] font-semibold text-white">
                        {item.badge}
                      </span>
                    )}
                    <Icon name={item.icon} className="h-7 w-7" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-8">
                <h2 className="text-lg font-semibold text-[#16384f]">
                  {mode === "code"
                    ? "Escribe el codigo o referencia del producto"
                    : "Escribe la marca, modelo y caracteristicas del producto"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#444]">
                  Cuanto mas detalle sumes, mejores seran los resultados para encontrar tu producto.
                </p>
                <input
                  name="q"
                  type="search"
                  autoFocus
                  placeholder={
                    mode === "code"
                      ? "Ej.: REF-UNP-2048, placa, codigo o SKU"
                      : "Ej.: motor limpiaparabrisas, espejo lateral, valvula neumatica"
                  }
                  className="mt-7 h-12 w-full rounded-md border border-[#ed8435] px-4 text-base text-[#16384f] outline-none transition-shadow placeholder:text-[#8a8a8a] focus:shadow-[0_0_0_2px_rgba(237,132,53,0.2)]"
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-black/10 bg-white px-6 py-5 sm:px-8">
              <button
                type="submit"
                className="rounded-md bg-[#ed8435] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d67024]"
              >
                Buscar
              </button>
            </div>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f8f7] text-[#16384f]">
      <section className="bg-[#16384f] px-5 pb-24 pt-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[760px]">
          <h1 className="text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
            Hola! Antes que nada cuentanos,
            <br className="hidden sm:block" /> que vas a publicar?
          </h1>
        </div>
      </section>

      <section className="-mt-16 px-5 pb-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[760px]">
          <div className="grid max-w-[180px] gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setStep("product-search")}
                className="group flex min-h-[160px] flex-col items-center justify-center rounded-md border border-[#16384f]/10 bg-white px-4 py-6 text-center shadow-[0_2px_6px_rgba(15,23,42,0.12)] transition-all duration-200 hover:-translate-y-1 hover:border-[#ed8435] hover:shadow-[0_8px_18px_rgba(15,23,42,0.12)]"
              >
                <Icon
                  name={category.icon}
                  className="h-16 w-16 text-[#16384f] transition-colors group-hover:text-[#ed8435]"
                />
                <span className="mt-4 text-base font-medium text-[#16384f]">
                  {category.label}
                </span>
                <span className="mt-1 text-xs leading-5 text-[#737373]">
                  {category.description}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-7 flex max-w-[230px] items-start gap-3 text-xs leading-5 text-[#4c4c4c]">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#16384f] text-white">
              <Icon name="upload" className="h-4 w-4" />
            </span>
            <p>
              Para subir muchos productos, puedes{" "}
              <a
                href="mailto:commercial@unipars.com.co?subject=Publicador%20masivo%20Unipars"
                className="font-medium text-[#ed8435] hover:underline"
              >
                ir al Publicador masivo
              </a>
            </p>
          </div>
        </div>
      </section>

      <p className="fixed bottom-5 left-0 right-0 px-5 text-center text-xs text-[#8a8a8a]">
        Asegurate de que tu publicacion cumpla con las politicas comerciales de Unipars.
      </p>
    </main>
  );
}

function ProductImageSelector({
  choices,
  description,
  onSelect,
  primaryImageIndex,
}: {
  choices: ProductImageChoice[];
  description: string;
  onSelect: (index: number) => void;
  primaryImageIndex: number;
}) {
  return (
    <div className="rounded-[1.5rem] border border-black/8 bg-[#fafaf9] p-5 md:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#4f545a]">Imagen principal</p>
          <p className="mt-2 text-xs leading-6 text-[#6e7379]">{description}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {choices.map((choice, index) => (
          <button
            key={choice.label}
            type="button"
            onClick={() => onSelect(index)}
            disabled={!choice.image}
            className={`rounded-[1.2rem] border bg-white p-3 text-left transition-colors duration-200 ${
              primaryImageIndex === index
                ? "border-[#ed8435] text-[#ed8435]"
                : "border-black/10 text-[#16384f] hover:border-[#ed8435]/50"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.14em]">
              {choice.label}
            </span>
            <div className="mt-3 flex h-20 items-center justify-center overflow-hidden rounded-xl bg-[#fafaf9]">
              {choice.image ? (
                <Image
                  src={choice.image}
                  alt={choice.label}
                  width={220}
                  height={160}
                  className="h-full w-full object-contain"
                  unoptimized
                />
              ) : (
                <span className="text-xs text-[#8b8d91]">Sin imagen</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function TechnicalSpecsEditor({
  items,
  onChange,
}: {
  items: TechnicalSpecFormItem[];
  onChange: (items: TechnicalSpecFormItem[]) => void;
}) {
  const updateItem = (
    id: string,
    field: "etiqueta" | "valor",
    value: string,
  ) => {
    onChange(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const addItem = () => {
    onChange([...items, createTechnicalSpecItem()]);
  };

  return (
    <div className="rounded-[1.5rem] border border-black/8 bg-[#fafaf9] p-5 md:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#4f545a]">
            Ficha tecnica del producto
          </p>
          <p className="mt-2 text-xs leading-6 text-[#6e7379]">
            Agrega solo las especificaciones que apliquen para este producto.
          </p>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
        >
          Agregar especificacion
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {items.length === 0 && (
          <div className="rounded-[1.2rem] border border-dashed border-black/12 bg-white px-4 py-5 text-sm text-[#6e7379]">
            Aun no hay especificaciones. Agrega las filas que necesites para esta categoria.
          </div>
        )}

        {items.map((item, index) => (
          <div
            key={item.id}
            className="grid gap-3 rounded-[1.2rem] border border-black/8 bg-white p-4 md:grid-cols-[220px_minmax(0,1fr)_auto]"
          >
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8b8d91]">
                Etiqueta
              </span>
              <input
                value={item.etiqueta}
                onChange={(event) => updateItem(item.id, "etiqueta", event.target.value)}
                placeholder={index === 0 ? "Ej. Material" : "Nombre del dato"}
                className="w-full rounded-xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8b8d91]">
                Valor
              </span>
              <input
                value={item.valor}
                onChange={(event) => updateItem(item.id, "valor", event.target.value)}
                placeholder="Escribe la especificacion"
                className="w-full rounded-xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
              />
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="inline-flex rounded-full border border-black/10 px-4 py-3 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
              >
                Quitar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PublishIllustration() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 220 140"
      className="mx-auto hidden h-[132px] w-[220px] md:block"
      fill="none"
    >
      <path
        d="M45 106c10-12 3-31 14-45 6-8 18-6 19 5 1 13-13 17-5 31 5 9 16 4 18 14"
        stroke="#d5d5d5"
        strokeWidth="2"
      />
      <path d="M92 42h92v60H92z" fill="#fff" stroke="#5b6670" strokeWidth="2" />
      <path d="M101 52h74v43h-74z" fill="#f6f6f6" />
      <path d="M111 81c11-12 20-10 34 1" stroke="#ed8435" strokeWidth="4" />
      <path d="M150 60h22M150 68h22M150 76h22M150 84h22" stroke="#d6d6d6" strokeWidth="2" />
      <path d="M83 102h110v9a8 8 0 0 1-8 8H91a8 8 0 0 1-8-8v-9Z" fill="#ed8435" />
      <path d="M70 119h139" stroke="#e0e0e0" strokeWidth="2" />
    </svg>
  );
}

function Icon({
  name,
  className,
}: {
  name:
    | "barcode"
    | "box"
    | "bus"
    | "camera"
    | "search"
    | "tools"
    | "upload"
    | "warehouse";
  className?: string;
}) {
  const common = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 64 64",
    "aria-hidden": true,
  };

  if (name === "search") {
    return (
      <svg {...common}>
        <circle cx="28" cy="28" r="13" />
        <path d="m38 38 12 12" />
      </svg>
    );
  }

  if (name === "camera") {
    return (
      <svg {...common}>
        <path d="M17 25h8l3-5h8l3 5h8a5 5 0 0 1 5 5v16a5 5 0 0 1-5 5H17a5 5 0 0 1-5-5V30a5 5 0 0 1 5-5Z" />
        <circle cx="32" cy="38" r="8" />
      </svg>
    );
  }

  if (name === "barcode") {
    return (
      <svg {...common}>
        <path d="M14 18v28M20 18v28M28 18v28M34 18v28M44 18v28M50 18v28" />
        <path d="M24 18v28M39 18v28" strokeWidth="3" />
      </svg>
    );
  }

  if (name === "bus") {
    return (
      <svg {...common}>
        <path d="M15 25c2-7 7-11 17-11s15 4 17 11l2 9v13H13V34l2-9Z" />
        <path d="M19 27h26M20 38h8M36 38h8" />
        <circle cx="22" cy="49" r="3" />
        <circle cx="42" cy="49" r="3" />
      </svg>
    );
  }

  if (name === "warehouse") {
    return (
      <svg {...common}>
        <path d="m10 34 22-21 22 21" />
        <path d="M16 30v22h32V30" />
        <path d="M25 52V36h14v16M27 23h10" />
      </svg>
    );
  }

  if (name === "tools") {
    return (
      <svg {...common}>
        <path d="M19 50V31h14v19M16 31h20l-2-13H18l-2 13Z" />
        <path d="M42 49V18h11v31M42 26h11M42 34h11" />
      </svg>
    );
  }

  if (name === "upload") {
    return (
      <svg {...common} viewBox="0 0 24 24">
        <path d="M12 15V4" />
        <path d="m8 8 4-4 4 4" />
        <path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="m14 24 18-10 18 10-18 10-18-10Z" />
      <path d="M14 24v17l18 10 18-10V24" />
      <path d="M32 34v17M23 19l18 10" />
    </svg>
  );
}
