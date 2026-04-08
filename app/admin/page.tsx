"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProducts } from "../components/products-provider";
import { categorias, type Categoria, type ProductoCatalogo } from "../data/catalog";
import type { InventoryMovementSummary } from "@/lib/products";

const disponibilidades: ProductoCatalogo["disponibilidad"][] = [
  "Entrega inmediata",
  "Disponible por pedido",
  "Recoger en tienda",
];

type FormState = {
  sku: string;
  categoria: Categoria;
  nombre: string;
  marca: string;
  precioValor: string;
  precioAnteriorValor: string;
  stock: string;
  stockMinimo: string;
  disponibilidad: ProductoCatalogo["disponibilidad"];
};

const initialState: FormState = {
  sku: "",
  categoria: categorias[0],
  nombre: "",
  marca: "Unipars",
  precioValor: "",
  precioAnteriorValor: "",
  stock: "0",
  stockMinimo: "0",
  disponibilidad: "Entrega inmediata",
};

const MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024;
const RECOMMENDED_FILE_SIZE_KB = 500;
const EXTRA_IMAGE_SLOTS = 3;

type ToastState = {
  tone: "success" | "error";
  message: string;
} | null;

type ProductImageChoice = {
  label: string;
  image: string | null;
};

function getInventoryTone(
  status?: ProductoCatalogo["estadoInventario"],
) {
  if (status === "out-of-stock") {
    return {
      label: "Agotado",
      className: "bg-[#fff1f1] text-[#c53b3b]",
    };
  }

  if (status === "low-stock") {
    return {
      label: "Stock bajo",
      className: "bg-[#fff6ee] text-[#b85d12]",
    };
  }

  return {
    label: "En stock",
    className: "bg-[#effaf2] text-[#1f6b39]",
  };
}

function ProductImageSelector({
  choices,
  primaryImageIndex,
  onSelect,
  description,
}: {
  choices: ProductImageChoice[];
  primaryImageIndex: number;
  onSelect: (index: number) => void;
  description: string;
}) {
  return (
    <div className="md:col-span-2 rounded-[1.5rem] border border-black/8 bg-[#fafaf9] p-4">
      <p className="text-sm font-medium text-[#4f545a]">Elegir imagen principal</p>
      <p className="mt-2 text-xs leading-6 text-[#6e7379]">{description}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {choices.map((item, index) => {
          const hasImage = Boolean(item.image);

          return (
            <button
              key={`choice-${item.label}-${index}`}
              type="button"
              onClick={() => hasImage && onSelect(index)}
              disabled={!hasImage}
              className={`group rounded-[1.15rem] border p-2.5 text-left transition-all duration-200 ${
                primaryImageIndex === index && hasImage
                  ? "border-[#16384f] bg-white shadow-[0_14px_28px_rgba(22,56,79,0.12)]"
                  : "border-black/8 bg-white/96"
              } ${hasImage ? "hover:-translate-y-0.5 hover:border-[#16384f]/30" : "cursor-not-allowed opacity-55"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9a9da2]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs text-[#5c6167]">
                    {hasImage ? "Haz clic para usarla" : "Sin imagen"}
                  </p>
                </div>
                <div
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                    primaryImageIndex === index && hasImage
                      ? "bg-[#16384f] text-white"
                      : "border border-black/8 text-[#8b8d91]"
                  }`}
                >
                  {primaryImageIndex === index && hasImage ? "Principal" : "Vista"}
                </div>
              </div>
              <div className="mt-3 overflow-hidden rounded-[0.95rem] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f4f6f8_100%)]">
                {item.image ? (
                  <div className="relative p-2">
                    {primaryImageIndex === index && hasImage && (
                      <div className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#ed8435] text-white shadow-[0_10px_20px_rgba(237,132,53,0.28)]">
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 20 20"
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4.5 10.5 8 14l7.5-8" />
                        </svg>
                      </div>
                    )}
                    <div className="overflow-hidden rounded-[0.8rem] bg-white shadow-[inset_0_0_0_1px_rgba(15,23,42,0.04)]">
                      <Image
                        src={item.image}
                        alt={`Opción ${item.label}`}
                        width={320}
                        height={240}
                        className="h-20 w-full object-cover md:h-24"
                        unoptimized={item.image.startsWith("blob:")}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex h-24 items-center justify-center text-xs font-medium text-[#a2a5aa] md:h-28">
                    Sin imagen
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const {
    adminProducts,
    createProduct,
    updateProduct,
    removeProduct,
    adjustInventory,
  } = useProducts();
  const [activeTab, setActiveTab] = useState<"create" | "edit" | "inventory" | null>(null);
  const [editSearch, setEditSearch] = useState("");
  const [editCategoryFilter, setEditCategoryFilter] = useState<"Todas" | Categoria>("Todas");
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState<
    "all" | "low-stock" | "out-of-stock"
  >("all");
  const [form, setForm] = useState<FormState>(initialState);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedExtraImages, setSelectedExtraImages] = useState<Array<File | null>>(
    () => Array.from({ length: EXTRA_IMAGE_SLOTS }, () => null),
  );
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [toast, setToast] = useState<ToastState>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [inventoryAdjustments, setInventoryAdjustments] = useState<Record<string, string>>({});
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovementSummary[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const editFormRef = useRef<HTMLFormElement | null>(null);
  const editingProduct =
    adminProducts.find((product) => product.slug === editingSlug) ?? null;
  const previewImageUrl = useMemo(() => {
    if (selectedImage) {
      return URL.createObjectURL(selectedImage);
    }

    return editingProduct?.imagen ?? null;
  }, [editingProduct?.imagen, selectedImage]);
  const previewExtraImageUrls = useMemo(
    () =>
      Array.from({ length: EXTRA_IMAGE_SLOTS }, (_, index) => {
        const file = selectedExtraImages[index];

        if (file) {
          return URL.createObjectURL(file);
        }

        return editingProduct?.imagenesExtra?.[index] ?? null;
      }),
    [editingProduct?.imagenesExtra, selectedExtraImages],
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
  const filteredProducts = useMemo(() => {
    const search = editSearch.trim().toLowerCase();

    return adminProducts.filter((product) => {
      const matchesCategory =
        editCategoryFilter === "Todas" || product.categoria === editCategoryFilter;
      const matchesSearch =
        search.length === 0 ||
        product.nombre.toLowerCase().includes(search) ||
        product.marca.toLowerCase().includes(search) ||
        (product.sku || "").toLowerCase().includes(search);
      const matchesInventory =
        inventoryStatusFilter === "all" ||
        product.estadoInventario === inventoryStatusFilter;

      return matchesCategory && matchesSearch && matchesInventory;
    });
  }, [adminProducts, editCategoryFilter, editSearch, inventoryStatusFilter]);

  const productCountLabel = `${adminProducts.length} producto${adminProducts.length === 1 ? "" : "s"} en catálogo`;

  useEffect(() => {
    if (previewImageUrl?.startsWith("blob:")) {
      return () => {
        URL.revokeObjectURL(previewImageUrl);
      };
    }
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

  useEffect(() => {
    if (!toast) return;

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 2800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast]);

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/account");

      if (!response.ok) {
        setIsAuthenticated(false);
        setAdminName("");
        setIsCheckingSession(false);
        return;
      }

      const payload = (await response.json()) as {
        user?: { fullName: string; role: "CUSTOMER" | "ADMIN" };
      };

      if (payload.user?.role === "ADMIN") {
        setIsAuthenticated(true);
        setAdminName(payload.user.fullName);
      } else {
        setIsAuthenticated(false);
        setAdminName("");
      }

      setIsCheckingSession(false);
    })();
  }, []);

  useEffect(() => {
    if (activeTab === "edit" && editingSlug && editFormRef.current) {
      editFormRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [activeTab, editingSlug]);

  useEffect(() => {
    if (!isCheckingSession && !isAuthenticated) {
      router.replace("/login?next=/admin");
    }
  }, [isAuthenticated, isCheckingSession, router]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (file && file.size > MAX_FILE_SIZE_BYTES) {
      setRequestError("La imagen supera el límite de 3 MB. Intenta con una versión más liviana.");
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
        setRequestError("Una de las imágenes extra supera el límite de 3 MB. Intenta con una versión más liviana.");
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

  const uploadProductImage = async (file: File, productName: string) => {
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("productName", productName);

    const uploadResponse = await fetch("/api/uploads", {
      method: "POST",
      body: uploadData,
    });

    const uploadPayload = (await uploadResponse.json()) as {
      error?: string;
      publicUrl?: string;
    };

    if (!uploadResponse.ok || !uploadPayload.publicUrl) {
      throw new Error(
        uploadPayload.error || "No fue posible subir la imagen a Supabase Storage.",
      );
    }

    return uploadPayload.publicUrl;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingProduct(true);
    setRequestError("");
    setToast(null);
    const isEditing = Boolean(editingSlug);

    if (!editingSlug && !selectedImage) {
      setIsSavingProduct(false);
      setRequestError("Selecciona una imagen para el producto.");
      setToast({
        tone: "error",
        message: "Selecciona una imagen antes de guardar el producto.",
      });
      return;
    }

    let imageUrl =
      adminProducts.find((product) => product.slug === editingSlug)?.imagen ||
      "/hero-unipars.jpg";

    try {
      if (selectedImage) {
        imageUrl = await uploadProductImage(selectedImage, form.nombre);
      }

      const currentExtraImages =
        adminProducts.find((product) => product.slug === editingSlug)?.imagenesExtra || [];
      const extraImageUrls = await Promise.all(
        Array.from({ length: EXTRA_IMAGE_SLOTS }, async (_, index) => {
          const selectedFile = selectedExtraImages[index];

          if (selectedFile) {
            return await uploadProductImage(
              selectedFile,
              `${form.nombre}-extra-${index + 1}`,
            );
          }

          return currentExtraImages[index] || null;
        }),
      );

      const orderedImages = [imageUrl, ...extraImageUrls];
      const nextPrimaryImage = orderedImages[primaryImageIndex];

      if (!nextPrimaryImage) {
        setIsSavingProduct(false);
        setRequestError("Selecciona una imagen válida como principal.");
        setToast({
          tone: "error",
          message: "Selecciona una imagen válida como principal.",
        });
        return;
      }

      const reorderedExtraImages = orderedImages.filter(
        (image, index): image is string =>
          index !== primaryImageIndex && Boolean(image),
      );

      const payload = {
        sku: form.sku,
        categoria: form.categoria,
        nombre: form.nombre,
        marca: form.marca,
        precioValor: Number(form.precioValor),
        precioAnteriorValor: Number(form.precioAnteriorValor || form.precioValor),
        stock: Number(form.stock),
        stockMinimo: Number(form.stockMinimo),
        imagen: nextPrimaryImage,
        imagenesExtra: reorderedExtraImages.slice(0, EXTRA_IMAGE_SLOTS),
        disponibilidad: form.disponibilidad,
      };
      const result = editingSlug
        ? await updateProduct(editingSlug, payload)
        : await createProduct(payload);

      setIsSavingProduct(false);

      if (!result.ok) {
        setRequestError(result.message);
        setToast({
          tone: "error",
          message: result.message,
        });
        return;
      }

      setForm(initialState);
      setSelectedImage(null);
      setSelectedExtraImages(Array.from({ length: EXTRA_IMAGE_SLOTS }, () => null));
      setPrimaryImageIndex(0);
      setFileInputKey((current) => current + 1);
      setEditingSlug(null);
      setActiveTab(null);
      setSaved(true);
      setToast({
        tone: "success",
        message: isEditing
          ? "Producto editado correctamente."
          : "Producto creado correctamente.",
      });
      window.setTimeout(() => setSaved(false), 1800);
    } catch (error) {
      setIsSavingProduct(false);
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible subir una de las imágenes.";
      setRequestError(message);
      setToast({
        tone: "error",
        message,
      });
    }
  };

  const handleEditProduct = (slug: string) => {
    const product = adminProducts.find((item) => item.slug === slug);
    if (!product) return;

    const precioAnteriorValor = Number(product.precioAnterior.replace(/\D/g, "")) || product.precioValor;

    setForm({
      sku: product.sku || "",
      categoria: product.categoria,
      nombre: product.nombre,
      marca: product.marca,
      precioValor: String(product.precioValor),
      precioAnteriorValor: String(precioAnteriorValor),
      stock: String(product.stock ?? 0),
      stockMinimo: String(product.stockMinimo ?? 0),
      disponibilidad: product.disponibilidad,
    });
    setEditingSlug(product.slug);
    setActiveTab("edit");
    setSelectedImage(null);
    setSelectedExtraImages(Array.from({ length: EXTRA_IMAGE_SLOTS }, () => null));
    setPrimaryImageIndex(0);
    setRequestError("");
    setFileInputKey((current) => current + 1);
  };

  const handleResetForm = () => {
    setForm(initialState);
    setSelectedImage(null);
    setSelectedExtraImages(Array.from({ length: EXTRA_IMAGE_SLOTS }, () => null));
    setPrimaryImageIndex(0);
    setEditingSlug(null);
    setRequestError("");
    setFileInputKey((current) => current + 1);
    setActiveTab(null);
  };

  const handleDeleteProduct = async (slug: string) => {
    setRequestError("");
    setToast(null);
    const result = await removeProduct(slug);

    if (!result.ok) {
      setRequestError(result.message);
      setToast({
        tone: "error",
        message: result.message,
      });
      return;
    }

    setToast({
      tone: "success",
      message: "Producto eliminado correctamente.",
    });
  };

  async function loadInventoryMovements() {
    setIsLoadingInventory(true);
    const response = await fetch("/api/inventory");
    const payload = (await response.json()) as {
      error?: string;
      movements?: InventoryMovementSummary[];
    };

    setIsLoadingInventory(false);

    if (!response.ok || !payload.movements) {
      setToast({
        tone: "error",
        message:
          payload.error || "No fue posible cargar los movimientos de inventario.",
      });
      return;
    }

    setInventoryMovements(payload.movements);
  }

  const handleQuickInventoryAdjust = async (
    slug: string,
    quantity: number,
    note?: string,
  ) => {
    setRequestError("");
    setToast(null);

    const result = await adjustInventory(slug, quantity, note);

    if (!result.ok) {
      setToast({
        tone: "error",
        message: result.message,
      });
      return;
    }

    setInventoryAdjustments((current) => ({ ...current, [slug]: "" }));
    setToast({
      tone: "success",
      message: "Inventario ajustado correctamente.",
    });
    await loadInventoryMovements();
  };

  const openCreateView = () => {
    setForm(initialState);
    setSelectedImage(null);
    setSelectedExtraImages(Array.from({ length: EXTRA_IMAGE_SLOTS }, () => null));
    setPrimaryImageIndex(0);
    setEditingSlug(null);
    setRequestError("");
    setFileInputKey((current) => current + 1);
    setActiveTab("create");
  };

  const openEditView = () => {
    setSelectedImage(null);
    setRequestError("");
    setPrimaryImageIndex(0);
    setActiveTab("edit");
  };

  const openInventoryView = () => {
    setSelectedImage(null);
    setRequestError("");
    setPrimaryImageIndex(0);
    setEditingSlug(null);
    setInventoryStatusFilter("all");
    setActiveTab("inventory");
    void loadInventoryMovements();
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    setIsAuthenticated(false);
    setAdminName("");
    router.refresh();
  };

  if (isCheckingSession) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] text-[#111]">
        <section className="mx-auto flex max-w-[1440px] px-6 py-16">
          <div className="mx-auto w-full max-w-md rounded-[2rem] border border-black/8 bg-white p-8 text-center shadow-[0_16px_35px_rgba(15,23,42,0.05)]">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#ed8435]">
              Administrador
            </p>
            <p className="mt-4 text-sm text-[#6e7379]">
              Verificando acceso al panel...
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] text-[#111]">
        <section className="mx-auto flex max-w-[1440px] px-6 py-16">
          <div className="mx-auto w-full max-w-md rounded-[2rem] border border-black/8 bg-white p-8 text-center shadow-[0_16px_35px_rgba(15,23,42,0.05)]">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#ed8435]">
              Administrador
            </p>
            <p className="mt-4 text-sm leading-7 text-[#6e7379]">
              Redirigiendo al ingreso general para validar tu cuenta.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5] text-[#111]">
      {toast && (
        <div className="fixed right-5 top-5 z-[80] w-[min(92vw,380px)]">
          <div
            className={`rounded-[1.4rem] border px-5 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.16)] backdrop-blur-sm ${
              toast.tone === "success"
                ? "border-[#1f8b45]/18 bg-[#effaf2] text-[#1f6b39]"
                : "border-[#ed8435]/18 bg-[#fff6ee] text-[#b85d12]"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em]">
                  {toast.tone === "success" ? "Correcto" : "Atención"}
                </p>
                <p className="mt-2 text-sm font-medium leading-6">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-lg leading-none opacity-60 transition-opacity duration-200 hover:opacity-100"
                aria-label="Cerrar notificación"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="mx-auto max-w-[1440px] px-6 py-16">
        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.35em] text-[#8b8d91]">
              Gestión interna
            </p>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#4f545a] md:text-6xl">
              Administrador de productos
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#6e7379]">
              Desde aquí puedes crear productos nuevos para que aparezcan en el
              catálogo y queden guardados en Supabase sin modificar el código.
            </p>
            {adminName && (
              <p className="mt-3 text-sm font-medium text-[#16384f]">
                Sesión activa: {adminName}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/categorias"
              className="inline-flex rounded-full border border-[#16384f]/15 px-5 py-3 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
            >
              Ver catálogo
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="admin-fade-up overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="relative px-6 py-10 md:px-10 md:py-14">
              <div className="admin-glow absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(237,132,53,0.26),_rgba(237,132,53,0.06)_55%,_transparent_72%)] blur-2xl" />
              <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,_rgba(237,132,53,0.16),_transparent_58%)]" />
              <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.38em] text-[#8b8d91]">
                  Flujo de administración
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[#1f2328] md:text-5xl">
                  Gestiona el catálogo con una vista más limpia
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6e7379] md:text-base">
                  {productCountLabel}. Elige una acción para abrir solo el módulo que necesitas.
                </p>

                <div className="mt-8 flex w-full max-w-2xl flex-col gap-4 md:flex-row md:justify-center">
                  <button
                    type="button"
                    onClick={openCreateView}
                    className={`admin-card-drift relative flex-1 overflow-hidden rounded-[1.6rem] border px-6 py-6 text-left transition-all duration-200 ${
                      activeTab === "create"
                        ? "border-[#16384f] bg-[#16384f] text-white shadow-[0_18px_35px_rgba(22,56,79,0.22)]"
                        : "border-black/8 bg-[#fbfbfa] text-[#1f2328] hover:-translate-y-0.5 hover:border-[#16384f]/18 hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)]"
                    }`}
                  >
                    <span className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[radial-gradient(circle,_rgba(237,132,53,0.16),_transparent_68%)]" />
                    <span className="flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold uppercase tracking-[0.18em]">
                        Crear
                      </span>
                      <span
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 ${
                          activeTab === "create"
                            ? "bg-white/14 text-white"
                            : "bg-[#16384f] text-white"
                        }`}
                      >
                        +
                      </span>
                    </span>
                    <p
                      className={`mt-4 text-2xl font-semibold tracking-[-0.04em] ${
                        activeTab === "create" ? "text-white" : "text-[#16384f]"
                      }`}
                    >
                      Crear producto
                    </p>
                    <p
                      className={`mt-2 text-sm leading-6 ${
                        activeTab === "create" ? "text-white/78" : "text-[#6e7379]"
                      }`}
                    >
                      Abre un formulario limpio para cargar un producto nuevo con imagen y precios.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={openEditView}
                    className={`admin-card-drift relative flex-1 overflow-hidden rounded-[1.6rem] border px-6 py-6 text-left transition-all duration-200 ${
                      activeTab === "edit"
                        ? "border-[#16384f] bg-[#16384f] text-white shadow-[0_18px_35px_rgba(22,56,79,0.22)]"
                        : "border-black/8 bg-[#fbfbfa] text-[#1f2328] hover:-translate-y-0.5 hover:border-[#16384f]/18 hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)]"
                    }`}
                  >
                    <span className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-[radial-gradient(circle,_rgba(22,56,79,0.12),_transparent_68%)]" />
                    <span className="flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold uppercase tracking-[0.18em]">
                        Editar
                      </span>
                      <span
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 ${
                          activeTab === "edit"
                            ? "bg-white/14 text-white"
                            : "bg-[#ed8435] text-white"
                        }`}
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 20h9" />
                          <path d="m16.5 3.5 4 4L7 21l-4 1 1-4Z" />
                        </svg>
                      </span>
                    </span>
                    <p
                      className={`mt-4 text-2xl font-semibold tracking-[-0.04em] ${
                        activeTab === "edit" ? "text-white" : "text-[#16384f]"
                      }`}
                    >
                      Editar productos
                    </p>
                    <p
                      className={`mt-2 text-sm leading-6 ${
                        activeTab === "edit" ? "text-white/78" : "text-[#6e7379]"
                      }`}
                    >
                      Explora la grilla del catálogo, filtra productos y abre solo el editor que vas a tocar.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={openInventoryView}
                    className={`admin-card-drift relative flex-1 overflow-hidden rounded-[1.6rem] border px-6 py-6 text-left transition-all duration-200 ${
                      activeTab === "inventory"
                        ? "border-[#16384f] bg-[#16384f] text-white shadow-[0_18px_35px_rgba(22,56,79,0.22)]"
                        : "border-black/8 bg-[#fbfbfa] text-[#1f2328] hover:-translate-y-0.5 hover:border-[#16384f]/18 hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)]"
                    }`}
                  >
                    <span className="pointer-events-none absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-[radial-gradient(circle,_rgba(31,139,69,0.16),_transparent_68%)]" />
                    <span className="flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold uppercase tracking-[0.18em]">
                        Inventario
                      </span>
                      <span
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 ${
                          activeTab === "inventory"
                            ? "bg-white/14 text-white"
                            : "bg-[#1f8b45] text-white"
                        }`}
                      >
                        ≡
                      </span>
                    </span>
                    <p
                      className={`mt-4 text-2xl font-semibold tracking-[-0.04em] ${
                        activeTab === "inventory" ? "text-white" : "text-[#16384f]"
                      }`}
                    >
                      Inventario
                    </p>
                    <p
                      className={`mt-2 text-sm leading-6 ${
                        activeTab === "inventory" ? "text-white/78" : "text-[#6e7379]"
                      }`}
                    >
                      Ajusta stock rápido, detecta productos agotados y revisa movimientos recientes.
                    </p>
                  </button>
                </div>

                {activeTab && (
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="mt-6 inline-flex rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold text-[#5d6167] transition-colors duration-200 hover:border-[#16384f]/18 hover:bg-[#16384f] hover:text-white"
                  >
                    Volver a vista limpia
                  </button>
                )}
              </div>
            </div>
          </div>

          {!activeTab && (
            <div className="admin-fade-up rounded-[2rem] border border-dashed border-[#16384f]/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,248,247,0.92))] px-6 py-14 text-center shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
              <div className="mx-auto max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#8b8d91]">
                  Panel en espera
                </p>
                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#16384f]">
                  Elige una acción para empezar
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#6e7379]">
                  Mantuvimos esta vista despejada para que el administrador no vea formularios hasta
                  decidir si quiere crear o editar.
                </p>
              </div>
            </div>
          )}

          {activeTab === "create" && (
            <form
              onSubmit={handleSubmit}
              className="admin-fade-up rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_16px_35px_rgba(15,23,42,0.05)] md:p-8"
            >
              <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b8d91]">
                    Nuevo producto
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#16384f]">
                    Crear producto
                  </h2>
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
                    <span className="text-sm font-medium text-[#4f545a]">Categoría</span>
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
                  <span className="text-sm font-medium text-[#4f545a]">Stock mínimo</span>
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
                    Sube la foto directamente aquí. Formatos permitidos: JPG, PNG o WEBP.
                  </p>
                  <p className="text-xs leading-6 text-[#6e7379]">
                    Recomendado: hasta {RECOMMENDED_FILE_SIZE_KB} KB por imagen. Límite máximo: 3 MB.
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
                      key={`create-extra-${index}`}
                      className="space-y-2 rounded-[1.4rem] border border-black/8 bg-[#fafaf9] p-4"
                    >
                      <span className="text-sm font-medium text-[#4f545a]">
                        Imagen extra {index + 1}
                      </span>
                      <input
                        key={`${fileInputKey}-create-extra-${index}`}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleExtraImageChange(index)}
                        className="w-full rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 file:mr-3 file:rounded-full file:border-0 file:bg-[#16384f] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-[#0f2a3b]"
                      />
                      <p className="text-xs leading-6 text-[#6e7379]">
                        Opcional. Se mostrará como miniatura en la galería.
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
                            className="h-28 w-full object-contain bg-white"
                            unoptimized={previewExtraImageUrls[index]?.startsWith("blob:")}
                          />
                        </div>
                      )}
                    </label>
                  ))}
                </div>

                {previewImageUrl && (
                  <div className="md:col-span-2 rounded-[1.5rem] border border-black/8 bg-[#fafaf9] p-4">
                    <p className="text-sm font-medium text-[#4f545a]">
                      Vista previa de la nueva imagen
                    </p>
                    <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-black/8 bg-white">
                      <Image
                        src={previewImageUrl}
                        alt={form.nombre || "Vista previa del producto"}
                        width={1200}
                        height={900}
                        className="h-64 w-full object-contain bg-white"
                        unoptimized={previewImageUrl.startsWith("blob:")}
                      />
                    </div>
                  </div>
                )}

                <ProductImageSelector
                  choices={productImageChoices}
                  primaryImageIndex={primaryImageIndex}
                  onSelect={setPrimaryImageIndex}
                  description="Puedes escoger cuál de las imágenes será la principal del producto."
                />

                <label className="space-y-2 md:col-span-2">
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
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {requestError && (
                  <p className="w-full rounded-2xl border border-[#ed8435]/20 bg-[#fff6ee] px-4 py-3 text-sm font-medium text-[#b85d12]">
                    {requestError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="inline-flex rounded-full bg-[#ed8435] px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#d67024]"
                >
                  {isSavingProduct ? "Guardando..." : "Crear producto"}
                </button>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="inline-flex rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
                >
                  Limpiar
                </button>
              </div>
            </form>
          )}

          {activeTab === "edit" && (
            <div className="admin-fade-up space-y-8">
              <div className="grid gap-8 xl:grid-cols-[300px_minmax(0,1fr)]">
                <aside className="space-y-5">
                  <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b8d91]">
                      Edición
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#16384f]">
                      Productos
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-[#6e7379]">
                      Usa la misma lógica visual del catálogo para encontrar el producto y editarlo más rápido.
                    </p>
                    {editingSlug && (
                      <button
                        type="button"
                        onClick={handleResetForm}
                        className="mt-5 inline-flex rounded-full border border-black/10 bg-[#f8f8f7] px-5 py-3 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
                      >
                        Salir de edición
                      </button>
                    )}
                  </div>

                  <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-[#16384f]">
                      Categorías
                    </h3>
                    <div className="mt-4 space-y-2">
                      <button
                        type="button"
                        onClick={() => setEditCategoryFilter("Todas")}
                        className={`block w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors duration-200 ${
                          editCategoryFilter === "Todas"
                            ? "bg-[#16384f] text-white shadow-[0_12px_24px_rgba(22,56,79,0.18)]"
                            : "bg-[#f8f8f7] text-[#5d6167] hover:bg-[#ececea]"
                        }`}
                      >
                        Todas
                      </button>
                      {categorias.map((categoria) => (
                        <button
                          key={categoria}
                          type="button"
                          onClick={() => setEditCategoryFilter(categoria)}
                          className={`block w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors duration-200 ${
                            editCategoryFilter === categoria
                              ? "bg-[#16384f] text-white shadow-[0_12px_24px_rgba(22,56,79,0.18)]"
                              : "bg-[#f8f8f7] text-[#5d6167] hover:bg-[#ececea]"
                          }`}
                        >
                          {categoria}
                        </button>
                      ))}
                    </div>
                  </div>
                </aside>

                <div className="space-y-8">
                  <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-[#4f545a]">
                        Buscar por nombre o marca
                      </span>
                      <input
                        type="search"
                        value={editSearch}
                        onChange={(event) => setEditSearch(event.target.value)}
                        placeholder="Ej: farola, Unipars, ventilador..."
                        className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
                      />
                    </label>

                    <p className="mt-4 text-sm text-[#6e7379]">
                      Mostrando {filteredProducts.length} producto{filteredProducts.length === 1 ? "" : "s"} según los filtros actuales.
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {filteredProducts.map((product) => {
                      const inventoryTone = getInventoryTone(product.estadoInventario);

                      return (
                        <article
                          key={product.slug}
                          className={`overflow-hidden rounded-[1.75rem] border bg-white shadow-[0_16px_35px_rgba(15,23,42,0.05)] transition-transform duration-300 hover:-translate-y-1 ${
                            editingSlug === product.slug
                              ? "border-[#16384f] ring-2 ring-[#16384f]/12"
                              : "border-black/8"
                          }`}
                        >
                        <div className="relative">
                          <span className="absolute left-4 top-4 z-10 rounded-lg bg-[#ed8435] px-3 py-1 text-sm font-semibold text-white">
                            {product.descuento}
                          </span>
                          <Image
                            src={product.imagen}
                            alt={product.nombre}
                            width={900}
                            height={700}
                            className="h-56 w-full object-cover"
                          />
                        </div>

                        <div className="space-y-4 p-5">
                          <div>
                            <p className="mb-2 text-xs font-medium uppercase tracking-[0.24em] text-[#8b8d91]">
                              {product.categoria} · {product.marca}
                            </p>
                            <h3 className="text-xl font-semibold leading-tight tracking-[-0.03em] text-[#1f2328]">
                              {product.nombre}
                            </h3>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="text-[#6e7379]">{product.disponibilidad}</span>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${inventoryTone.className}`}
                            >
                              {inventoryTone.label}
                            </span>
                          </div>

                          <div className="rounded-[1rem] border border-black/8 bg-[#fafaf9] px-4 py-3 text-sm text-[#5d6167]">
                            <div className="flex items-center justify-between gap-3">
                              <span>SKU</span>
                              <span className="font-semibold text-[#16384f]">
                                {product.sku || "Sin SKU"}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-3">
                              <span>Stock</span>
                              <span className="font-semibold text-[#16384f]">
                                {product.stock ?? 0}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-3">
                              <span>Stock mínimo</span>
                              <span className="font-semibold text-[#16384f]">
                                {product.stockMinimo ?? 0}
                              </span>
                            </div>
                          </div>

                          <div className="border-t border-black/6 pt-4">
                            <p className="text-sm text-[#a0a3a8] line-through">
                              {product.precioAnterior}
                            </p>
                            <p className="text-3xl font-semibold tracking-[-0.03em] text-[#ed8435]">
                              {product.precio}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => handleEditProduct(product.slug)}
                              className="inline-flex rounded-full bg-[#16384f] px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0f2a3b]"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(product.slug)}
                              className="inline-flex rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                        </article>
                      );
                    })}
                  </div>

                  {filteredProducts.length === 0 && (
                    <div className="rounded-[1.75rem] border border-dashed border-black/12 bg-white p-10 text-center text-[#6e7379]">
                      No encontramos productos con ese nombre, marca o categoría.
                    </div>
                  )}
                </div>
              </div>

              {editingSlug && (
                <form
                  ref={editFormRef}
                  onSubmit={handleSubmit}
                  className="admin-fade-up rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_16px_35px_rgba(15,23,42,0.05)] md:p-8"
                >
                  <div className="mb-8 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b8d91]">
                        Producto seleccionado
                      </p>
                      <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#16384f]">
                        Actualizar producto
                      </h2>
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
                      <span className="text-sm font-medium text-[#4f545a]">Categoría</span>
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
                      <span className="text-sm font-medium text-[#4f545a]">Stock mínimo</span>
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
                      <span className="text-sm font-medium text-[#4f545a]">
                        Cambiar imagen en Supabase Storage
                      </span>
                      <input
                        key={fileInputKey}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 file:mr-4 file:rounded-full file:border-0 file:bg-[#16384f] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#0f2a3b]"
                      />
                      <p className="text-xs leading-6 text-[#6e7379]">
                        Si no subes una nueva imagen, se conserva la actual.
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
                          key={`edit-extra-${index}`}
                          className="space-y-2 rounded-[1.4rem] border border-black/8 bg-[#fafaf9] p-4"
                        >
                          <span className="text-sm font-medium text-[#4f545a]">
                            Imagen extra {index + 1}
                          </span>
                          <input
                            key={`${fileInputKey}-edit-extra-${index}`}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleExtraImageChange(index)}
                            className="w-full rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 file:mr-3 file:rounded-full file:border-0 file:bg-[#16384f] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-[#0f2a3b]"
                          />
                          <p className="text-xs leading-6 text-[#6e7379]">
                            Opcional. Si no subes una nueva, se conserva la actual.
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
                                alt={`Imagen extra ${index + 1}`}
                                width={500}
                                height={500}
                                className="h-28 w-full object-contain bg-white"
                                unoptimized={previewExtraImageUrls[index]?.startsWith("blob:")}
                              />
                            </div>
                          )}
                        </label>
                      ))}
                    </div>

                    {previewImageUrl && (
                      <div className="md:col-span-2 rounded-[1.5rem] border border-black/8 bg-[#fafaf9] p-4">
                        <p className="text-sm font-medium text-[#4f545a]">
                          {selectedImage ? "Vista previa de la nueva imagen" : "Imagen actual del producto"}
                        </p>
                        <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-black/8 bg-white">
                          <Image
                            src={previewImageUrl}
                            alt={form.nombre || "Vista previa del producto"}
                            width={1200}
                            height={900}
                            className="h-64 w-full object-contain bg-white"
                            unoptimized={previewImageUrl.startsWith("blob:")}
                          />
                        </div>
                      </div>
                    )}

                    <ProductImageSelector
                      choices={productImageChoices}
                      primaryImageIndex={primaryImageIndex}
                      onSelect={setPrimaryImageIndex}
                      description="La imagen marcada como principal será la que verá primero el cliente."
                    />

                    <label className="space-y-2 md:col-span-2">
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
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    {requestError && (
                      <p className="w-full rounded-2xl border border-[#ed8435]/20 bg-[#fff6ee] px-4 py-3 text-sm font-medium text-[#b85d12]">
                        {requestError}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={isSavingProduct}
                      className="inline-flex rounded-full bg-[#ed8435] px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#d67024]"
                    >
                      {isSavingProduct ? "Guardando..." : "Guardar cambios"}
                    </button>
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="inline-flex rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
                    >
                      Cancelar edición
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="admin-fade-up space-y-8">
              <div className="grid gap-8 xl:grid-cols-[300px_minmax(0,1fr)]">
                <aside className="space-y-5">
                  <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b8d91]">
                      Inventario
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#16384f]">
                      Control rápido
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-[#6e7379]">
                      Ajusta existencias sin abrir el editor completo y revisa los últimos movimientos del stock.
                    </p>
                  </div>

                  <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-[#16384f]">
                      Categorías
                    </h3>
                    <div className="mt-4 space-y-2">
                      <button
                        type="button"
                        onClick={() => setEditCategoryFilter("Todas")}
                        className={`block w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors duration-200 ${
                          editCategoryFilter === "Todas"
                            ? "bg-[#16384f] text-white shadow-[0_12px_24px_rgba(22,56,79,0.18)]"
                            : "bg-[#f8f8f7] text-[#5d6167] hover:bg-[#ececea]"
                        }`}
                      >
                        Todas
                      </button>
                      {categorias.map((categoria) => (
                        <button
                          key={categoria}
                          type="button"
                          onClick={() => setEditCategoryFilter(categoria)}
                          className={`block w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors duration-200 ${
                            editCategoryFilter === categoria
                              ? "bg-[#16384f] text-white shadow-[0_12px_24px_rgba(22,56,79,0.18)]"
                              : "bg-[#f8f8f7] text-[#5d6167] hover:bg-[#ececea]"
                          }`}
                        >
                          {categoria}
                        </button>
                      ))}
                    </div>
                  </div>
                </aside>

                <div className="space-y-8">
                  <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-[#4f545a]">
                        Buscar por nombre, marca o SKU
                      </span>
                      <input
                        type="search"
                        value={editSearch}
                        onChange={(event) => setEditSearch(event.target.value)}
                        placeholder="Ej: farola, Unipars, FAROLA001..."
                        className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
                      />
                    </label>

                    <p className="mt-4 text-sm text-[#6e7379]">
                      Mostrando {filteredProducts.length} producto{filteredProducts.length === 1 ? "" : "s"} para control de stock.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setInventoryStatusFilter("all")}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                          inventoryStatusFilter === "all"
                            ? "bg-[#16384f] text-white"
                            : "border border-black/10 bg-[#fafaf9] text-[#5d6167] hover:bg-[#ececea]"
                        }`}
                      >
                        Todos
                      </button>
                      <button
                        type="button"
                        onClick={() => setInventoryStatusFilter("low-stock")}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                          inventoryStatusFilter === "low-stock"
                            ? "bg-[#ed8435] text-white"
                            : "border border-[#ed8435]/20 bg-[#fff6ee] text-[#b85d12] hover:bg-[#ffe9d8]"
                        }`}
                      >
                        Solo stock bajo
                      </button>
                      <button
                        type="button"
                        onClick={() => setInventoryStatusFilter("out-of-stock")}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                          inventoryStatusFilter === "out-of-stock"
                            ? "bg-[#c53b3b] text-white"
                            : "border border-[#c53b3b]/20 bg-[#fff1f1] text-[#c53b3b] hover:bg-[#ffe2e2]"
                        }`}
                      >
                        Solo agotados
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {filteredProducts.map((product) => {
                      const inventoryTone = getInventoryTone(product.estadoInventario);
                      const adjustmentValue = inventoryAdjustments[product.slug] || "";

                      return (
                        <article
                          key={`inventory-${product.slug}`}
                          className="rounded-[1.5rem] border border-black/8 bg-white p-5 shadow-[0_14px_28px_rgba(15,23,42,0.05)]"
                        >
                          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                              <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#8b8d91]">
                                {product.categoria} · {product.marca}
                              </p>
                              <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#1f2328]">
                                {product.nombre}
                              </h3>
                              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                                <span className="rounded-full border border-black/8 bg-[#fafaf9] px-3 py-1 text-[#5d6167]">
                                  SKU: {product.sku || "Sin SKU"}
                                </span>
                                <span className={`rounded-full px-3 py-1 font-semibold ${inventoryTone.className}`}>
                                  {inventoryTone.label}
                                </span>
                              </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[540px]">
                              <div className="rounded-[1.1rem] border border-black/8 bg-[#fafaf9] px-4 py-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                                  Stock actual
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-[#16384f]">
                                  {product.stock ?? 0}
                                </p>
                              </div>

                              <div className="rounded-[1.1rem] border border-black/8 bg-[#fafaf9] px-4 py-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                                  Stock mínimo
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-[#16384f]">
                                  {product.stockMinimo ?? 0}
                                </p>
                              </div>

                              <div className="rounded-[1.1rem] border border-black/8 bg-[#fafaf9] px-4 py-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                                  Ajuste rápido
                                </p>
                                <input
                                  type="number"
                                  value={adjustmentValue}
                                  onChange={(event) =>
                                    setInventoryAdjustments((current) => ({
                                      ...current,
                                      [product.slug]: event.target.value,
                                    }))
                                  }
                                  placeholder="+5 o -2"
                                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                handleQuickInventoryAdjust(
                                  product.slug,
                                  Number(adjustmentValue || 0),
                                )
                              }
                              className="inline-flex rounded-full bg-[#16384f] px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0f2a3b]"
                            >
                              Aplicar ajuste
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleQuickInventoryAdjust(
                                  product.slug,
                                  1,
                                  "Entrada rápida de una unidad",
                                )
                              }
                              className="inline-flex rounded-full border border-[#1f8b45]/20 bg-[#effaf2] px-5 py-3 text-sm font-semibold text-[#1f6b39] transition-colors duration-200 hover:bg-[#dcf5e4]"
                            >
                              +1 unidad
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleQuickInventoryAdjust(
                                  product.slug,
                                  -1,
                                  "Salida rápida de una unidad",
                                )
                              }
                              className="inline-flex rounded-full border border-[#ed8435]/20 bg-[#fff6ee] px-5 py-3 text-sm font-semibold text-[#b85d12] transition-colors duration-200 hover:bg-[#ffe9d8]"
                            >
                              -1 unidad
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditProduct(product.slug)}
                              className="inline-flex rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
                            >
                              Editar completo
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b8d91]">
                          Movimientos
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#16384f]">
                          Últimos cambios de inventario
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => void loadInventoryMovements()}
                        className="inline-flex rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
                      >
                        Recargar
                      </button>
                    </div>

                    <div className="mt-5 space-y-3">
                      {isLoadingInventory ? (
                        <p className="text-sm text-[#6e7379]">Cargando movimientos...</p>
                      ) : inventoryMovements.length === 0 ? (
                        <p className="text-sm text-[#6e7379]">
                          Aún no hay movimientos recientes para mostrar.
                        </p>
                      ) : (
                        inventoryMovements.map((movement) => (
                          <div
                            key={movement.id}
                            className="rounded-[1.1rem] border border-black/8 bg-[#fafaf9] px-4 py-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-[#1f2328]">
                                  {movement.productName}
                                </p>
                                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#8b8d91]">
                                  {movement.productSku || "Sin SKU"} · {movement.type}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className={`text-sm font-semibold ${movement.quantity >= 0 ? "text-[#1f6b39]" : "text-[#b85d12]"}`}>
                                  {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
                                </p>
                                <p className="mt-1 text-xs text-[#6e7379]">
                                  Stock final: {movement.stockAfter}
                                </p>
                              </div>
                            </div>
                            {movement.note && (
                              <p className="mt-3 text-sm text-[#5d6167]">{movement.note}</p>
                            )}
                            <p className="mt-2 text-xs text-[#8b8d91]">
                              {new Date(movement.createdAt).toLocaleString("es-CO")}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
