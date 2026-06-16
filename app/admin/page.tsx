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
import { useRouter } from "next/navigation";
import { useProducts } from "../components/products-provider";
import { categorias, type Categoria, type ProductoCatalogo } from "../data/catalog";
import type { ProductoEspecificacion } from "../data/catalog";
import type { InventoryMovementSummary } from "@/lib/products";
import type { ShippingStatus } from "@/lib/orders";
import type { VendorWithMetrics } from "@/lib/empresas";

const disponibilidades: ProductoCatalogo["disponibilidad"][] = [
  "Entrega inmediata",
  "Disponible por pedido",
  "Recoger en tienda",
];

type FormState = {
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

const initialState: FormState = {
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
const shippingStatuses: ShippingStatus[] = [
  "PENDING",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];
const paymentStatuses: Array<"PENDING" | "PAID" | "FAILED"> = [
  "PENDING",
  "PAID",
  "FAILED",
];

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

type ToastState = {
  tone: "success" | "error";
  message: string;
} | null;

type AdminOrder = {
  id: string;
  orderNumber: number;
  status: "PENDING" | "PAID" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  shippingStatus: ShippingStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  company: string | null;
  department: string;
  city: string;
  addressLine1: string;
  addressLine2: string | null;
  carrier: string | null;
  trackingNumber: string | null;
  adminNotes: string | null;
  shippedAt: string | Date | null;
  deliveredAt: string | Date | null;
  totalItems: number;
  subtotal: number;
  createdAt: string | Date;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  items: Array<{
    id: string;
    name: string;
    productId?: string | null;
    image?: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
};

type OrderEditState = {
  shippingStatus: ShippingStatus;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  carrier: string;
  trackingNumber: string;
  adminNotes: string;
};

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

function timeAgo(date: Date | string) {
  const ms = Date.now() - new Date(date).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 60) return `Hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Hace ${h} h`;
  return `Hace ${Math.floor(h / 24)} d`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function normalizeComparableText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getShippingStatusLabel(status: ShippingStatus) {
  if (status === "PREPARING") return "En preparación";
  if (status === "SHIPPED") return "Enviado";
  if (status === "DELIVERED") return "Entregado";
  if (status === "CANCELLED") return "Cancelado";
  return "Pendiente";
}

function getPaymentStatusLabel(status: "PENDING" | "PAID" | "FAILED") {
  if (status === "PAID") return "Pago confirmado";
  if (status === "FAILED") return "Pago fallido";
  return "Pago pendiente";
}

function getOrderEditState(order: AdminOrder): OrderEditState {
  return {
    shippingStatus: order.shippingStatus,
    paymentStatus: order.paymentStatus,
    carrier: order.carrier || "",
    trackingNumber: order.trackingNumber || "",
    adminNotes: order.adminNotes || "",
  };
}

function getDerivedOrderStatus(
  shippingStatus: ShippingStatus,
  paymentStatus: "PENDING" | "PAID" | "FAILED",
): AdminOrder["status"] {
  if (shippingStatus === "CANCELLED") return "CANCELLED";
  if (paymentStatus === "PAID") return "PAID";
  return "PENDING";
}

function getAdminOrderProgressStep(order: AdminOrder) {
  if (order.shippingStatus === "DELIVERED") return 3;
  if (order.shippingStatus === "SHIPPED") return 2;
  if (order.shippingStatus === "PREPARING") return 1;
  if (order.paymentStatus === "PAID" || order.status === "PAID") return 0;
  return -1;
}

function AdminOrderProgress({ order }: { order: AdminOrder }) {
  const activeStep = getAdminOrderProgressStep(order);
  const steps = [
    {
      label: "Pedido confirmado",
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 3h9l3 3v15H6z" />
          <path d="M15 3v3h3" />
          <path d="M9 12h6" />
          <path d="M9 16h4" />
        </svg>
      ),
    },
    {
      label: "En preparación",
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3 4 7l8 4 8-4-8-4Z" />
          <path d="M4 7v10l8 4 8-4V7" />
          <path d="M12 11v10" />
        </svg>
      ),
    },
    {
      label: "Enviado",
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 7h11v8H3z" />
          <path d="M14 10h3l4 3v2h-7z" />
          <circle cx="7.5" cy="17.5" r="1.5" />
          <circle cx="17.5" cy="17.5" r="1.5" />
        </svg>
      ),
    },
    {
      label: "Recibido",
      icon: (
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
          <path d="m5 12 4 4L19 6" />
        </svg>
      ),
    },
  ];

  return (
    <div className="rounded-[1.4rem] border border-black/8 bg-[#fafaf9] px-5 py-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
            Flujo del pedido
          </p>
          <p className="mt-2 text-sm leading-7 text-[#6e7379]">
            Muestra el mismo progreso que verá el cliente en su cuenta.
          </p>
        </div>
        <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#16384f] shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
          {getShippingStatusLabel(order.shippingStatus)}
        </span>
      </div>

      <div className="mt-5 overflow-x-auto">
        <div className="relative min-w-[620px] px-1 py-2">
          <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-6 z-0">
            <span className="block h-[6px] rounded-full bg-[#d9dde4] shadow-[inset_0_1px_2px_rgba(15,23,42,0.08)]" />
            <span
              className="absolute left-0 top-0 h-[6px] rounded-full bg-gradient-to-r from-[#ed8435] to-[#f4a261] shadow-[0_6px_16px_rgba(237,132,53,0.25)] transition-all duration-300"
              style={{
                width:
                  activeStep < 0
                    ? "0%"
                    : `${(activeStep / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>

          <div className="relative flex items-start justify-between gap-0">
            {steps.map((step, index) => {
              const isCompleted = activeStep >= 0 && index <= activeStep;
              const isCurrent = index === activeStep;

              return (
                <div
                  key={step.label}
                  className="relative flex min-w-[136px] flex-1 flex-col items-center text-center"
                >
                  <span
                    className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ${
                      isCompleted
                        ? "border-[#ed8435] bg-[#ed8435] text-white"
                        : "border-black/10 bg-[#f8f8f7] text-[#8b8d91]"
                    } ${isCurrent ? "shadow-[0_10px_24px_rgba(237,132,53,0.2)]" : ""}`}
                  >
                    {step.icon}
                  </span>
                  <div className="mt-3">
                    <p
                      className={`text-sm font-semibold ${
                        isCompleted ? "text-[#16384f]" : "text-[#8b8d91]"
                      }`}
                    >
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-[#ed8435]">
                        Actual
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
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
    <div className="md:col-span-2 rounded-[1.5rem] border border-black/8 bg-[#fafaf9] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#4f545a]">
            Ficha técnica del producto
          </p>
          <p className="mt-2 text-xs leading-6 text-[#6e7379]">
            Agrega solo las especificaciones que apliquen para este producto. Puedes dejar pocas o muchas.
          </p>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
        >
          Agregar especificación
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {items.length === 0 && (
          <div className="rounded-[1.2rem] border border-dashed border-black/12 bg-white px-4 py-5 text-sm text-[#6e7379]">
            Aún no hay especificaciones. Agrega las filas que necesites para esta categoría.
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
                placeholder="Escribe la especificación"
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

function splitCommaSeparatedValues(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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
  const [activeTab, setActiveTab] = useState<
    "create" | "edit" | "inventory" | "orders" | "vendors" | "ventas" | null
  >(null);
  const [editSearch, setEditSearch] = useState("");
  const [editCategoryFilter, setEditCategoryFilter] = useState<"Todas" | Categoria>("Todas");
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState<
    "all" | "low-stock" | "out-of-stock"
  >("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderShippingFilter, setOrderShippingFilter] = useState<
    "all" | ShippingStatus
  >("all");
  const [form, setForm] = useState<FormState>(initialState);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [existingPdfUrl, setExistingPdfUrl] = useState<string | null>(null);
  const [technicalSpecs, setTechnicalSpecs] = useState<TechnicalSpecFormItem[]>([
    createTechnicalSpecItem({ etiqueta: "Observaciones" }),
  ]);
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
  const [inventoryAdjustments, setInventoryAdjustments] = useState<Record<string, string>>({});
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovementSummary[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderForm, setOrderForm] = useState<OrderEditState>({
    shippingStatus: "PENDING",
    paymentStatus: "PENDING",
    carrier: "",
    trackingNumber: "",
    adminNotes: "",
  });
  const [userName, setUserName] = useState("");
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [adminStats, setAdminStats] = useState<{
    totalRevenue: number;
    totalUnits: number;
    totalOrders: number;
    topProducts: { id: string; name: string; slug: string; category: string; units: number; revenue: number }[];
    monthlySales: { label: string; revenue: number; units: number }[];
  } | null>(null);
  const [vendors, setVendors] = useState<VendorWithMetrics[]>([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [vendorNotes, setVendorNotes] = useState<Record<string, string>>({});
  const [isSavingVendor, setIsSavingVendor] = useState<string | null>(null);
  const [vendorExpandedId, setVendorExpandedId] = useState<string | null>(null);
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
  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) ?? null;
  const selectedOrderPreview = useMemo(() => {
    if (!selectedOrder) return null;

    return {
      ...selectedOrder,
      status: getDerivedOrderStatus(
        orderForm.shippingStatus,
        orderForm.paymentStatus,
      ),
      shippingStatus: orderForm.shippingStatus,
      paymentStatus: orderForm.paymentStatus,
      carrier: orderForm.carrier.trim() || null,
      trackingNumber: orderForm.trackingNumber.trim() || null,
      adminNotes: orderForm.adminNotes.trim() || null,
    };
  }, [orderForm, selectedOrder]);
  const filteredProducts = useMemo(() => {
    const search = editSearch.trim().toLowerCase();

    return adminProducts.filter((product) => {
      const matchesBrand = product.marca === "Unipars";
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

      return matchesBrand && matchesCategory && matchesSearch && matchesInventory;
    });
  }, [adminProducts, editCategoryFilter, editSearch, inventoryStatusFilter]);
  const filteredOrders = useMemo(() => {
    const search = orderSearch.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesFilter =
        orderShippingFilter === "all" || order.shippingStatus === orderShippingFilter;
      const matchesSearch =
        search.length === 0 ||
        order.id.toLowerCase().includes(search) ||
        String(order.orderNumber).includes(search) ||
        order.customerName.toLowerCase().includes(search) ||
        order.customerEmail.toLowerCase().includes(search) ||
        order.city.toLowerCase().includes(search) ||
        (order.trackingNumber || "").toLowerCase().includes(search);

      return matchesFilter && matchesSearch;
    });
  }, [orderSearch, orderShippingFilter, orders]);

  const uniparsProducts = adminProducts.filter((p) => p.marca === "Unipars");
  const productCountLabel = `${uniparsProducts.length} producto${uniparsProducts.length === 1 ? "" : "s"} en catálogo`;
  const firstName = userName.split(" ")[0] || "Admin";
  const inStockCount = adminProducts.filter((p) => p.estadoInventario !== "out-of-stock").length;
  const outOfStockCount = adminProducts.filter((p) => p.estadoInventario === "out-of-stock").length;
  const lowStockCount = adminProducts.filter((p) => p.estadoInventario === "low-stock").length;
  const availabilityPct = adminProducts.length > 0 ? Math.round((inStockCount / adminProducts.length) * 100) : 100;

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
      const response = await fetch("/api/account", {
        credentials: "include",
      });

      if (!response.ok) {
        setIsAuthenticated(false);
        setIsCheckingSession(false);
        return;
      }

      const payload = (await response.json()) as {
        user?: { fullName: string; role: "CUSTOMER" | "ADMIN" };
      };

      if (payload.user?.role === "ADMIN") {
        setIsAuthenticated(true);
        setUserName(payload.user.fullName || "");
      } else {
        setIsAuthenticated(false);
      }

      setIsCheckingSession(false);
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/inventory");
        const d = (await res.json()) as { movements?: InventoryMovementSummary[] };
        if (res.ok && d.movements) setInventoryMovements(d.movements);
      } catch { /* silent */ }
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

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json() as typeof adminStats;
          setAdminStats(data);
        }
      } catch { /* silent */ }
    })();
  }, []);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
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

  const uploadPdf = async (file: File, productName: string) => {
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("productName", productName);
    const res = await fetch("/api/uploads", {
      method: "POST",
      body: uploadData,
      credentials: "include",
    });
    const payload = (await res.json()) as { error?: string; publicUrl?: string };
    if (!res.ok || !payload.publicUrl) {
      throw new Error(
        res.status === 401
          ? "Tu sesión de administrador se venció. Ingresa de nuevo para crear productos."
          : payload.error || "No fue posible subir la ficha técnica.",
      );
    }
    return payload.publicUrl;
  };

  const uploadProductImage = async (file: File, productName: string) => {
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("productName", productName);

    const uploadResponse = await fetch("/api/uploads", {
      method: "POST",
      body: uploadData,
      credentials: "include",
    });

    const uploadPayload = (await uploadResponse.json()) as {
      error?: string;
      publicUrl?: string;
    };

    if (!uploadResponse.ok || !uploadPayload.publicUrl) {
      throw new Error(
        uploadResponse.status === 401
          ? "Tu sesión de administrador se venció. Ingresa de nuevo para crear productos."
          : uploadPayload.error || "No fue posible subir la imagen a Supabase Storage.",
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
    let fichaTecnicaUrl = existingPdfUrl || undefined;

    try {
      if (selectedImage) {
        imageUrl = await uploadProductImage(selectedImage, form.nombre);
      }

      if (selectedPdf) {
        fichaTecnicaUrl = await uploadPdf(selectedPdf, form.nombre);
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
        descripcion: form.descripcion,
        oemReferencia: form.oemReferencia,
        referenciasAlternas: splitCommaSeparatedValues(form.referenciasAlternas),
        aplicacion: form.aplicacion,
        compatibilidad: splitCommaSeparatedValues(form.compatibilidad),
        garantia: form.garantia,
        fichaTecnicaUrl,
        especificacionesTecnicas: normalizeTechnicalSpecFormItems(technicalSpecs),
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
      setSelectedPdf(null);
      setExistingPdfUrl(null);
      setTechnicalSpecs([createTechnicalSpecItem({ etiqueta: "Observaciones" })]);
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
      oemReferencia: product.oemReferencia || "",
      referenciasAlternas: product.referenciasAlternas?.join(", ") || "",
      categoria: product.categoria,
      nombre: product.nombre,
      marca: product.marca,
      precioValor: String(product.precioValor),
      precioAnteriorValor: String(precioAnteriorValor),
      stock: String(product.stock ?? 0),
      stockMinimo: String(product.stockMinimo ?? 0),
      disponibilidad: product.disponibilidad,
      aplicacion: product.aplicacion || "",
      compatibilidad: product.compatibilidad?.join(", ") || "",
      garantia: product.garantia || initialState.garantia,
      descripcion: product.descripcion || "",
    });
    setExistingPdfUrl(product.fichaTecnicaUrl || null);
    setSelectedPdf(null);
    setTechnicalSpecs(
      (product.especificacionesTecnicas || []).length > 0
        ? (product.especificacionesTecnicas || []).map((item) =>
            createTechnicalSpecItem(item),
          )
        : [createTechnicalSpecItem({ etiqueta: "Observaciones" })],
    );
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
    setTechnicalSpecs([createTechnicalSpecItem({ etiqueta: "Observaciones" })]);
    setSelectedExtraImages(Array.from({ length: EXTRA_IMAGE_SLOTS }, () => null));
    setPrimaryImageIndex(0);
    setEditingSlug(null);
    setRequestError("");
    setFileInputKey((current) => current + 1);
    setSelectedOrderId(null);
    setOrderSearch("");
    setOrderShippingFilter("all");
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

  async function loadOrders() {
    setIsLoadingOrders(true);

    const response = await fetch("/api/orders");
    const payload = (await response.json()) as {
      error?: string;
      orders?: AdminOrder[];
    };

    setIsLoadingOrders(false);

    if (!response.ok || !payload.orders) {
      setToast({
        tone: "error",
        message: payload.error || "No fue posible cargar los pedidos.",
      });
      return;
    }

    setOrders(payload.orders);
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

  const openInventoryView = (filter: "all" | "low-stock" | "out-of-stock" = "all") => {
    setSelectedImage(null);
    setRequestError("");
    setPrimaryImageIndex(0);
    setEditingSlug(null);
    setInventoryStatusFilter(filter);
    setActiveTab("inventory");
    void loadInventoryMovements();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openOrdersView = () => {
    setSelectedImage(null);
    setRequestError("");
    setPrimaryImageIndex(0);
    setEditingSlug(null);
    setOrderShippingFilter("all");
    setActiveTab("orders");
    void loadOrders();
  };

  async function loadVendors() {
    setIsLoadingVendors(true);
    const response = await fetch("/api/admin/vendors");
    const payload = (await response.json()) as {
      error?: string;
      vendors?: VendorWithMetrics[];
    };
    setIsLoadingVendors(false);
    if (!response.ok || !payload.vendors) {
      setToast({
        tone: "error",
        message: payload.error || "No fue posible cargar los proveedores.",
      });
      return;
    }
    setVendors(payload.vendors);
  }

  const openVendorsView = () => {
    setSelectedImage(null);
    setRequestError("");
    setPrimaryImageIndex(0);
    setEditingSlug(null);
    setActiveTab("vendors");
    void loadVendors();
  };

  const openVentasView = () => {
    setSelectedImage(null);
    setRequestError("");
    setEditingSlug(null);
    setActiveTab("ventas");
  };

  const handleVendorEstado = async (
    id: string,
    estado: VendorWithMetrics["estado"],
  ) => {
    setIsSavingVendor(id);
    const response = await fetch(`/api/admin/vendors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado, adminNotes: vendorNotes[id] }),
    });
    const payload = (await response.json()) as { error?: string };
    setIsSavingVendor(null);
    if (!response.ok) {
      setToast({
        tone: "error",
        message: payload.error || "No fue posible actualizar el proveedor.",
      });
      return;
    }
    setVendors((current) =>
      current.map((v) =>
        v.id === id ? { ...v, estado, adminNotes: vendorNotes[id] || v.adminNotes } : v,
      ),
    );
    setToast({ tone: "success", message: "Estado del proveedor actualizado." });
  };

  const handleOrderFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setOrderForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSaveOrder = async () => {
    if (!selectedOrderId) return;

    setIsSavingOrder(true);
    setToast(null);

    const response = await fetch(`/api/orders/${selectedOrderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderForm),
    });

    const payload = (await response.json()) as {
      error?: string;
      message?: string;
      order?: AdminOrder;
    };

    setIsSavingOrder(false);

    if (!response.ok || !payload.order) {
      setToast({
        tone: "error",
        message: payload.error || "No fue posible actualizar el pedido.",
      });
      return;
    }

    setOrders((current) =>
      current.map((order) => (order.id === payload.order?.id ? payload.order : order)),
    );
    setToast({
      tone: "success",
      message: payload.message || "Pedido actualizado correctamente.",
    });
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
      {activeTab === null ? (
        <section className="mx-auto max-w-[1440px] px-6 py-10 lg:py-14">
          {/* Welcome header */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ed8435]">
              Panel de administración
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-[-0.03em] text-[#16384f]">
              Hola, {firstName}
            </h1>
            <p className="mt-2 text-sm leading-7 text-[#6e7379]">
              Gestiona el catalogo, inventario, pedidos y proveedores desde un solo lugar.
            </p>
          </div>

          {/* Stat cards — horizontal icon layout */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: (
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 text-[#ed8435]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3 4 7l8 4 8-4-8-4Z" /><path d="M4 7v10l8 4 8-4V7" /><path d="M12 11v10" />
                  </svg>
                ),
                iconBg: "bg-[#fff6ee]",
                value: adminProducts.length,
                label: "Productos en catálogo",
                linkLabel: "Ver productos",
                onClick: openEditView,
                valueColor: "text-[#1f2328]",
              },
              {
                icon: (
                  <svg aria-hidden="true" viewBox="0 0 24 24" className={`h-5 w-5 ${outOfStockCount > 0 ? "text-[#c53b3b]" : "text-[#1f8b45]"}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
                  </svg>
                ),
                iconBg: outOfStockCount > 0 ? "bg-[#fff1f1]" : "bg-[#effaf2]",
                value: outOfStockCount,
                label: "Productos agotados",
                linkLabel: "Ver agotados",
                onClick: () => openInventoryView("out-of-stock"),
                valueColor: outOfStockCount > 0 ? "text-[#c53b3b]" : "text-[#1f2328]",
              },
              {
                icon: (
                  <svg aria-hidden="true" viewBox="0 0 24 24" className={`h-5 w-5 ${lowStockCount > 0 ? "text-[#b85d12]" : "text-[#1f8b45]"}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  </svg>
                ),
                iconBg: lowStockCount > 0 ? "bg-[#fff6ee]" : "bg-[#effaf2]",
                value: lowStockCount,
                label: "Stock bajo",
                linkLabel: "Ver stock bajo",
                onClick: () => openInventoryView("low-stock"),
                valueColor: lowStockCount > 0 ? "text-[#b85d12]" : "text-[#1f2328]",
              },
              {
                icon: (
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 text-[#6366f1]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
                  </svg>
                ),
                iconBg: "bg-[#f0f4ff]",
                value: `${availabilityPct}%`,
                label: "Disponibilidad promedio",
                linkLabel: "Ver inventario",
                onClick: () => openInventoryView("all"),
                valueColor: "text-[#1f2328]",
              },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-black/8 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${stat.iconBg}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className={`text-3xl font-bold tracking-[-0.03em] ${stat.valueColor}`}>{stat.value}</p>
                    <p className="mt-0.5 text-sm text-[#6e7379]">{stat.label}</p>
                    <button type="button" onClick={stat.onClick} className="mt-2 text-xs font-semibold text-[#ed8435] hover:underline">
                      {stat.linkLabel} →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Accesos rápidos + Actividad reciente */}
          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_296px]">
            <div>
              <h2 className="text-base font-bold text-[#1f2328]">Accesos rápidos</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    label: "Crear producto",
                    desc: "Publica nuevos productos en el catalogo.",
                    iconBg: "bg-[#fff6ee]",
                    icon: (
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 text-[#ed8435]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14" /><path d="M5 12h14" />
                      </svg>
                    ),
                    onClick: openCreateView,
                  },
                  {
                    label: "Editar productos",
                    desc: "Actualiza y administra los productos.",
                    iconBg: "bg-[#fff6ee]",
                    icon: (
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 text-[#d67024]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" /><path d="m16.5 3.5 4 4L7 21l-4 1 1-4Z" />
                      </svg>
                    ),
                    onClick: openEditView,
                  },
                  {
                    label: "Inventario",
                    desc: "Gestiona el stock y disponibilidad.",
                    iconBg: "bg-[#f0fdf4]",
                    icon: (
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 text-[#1f8b45]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12h18" /><path d="M3 6h18" /><path d="M3 18h18" />
                      </svg>
                    ),
                    onClick: () => openInventoryView(),
                  },
                  {
                    label: "Pedidos y envíos",
                    desc: "Consulta y gestiona los pedidos.",
                    iconBg: "bg-[#f0f4ff]",
                    icon: (
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 text-[#6366f1]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 7h11v8H3z" /><path d="M14 10h3l4 3v2h-7z" /><circle cx="7.5" cy="17.5" r="1.5" /><circle cx="17.5" cy="17.5" r="1.5" />
                      </svg>
                    ),
                    onClick: openOrdersView,
                  },
                  {
                    label: "Ventas",
                    desc: `${adminStats?.totalUnits ?? "—"} uds vendidas · ${adminStats ? `$ ${adminStats.totalRevenue.toLocaleString("es-CO")}` : "—"} en ingresos`,
                    iconBg: "bg-[#f0fdf4]",
                    icon: (
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 text-[#1f8b45]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    ),
                    onClick: openVentasView,
                  },
                ].map((item) => (
                  <button key={item.label} type="button" onClick={item.onClick} className="rounded-2xl border border-black/8 bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.iconBg}`}>
                      {item.icon}
                    </div>
                    <h3 className="mt-4 font-bold text-[#1f2328]">{item.label}</h3>
                    <p className="mt-1 text-sm leading-6 text-[#6e7379]">{item.desc}</p>
                    <span className="mt-4 block text-[#6e7379]">→</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actividad reciente */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#1f2328]">Actividad reciente</h2>
                <button type="button" onClick={() => openInventoryView()} className="text-xs font-semibold text-[#ed8435] hover:underline">
                  Ver todas
                </button>
              </div>
              <div className="mt-4 overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm">
                {inventoryMovements.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <p className="text-sm text-[#6e7379]">Aun no hay movimientos recientes.</p>
                    <button type="button" onClick={() => openInventoryView()} className="mt-3 text-xs font-semibold text-[#ed8435] hover:underline">
                      Abrir Inventario
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-black/6">
                    {inventoryMovements.slice(0, 5).map((m) => (
                      <div key={m.id} className="flex items-start gap-3 px-4 py-3">
                        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${m.quantity >= 0 ? "bg-[#effaf2]" : "bg-[#fff6ee]"}`}>
                          <svg aria-hidden="true" viewBox="0 0 24 24" className={`h-4 w-4 ${m.quantity >= 0 ? "text-[#1f8b45]" : "text-[#b85d12]"}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {m.quantity >= 0 ? <><path d="M12 5v14" /><path d="M5 12h14" /></> : <><path d="M5 12h14" /></>}
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#1f2328]">{m.productName}</p>
                          <p className="text-xs text-[#6e7379]">{m.quantity > 0 ? `+${m.quantity}` : m.quantity} uds · stock: {m.stockAfter}</p>
                        </div>
                        <p className="shrink-0 text-xs text-[#9a9da2]">{timeAgo(m.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          {/* Ventas section moved to its own tab */}
          <div id="ventas-section-placeholder" className="hidden">
              <h2 className="text-base font-bold text-[#1f2328]">Ventas</h2>

              {/* Métricas globales */}
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Ingresos totales", value: adminStats ? `$ ${adminStats.totalRevenue.toLocaleString("es-CO")}` : "—", color: "text-[#1f8b45]" },
                  { label: "Unidades vendidas", value: adminStats ? adminStats.totalUnits.toLocaleString("es-CO") : "—", color: "text-[#16384f]" },
                  { label: "Pedidos pagados", value: adminStats ? adminStats.totalOrders.toLocaleString("es-CO") : "—", color: "text-[#16384f]" },
                ].map((m) => (
                  <div key={m.label} className="rounded-2xl border border-black/8 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a2a5aa]">{m.label}</p>
                    <p className={`mt-2 text-3xl font-bold tracking-[-0.03em] ${m.color}`}>{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Top productos */}
              {adminStats && adminStats.topProducts.length > 0 && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm">
                  <div className="border-b border-black/[0.06] px-5 py-4">
                    <p className="text-sm font-bold text-[#1f2328]">Productos más vendidos</p>
                  </div>
                  <div className="divide-y divide-black/[0.05]">
                    {adminStats?.topProducts.map((p, i) => (
                      <div key={p.id} className="flex items-center gap-4 px-5 py-3.5">
                        <span className="w-5 shrink-0 text-center text-xs font-bold text-[#c5c7cb]">{i + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#1f2328]">{p.name}</p>
                          <p className="text-xs text-[#9a9da2]">{p.category}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold text-[#16384f]">{p.units} uds</p>
                          <p className="text-xs text-[#9a9da2]">${p.revenue.toLocaleString("es-CO")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!adminStats || adminStats.topProducts.length === 0) && (
                <div className="mt-4 rounded-2xl border border-black/8 bg-white px-5 py-8 text-center shadow-sm">
                  <p className="text-sm text-[#a2a5aa]">{adminStats ? "Aún no hay ventas registradas." : "Cargando..."}</p>
                </div>
              )}
          </div>
          </div>
        </section>
      ) : (
        <section className="py-8">
          <div className="mx-auto max-w-[1440px] space-y-8 px-6">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleResetForm}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#5d6167] transition-colors hover:bg-[#16384f] hover:text-white"
              >
                ← Inicio
              </button>
              <button
                type="button"
                onClick={openCreateView}
                className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${activeTab === "create" ? "border-[#16384f] bg-[#16384f] text-white" : "border-black/8 bg-white text-[#16384f] hover:bg-[#f8f8f7]"}`}
              >
                Crear producto
              </button>
              <button
                type="button"
                onClick={openEditView}
                className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${activeTab === "edit" ? "border-[#16384f] bg-[#16384f] text-white" : "border-black/8 bg-white text-[#16384f] hover:bg-[#f8f8f7]"}`}
              >
                Editar productos
              </button>
              <button
                type="button"
                onClick={() => openInventoryView()}
                className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${activeTab === "inventory" ? "border-[#16384f] bg-[#16384f] text-white" : "border-black/8 bg-white text-[#16384f] hover:bg-[#f8f8f7]"}`}
              >
                Inventario
              </button>
              <button
                type="button"
                onClick={openOrdersView}
                className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${activeTab === "orders" ? "border-[#16384f] bg-[#16384f] text-white" : "border-black/8 bg-white text-[#16384f] hover:bg-[#f8f8f7]"}`}
              >
                Pedidos y envíos
              </button>
              <button
                type="button"
                onClick={openVentasView}
                className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${activeTab === "ventas" ? "border-[#16384f] bg-[#16384f] text-white" : "border-black/8 bg-white text-[#16384f] hover:bg-[#f8f8f7]"}`}
              >
                Ventas
              </button>
            </div>

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

                <TechnicalSpecsEditor
                  items={technicalSpecs}
                  onChange={setTechnicalSpecs}
                />

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-[#4f545a]">Descripción comercial</span>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe el producto, su uso principal y el beneficio para el cliente."
                    className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm leading-7 text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
                  />
                </label>

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

              <div className="mt-6 space-y-2">
                <span className="text-sm font-medium text-[#4f545a]">Ficha técnica (PDF)</span>
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-black/15 bg-[#fafaf9] px-4 py-3 transition-colors hover:border-[#ed8435]/50">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ed8435" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                  <span className="text-sm text-[#4f545a]">
                    {selectedPdf ? selectedPdf.name : "Sube acá tu ficha técnica"}
                  </span>
                  <input
                    key={`pdf-${fileInputKey}`}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => setSelectedPdf(e.target.files?.[0] ?? null)}
                  />
                </label>
                {existingPdfUrl && !selectedPdf && (
                  <a href={existingPdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#ed8435] underline">
                    Ver ficha técnica actual
                  </a>
                )}
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

                    <TechnicalSpecsEditor
                      items={technicalSpecs}
                      onChange={setTechnicalSpecs}
                    />

                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-medium text-[#4f545a]">Descripción comercial</span>
                      <textarea
                        name="descripcion"
                        value={form.descripcion}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Describe el producto, su uso principal y el beneficio para el cliente."
                        className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm leading-7 text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
                      />
                    </label>

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

                  <div className="mt-6 space-y-2">
                    <span className="text-sm font-medium text-[#4f545a]">Ficha técnica (PDF)</span>
                    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-black/15 bg-[#fafaf9] px-4 py-3 transition-colors hover:border-[#ed8435]/50">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ed8435" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                      <span className="text-sm text-[#4f545a]">
                        {selectedPdf ? selectedPdf.name : "Sube acá tu ficha técnica"}
                      </span>
                      <input
                        key={`pdf-edit-${fileInputKey}`}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => setSelectedPdf(e.target.files?.[0] ?? null)}
                      />
                    </label>
                    {existingPdfUrl && !selectedPdf && (
                      <a href={existingPdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#ed8435] underline">
                        Ver ficha técnica actual
                      </a>
                    )}
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

          {activeTab === "orders" && (
            <div className="admin-fade-up space-y-8">
              <div
                className={
                  selectedOrder && selectedOrderPreview
                    ? "space-y-8"
                    : "mx-auto w-full max-w-[980px] space-y-5"
                }
              >
                <aside
                  className={`space-y-5 ${
                    selectedOrder && selectedOrderPreview ? "hidden" : ""
                  }`}
                >
                  <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b8d91]">
                      Pedidos
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#16384f]">
                      Gestión de envíos
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-[#6e7379]">
                      Aquí controlas el estado logístico del pedido, la transportadora y el número de guía que verá el cliente.
                    </p>
                  </div>

                  <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-[#4f545a]">
                        Buscar por pedido, cliente o guía
                      </span>
                      <input
                        type="search"
                        value={orderSearch}
                        onChange={(event) => setOrderSearch(event.target.value)}
                        placeholder="Ej: cm..., Brandon, 12345..."
                        className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
                      />
                    </label>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setOrderShippingFilter("all")}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                          orderShippingFilter === "all"
                            ? "bg-[#16384f] text-white"
                            : "border border-black/10 bg-[#fafaf9] text-[#5d6167] hover:bg-[#ececea]"
                        }`}
                      >
                        Todos
                      </button>
                      {shippingStatuses.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setOrderShippingFilter(status)}
                          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                            orderShippingFilter === status
                              ? "bg-[#6366f1] text-white"
                              : "border border-black/10 bg-[#fafaf9] text-[#5d6167] hover:bg-[#ececea]"
                          }`}
                        >
                          {getShippingStatusLabel(status)}
                        </button>
                      ))}
                    </div>

                    <p className="mt-5 text-sm text-[#6e7379]">
                      Mostrando {filteredOrders.length} pedido{filteredOrders.length === 1 ? "" : "s"}.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {isLoadingOrders ? (
                      <div className="rounded-[1.5rem] border border-black/8 bg-white p-5 text-sm text-[#6e7379] shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                        Cargando pedidos...
                      </div>
                    ) : filteredOrders.length === 0 ? (
                      <div className="rounded-[1.5rem] border border-dashed border-black/12 bg-white p-5 text-sm leading-7 text-[#6e7379] shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                        Aún no hay pedidos que coincidan con los filtros actuales.
                      </div>
                    ) : (
                      filteredOrders.map((order) => {
                        const previewItems = order.items
                          .map((item) => {
                            const normalizedItemName = normalizeComparableText(item.name);
                            const fallbackBySlug = item.productId
                              ? adminProducts.find((product) => product.slug === item.productId)
                              : null;
                            const fallbackByName =
                              fallbackBySlug ||
                              adminProducts.find((product) => {
                                const normalizedProductName = normalizeComparableText(product.nombre);

                                return (
                                  normalizedProductName === normalizedItemName ||
                                  normalizedProductName.includes(normalizedItemName) ||
                                  normalizedItemName.includes(normalizedProductName)
                                );
                              });
                            const fallbackImage = item.productId
                              ? fallbackBySlug?.imagen || fallbackByName?.imagen || null
                              : null;

                            return {
                              name: item.name,
                              image: item.image || fallbackImage || fallbackByName?.imagen || null,
                            };
                          })
                          .filter(
                            (item): item is { name: string; image: string } => Boolean(item.image),
                          )
                          .slice(0, 3);

                        return (
                          <button
                            key={order.id}
                            type="button"
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setOrderForm(getOrderEditState(order));
                            }}
                            className={`block w-full rounded-[1.5rem] border px-5 py-5 text-left shadow-[0_14px_28px_rgba(15,23,42,0.05)] transition-all duration-200 ${
                              selectedOrderId === order.id
                                ? "border-[#16384f]/22 bg-white shadow-[0_18px_32px_rgba(22,56,79,0.12)] ring-2 ring-[#16384f]/12"
                                : "border-black/8 bg-white hover:-translate-y-0.5 hover:border-[#16384f]/18"
                            }`}
                          >
                            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:grid-cols-[minmax(220px,0.9fr)_minmax(320px,1.1fr)_minmax(180px,auto)] xl:items-center">
                              <div className="min-w-0">
                                <p className="text-[13px] font-semibold uppercase tracking-[0.22em] text-[#8b8d91]">
                                  Pedido
                                </p>
                                <p className="mt-3 break-words text-[1.42rem] font-semibold leading-tight text-[#1f2328]">
                                  #{String(order.orderNumber).padStart(4, "0")}
                                </p>
                                <p className="mt-3 text-[15px] text-[#5d6167]">
                                  {order.customerName} · {order.city}
                                </p>
                                <p className="mt-1 text-[15px] text-[#7a7f86]">
                                  {new Date(order.createdAt).toLocaleDateString("es-CO")} · {order.totalItems} producto
                                  {order.totalItems === 1 ? "" : "s"}
                                </p>
                                <p className="mt-5 text-[1.45rem] font-semibold text-[#ed8435]">
                                  {formatCurrency(order.subtotal)}
                                </p>
                                <div className="mt-4 border-t border-black/8 pt-3">
                                  <p className="line-clamp-2 text-[13px] leading-5 text-[#7a7f86]">
                                    {order.items[0]?.name || "Pedido con productos varios"}
                                  </p>
                                </div>
                              </div>

                              <div className="min-w-0 lg:row-start-2 lg:col-span-2 xl:row-start-auto xl:col-span-1">
                                {previewItems.length > 0 ? (
                                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:justify-items-center">
                                    {previewItems.map((item, index) => (
                                      <div
                                        key={`${order.id}-preview-${index}`}
                                        className="min-w-0 max-w-[118px] text-center"
                                      >
                                        <div className="mx-auto h-[94px] w-full overflow-hidden rounded-[0.95rem] border border-black/8 bg-white shadow-[0_10px_20px_rgba(15,23,42,0.12)]">
                                          <Image
                                            src={item.image}
                                            alt={`Producto ${index + 1} del pedido ${order.id}`}
                                            width={118}
                                            height={94}
                                            sizes="118px"
                                            className="h-full w-full object-cover"
                                          />
                                        </div>
                                        <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-[#5d6167]">
                                          {item.name || "Producto"}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="flex h-[94px] w-[118px] items-center justify-center rounded-[0.95rem] border border-black/8 bg-[#16384f] text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_10px_20px_rgba(15,23,42,0.12)]">
                                    {order.items[0]?.name?.slice(0, 2) || "UP"}
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-3 lg:justify-end lg:self-start xl:flex-col xl:items-end xl:justify-center">
                                <span className="rounded-full bg-[#fff6ee] px-4 py-2 text-sm font-semibold text-[#b85d12]">
                                  {getPaymentStatusLabel(order.paymentStatus)}
                                </span>
                                <span className="hidden text-black/20 xl:inline">|</span>
                                <span className="rounded-full bg-[#effaf2] px-4 py-2 text-sm font-semibold text-[#1f6b39]">
                                  {getShippingStatusLabel(order.shippingStatus)}
                                </span>
                                <span className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full text-[#ed8435] lg:ml-0">
                                  <svg
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    className="h-5 w-5"
                                    fill="currentColor"
                                  >
                                    <path d="m8 5 8 7-8 7z" />
                                  </svg>
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </aside>

                <div
                  className={
                    selectedOrder && selectedOrderPreview ? "space-y-8" : "hidden"
                  }
                >
                  {!selectedOrder || !selectedOrderPreview ? null : (
                    <>
                      <button
                        type="button"
                        onClick={() => setSelectedOrderId(null)}
                        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
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
                          <path d="m15 18-6-6 6-6" />
                        </svg>
                        Atrás
                      </button>

                      <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b8d91]">
                              Pedido seleccionado
                            </p>
                            <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#16384f]">
                              #{String(selectedOrderPreview.orderNumber).padStart(4, "0")}
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-[#6e7379]">
                              {selectedOrderPreview.customerName} · {selectedOrderPreview.customerEmail} · {selectedOrderPreview.customerPhone}
                            </p>
                            <p className="text-sm leading-7 text-[#6e7379]">
                              {selectedOrderPreview.department}, {selectedOrderPreview.city} · {selectedOrderPreview.addressLine1}
                              {selectedOrderPreview.addressLine2 ? ` · ${selectedOrderPreview.addressLine2}` : ""}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-[#16384f] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                              {selectedOrderPreview.status}
                            </span>
                            <span className="rounded-full border border-[#ed8435]/18 bg-[#fff6ee] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#b85d12]">
                              {getPaymentStatusLabel(selectedOrderPreview.paymentStatus)}
                            </span>
                            <span className="rounded-full border border-[#1f8b45]/18 bg-[#effaf2] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#1f6b39]">
                              {getShippingStatusLabel(selectedOrderPreview.shippingStatus)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_320px]">
                          <div className="rounded-[1.4rem] border border-black/8 bg-[#fafaf9] p-5">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b8d91]">
                                  Resumen del pedido
                                </p>
                                <p className="mt-2 text-sm text-[#6e7379]">
                                  Revisa qué compró el cliente antes de actualizar envío y guía.
                                </p>
                              </div>
                              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#16384f] shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
                                {selectedOrderPreview.totalItems} producto
                                {selectedOrderPreview.totalItems === 1 ? "" : "s"}
                              </span>
                            </div>

                            <div className="mt-5 space-y-3">
                              {selectedOrderPreview.items.map((item) => (
                                <div
                                  key={`summary-${item.id}`}
                                  className="rounded-[1rem] border border-black/8 bg-white px-4 py-4"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-semibold text-[#1f2328]">
                                        {item.name}
                                      </p>
                                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#8b8d91]">
                                        Cantidad
                                      </p>
                                      <p className="mt-1 text-sm font-medium text-[#5d6167]">
                                        {item.quantity}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs uppercase tracking-[0.18em] text-[#8b8d91]">
                                        Precio unidad
                                      </p>
                                      <p className="mt-1 text-sm font-semibold text-[#16384f]">
                                        {formatCurrency(item.unitPrice)}
                                      </p>
                                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[#8b8d91]">
                                        Subtotal
                                      </p>
                                      <p className="mt-1 text-sm font-semibold text-[#ed8435]">
                                        {formatCurrency(item.lineTotal)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid gap-3">
                            <div className="rounded-[1.4rem] border border-black/8 bg-[#fafaf9] px-5 py-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                                Total del pedido
                              </p>
                              <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#ed8435]">
                                {formatCurrency(selectedOrderPreview.subtotal)}
                              </p>
                            </div>
                            <div className="rounded-[1.4rem] border border-black/8 bg-[#fafaf9] px-5 py-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                                Transportadora actual
                              </p>
                              <p className="mt-2 text-sm font-semibold text-[#16384f]">
                                {selectedOrderPreview.carrier || "Por definir"}
                              </p>
                            </div>
                            <div className="rounded-[1.4rem] border border-black/8 bg-[#fafaf9] px-5 py-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                                Guía actual
                              </p>
                              <p className="mt-2 text-sm font-semibold text-[#16384f]">
                                {selectedOrderPreview.trackingNumber || "Aún no asignada"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6">
                          <AdminOrderProgress order={selectedOrderPreview} />
                        </div>

                        <div className="mt-6 grid gap-5 md:grid-cols-2">
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-[#4f545a]">Estado de envío</span>
                            <select
                              name="shippingStatus"
                              value={orderForm.shippingStatus}
                              onChange={handleOrderFieldChange}
                              className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
                            >
                              {shippingStatuses.map((status) => (
                                <option key={status} value={status}>
                                  {getShippingStatusLabel(status)}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="space-y-2">
                            <span className="text-sm font-medium text-[#4f545a]">Estado de pago</span>
                            <select
                              name="paymentStatus"
                              value={orderForm.paymentStatus}
                              onChange={handleOrderFieldChange}
                              className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
                            >
                              {paymentStatuses.map((status) => (
                                <option key={status} value={status}>
                                  {getPaymentStatusLabel(status)}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="space-y-2">
                            <span className="text-sm font-medium text-[#4f545a]">Transportadora</span>
                            <input
                              name="carrier"
                              value={orderForm.carrier}
                              onChange={handleOrderFieldChange}
                              placeholder="Ej. Coordinadora, Servientrega..."
                              className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
                            />
                          </label>

                          <label className="space-y-2">
                            <span className="text-sm font-medium text-[#4f545a]">Número de guía</span>
                            <input
                              name="trackingNumber"
                              value={orderForm.trackingNumber}
                              onChange={handleOrderFieldChange}
                              placeholder="Ej. 123456789"
                              className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
                            />
                          </label>

                          <label className="space-y-2 md:col-span-2">
                            <span className="text-sm font-medium text-[#4f545a]">Notas internas del envío</span>
                            <textarea
                              name="adminNotes"
                              value={orderForm.adminNotes}
                              onChange={handleOrderFieldChange}
                              rows={4}
                              placeholder="Ej. Sale hoy en la tarde, cliente pidió entregar en portería..."
                              className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
                            />
                          </label>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={handleSaveOrder}
                            disabled={isSavingOrder}
                            className="inline-flex rounded-full bg-[#16384f] px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0f2a3b] disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {isSavingOrder ? "Guardando..." : "Actualizar pedido"}
                          </button>
                          <button
                            type="button"
                            onClick={() => void loadOrders()}
                            className="inline-flex rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
                          >
                            Recargar pedidos
                          </button>
                        </div>
                      </div>

                      <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                        <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[#16384f]">
                          Productos del pedido
                        </h3>
                        <div className="mt-5 grid gap-3 md:grid-cols-2">
                          {selectedOrder.items.map((item) => (
                            <div
                              key={item.id}
                              className="rounded-[1.1rem] border border-black/8 bg-[#fafaf9] px-4 py-4"
                            >
                              <p className="text-sm font-semibold text-[#1f2328]">{item.name}</p>
                              <div className="mt-2 flex items-center justify-between text-sm text-[#6e7379]">
                                <span>Cantidad: {item.quantity}</span>
                                <span className="font-semibold text-[#16384f]">
                                  {formatCurrency(item.unitPrice)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-black/8 pt-4 text-sm">
                          <span className="text-[#6e7379]">
                            {selectedOrder.totalItems} producto{selectedOrder.totalItems === 1 ? "" : "s"}
                          </span>
                          <span className="text-lg font-semibold text-[#ed8435]">
                            {formatCurrency(selectedOrder.subtotal)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
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
                            <div className="flex min-w-0 items-center gap-4">
                              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[1rem] border border-black/8 bg-[#fafaf9]">
                                <Image
                                  src={product.imagen}
                                  alt={product.nombre}
                                  fill
                                  sizes="96px"
                                  className="object-cover"
                                />
                              </div>

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
          {activeTab === "ventas" && (
            <div className="admin-fade-up space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                {([
                  { label: "Ingresos totales", value: adminStats ? `$ ${adminStats.totalRevenue.toLocaleString("es-CO")}` : "—", color: "text-[#1f8b45]" },
                  { label: "Unidades vendidas", value: adminStats ? adminStats.totalUnits.toLocaleString("es-CO") : "—", color: "text-[#16384f]" },
                  { label: "Pedidos pagados", value: adminStats ? adminStats.totalOrders.toLocaleString("es-CO") : "—", color: "text-[#16384f]" },
                ] as const).map((m) => (
                  <div key={m.label} className="rounded-2xl border border-black/8 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a2a5aa]">{m.label}</p>
                    <p className={`mt-2 text-3xl font-bold tracking-[-0.03em] ${m.color}`}>{m.value}</p>
                  </div>
                ))}
              </div>
              <div className="overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm">
                <div className="border-b border-black/[0.06] px-5 py-4">
                  <p className="text-sm font-bold text-[#1f2328]">Productos más vendidos</p>
                </div>
                {!adminStats && <p className="px-5 py-6 text-sm text-[#a2a5aa]">Cargando...</p>}
                {adminStats && adminStats.topProducts.length === 0 && (
                  <p className="px-5 py-6 text-sm text-[#a2a5aa]">Aún no hay ventas registradas.</p>
                )}
                {adminStats && adminStats.topProducts.length > 0 && (
                  <div className="divide-y divide-black/[0.05]">
                    {adminStats.topProducts.map((p, i) => (
                      <div key={p.id} className="flex items-center gap-4 px-5 py-3.5">
                        <span className="w-5 shrink-0 text-center text-xs font-bold text-[#c5c7cb]">{i + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#1f2328]">{p.name}</p>
                          <p className="text-xs text-[#9a9da2]">{p.category}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold text-[#16384f]">{p.units} uds</p>
                          <p className="text-xs text-[#9a9da2]">${p.revenue.toLocaleString("es-CO")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {false && (
            <div className="admin-fade-up space-y-6">

              {/* Stat cards */}
              {(() => {
                const counts = {
                  PENDIENTE: vendors.filter((v) => v.estado === "PENDIENTE").length,
                  EN_REVISION: vendors.filter((v) => v.estado === "EN_REVISION").length,
                  APROBADA: vendors.filter((v) => v.estado === "APROBADA").length,
                  RECHAZADA: vendors.filter((v) => v.estado === "RECHAZADA").length,
                };
                const cards = [
                  { label: "Total", value: vendors.length, color: "#16384f", sub: "solicitudes" },
                  { label: "Pendientes", value: counts.PENDIENTE, color: "#ed8435", sub: "por revisar" },
                  { label: "Aprobados", value: counts.APROBADA, color: "#1f8b45", sub: "activos" },
                  { label: "Rechazados", value: counts.RECHAZADA, color: "#c53b3b", sub: "no aptos" },
                ];
                return (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {cards.map((card) => (
                      <div
                        key={card.label}
                        className="rounded-[1.5rem] border border-black/8 bg-white px-5 py-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)]"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b8d91]">{card.label}</p>
                        <p className="mt-3 text-4xl font-semibold tracking-[-0.05em]" style={{ color: card.color }}>
                          {card.value}
                        </p>
                        <p className="mt-1 text-xs text-[#6e7379]">{card.sub}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Cards por vendor */}
              {isLoadingVendors ? (
                <div className="rounded-[2rem] border border-black/8 bg-white px-6 py-16 text-center text-sm text-[#6e7379] shadow-[0_16px_35px_rgba(15,23,42,0.05)]">
                  Cargando solicitudes...
                </div>
              ) : vendors.length === 0 ? (
                <div className="rounded-[2rem] border border-black/8 bg-white px-6 py-16 text-center text-sm text-[#6e7379] shadow-[0_16px_35px_rgba(15,23,42,0.05)]">
                  Aún no hay solicitudes de proveedores registradas.
                </div>
              ) : (
                <div className="space-y-4">
                  {vendors.map((vendor) => {
                    const isSaving = isSavingVendor === vendor.id;
                    const estadoBadge: Record<string, string> = {
                      PENDIENTE: "bg-[#fff6ee] text-[#b85d12] border-[#ed8435]/20",
                      EN_REVISION: "bg-[#f0f0ff] text-[#4338ca] border-[#6366f1]/20",
                      APROBADA: "bg-[#effaf2] text-[#1f6b39] border-[#1f8b45]/20",
                      RECHAZADA: "bg-[#fff1f1] text-[#c53b3b] border-[#c53b3b]/20",
                    };
                    const estadoLabel: Record<string, string> = {
                      PENDIENTE: "Pendiente",
                      EN_REVISION: "En revisión",
                      APROBADA: "Aprobada",
                      RECHAZADA: "Rechazada",
                    };
                    const isAprobada = vendor.estado === "APROBADA";
                    const isRechazada = vendor.estado === "RECHAZADA";

                    return (
                      <div
                        key={vendor.id}
                        className={`rounded-[2rem] border bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all duration-200 ${
                          isAprobada
                            ? "border-[#1f8b45]/20"
                            : isRechazada
                              ? "border-[#c53b3b]/15"
                              : "border-black/8"
                        }`}
                      >
                        {/* Header de la card */}
                        <div className="flex flex-wrap items-start justify-between gap-4 px-6 pt-6">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#16384f] text-base font-bold text-white">
                                {vendor.nombreEmpresa.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-[#1f2328]">{vendor.nombreEmpresa}</p>
                                <p className="text-xs text-[#8b8d91]">NIT {vendor.razonSocial}</p>
                              </div>
                              <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${estadoBadge[vendor.estado] ?? ""}`}>
                                {estadoLabel[vendor.estado] ?? vendor.estado}
                              </span>
                            </div>
                          </div>
                          <p className="shrink-0 text-xs text-[#8b8d91]">
                            {new Date(vendor.createdAt).toLocaleDateString("es-CO", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </p>
                        </div>

                        {/* Info central */}
                        <div className="mt-4 grid gap-4 px-6 md:grid-cols-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">Contacto</p>
                            <p className="mt-1 text-sm text-[#1f2328]">{vendor.correoEmpresa}</p>
                            <p className="text-sm text-[#6e7379]">{vendor.telefonoEmpresa}</p>
                            <p className="text-sm text-[#6e7379]">{vendor.ciudad}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">Categorías</p>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {vendor.categorias.length > 0 ? vendor.categorias.map((cat) => (
                                <span key={cat} className="rounded-full border border-black/8 bg-[#fafaf9] px-2.5 py-0.5 text-xs text-[#5d6167]">
                                  {cat}
                                </span>
                              )) : (
                                <span className="text-sm text-[#8b8d91]">Sin especificar</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">Métricas</p>
                            <div className="mt-1 space-y-0.5">
                              <p className="text-sm text-[#6e7379]">
                                <span className="font-semibold text-[#1f2328]">{vendor.productCount}</span> productos publicados
                              </p>
                              <p className="text-sm text-[#6e7379]">
                                <span className="font-semibold text-[#1f2328]">{vendor.orderCount}</span> pedidos
                              </p>
                              <p className="text-sm text-[#6e7379]">
                                <span className="font-semibold text-[#1f2328]">{formatCurrency(vendor.totalSales)}</span> en ventas
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Documentos */}
                        {(() => {
                          const docs = [
                            { label: "RUT", url: vendor.urlRut },
                            { label: "Cámara de Comercio", url: vendor.urlCamaraComercio },
                            { label: "Doc. Rep. Legal", url: vendor.urlDocRepLegal },
                            { label: "Cert. Bancaria", url: vendor.urlCertBancaria },
                            { label: "Logo", url: vendor.urlLogo },
                            { label: "Catálogo", url: vendor.urlCatalogo },
                          ].filter((d) => d.url);

                          if (docs.length === 0) return null;

                          return (
                            <div className="mt-4 px-6">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                                Documentos adjuntos
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {docs.map((doc) => (
                                  <a
                                    key={doc.label}
                                    href={doc.url!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full border border-[#16384f]/15 bg-[#f0f4f8] px-4 py-2 text-sm font-semibold text-[#16384f] transition-all duration-200 hover:bg-[#16384f] hover:text-white"
                                  >
                                    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M11 3H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
                                      <path d="M15 3h2v2" />
                                      <path d="M10 10 17 3" />
                                    </svg>
                                    {doc.label}
                                  </a>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Notas admin */}
                        <div className="mt-4 px-6">
                          <textarea
                            value={vendorNotes[vendor.id] ?? vendor.adminNotes ?? ""}
                            onChange={(e) =>
                              setVendorNotes((current) => ({ ...current, [vendor.id]: e.target.value }))
                            }
                            placeholder="Notas internas del administrador (razón de aprobación o rechazo, documentos pendientes, etc.)..."
                            rows={2}
                            className="w-full rounded-xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#16384f] placeholder:text-[#a2a5aa]"
                          />
                        </div>

                        {/* Panel expandible de detalle */}
                        {vendorExpandedId === vendor.id && (() => {
                          const docLinks = [
                            { label: "RUT", url: vendor.urlRut },
                            { label: "Cámara de Comercio", url: vendor.urlCamaraComercio },
                            { label: "Doc. Representante Legal", url: vendor.urlDocRepLegal },
                            { label: "Certificación Bancaria", url: vendor.urlCertBancaria },
                            { label: "Logo", url: vendor.urlLogo },
                            { label: "Catálogo", url: vendor.urlCatalogo },
                          ];

                          const Field = ({ label, value }: { label: string; value?: string | null | boolean }) => {
                            if (value === undefined || value === null || value === "") return null;
                            const display = typeof value === "boolean" ? (value ? "Sí" : "No") : value;
                            return (
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a2a5aa]">{label}</p>
                                <p className="mt-0.5 text-sm text-[#1f2328]">{display}</p>
                              </div>
                            );
                          };

                          return (
                            <div className="mx-6 mb-4 space-y-3 rounded-[1.5rem] border border-black/8 bg-[#fafaf9] p-5">

                              {/* Empresa */}
                              <div>
                                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b8d91]">Empresa</p>
                                <div className="grid gap-3 md:grid-cols-3">
                                  <Field label="NIT" value={vendor.nit} />
                                  <Field label="Ciudad" value={vendor.ciudad} />
                                  <Field label="Dirección" value={vendor.direccion} />
                                  <Field label="Teléfono" value={vendor.telefonoEmpresa} />
                                  <Field label="Correo" value={vendor.correoEmpresa} />
                                  {vendor.paginaWeb && <Field label="Web" value={vendor.paginaWeb} />}
                                </div>
                              </div>

                              <div className="border-t border-black/6" />

                              {/* Representante legal */}
                              <div>
                                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b8d91]">Representante legal</p>
                                <div className="grid gap-3 md:grid-cols-3">
                                  <Field label="Nombre" value={vendor.repNombre} />
                                  <Field label="Cargo" value={vendor.repCargo} />
                                  <Field label="Celular" value={vendor.repCelular} />
                                  <Field label="Correo" value={vendor.repCorreo} />
                                </div>
                              </div>

                              <div className="border-t border-black/6" />

                              {/* Comercial */}
                              <div>
                                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b8d91]">Información comercial</p>
                                <div className="grid gap-3 md:grid-cols-3">
                                  <Field label="Años en el mercado" value={vendor.anosEnMercado} />
                                  <Field label="Vende online" value={vendor.vendeOnline} />
                                  {vendor.linkTienda && <Field label="Link tienda" value={vendor.linkTienda} />}
                                  {vendor.operaEn && <Field label="Opera en" value={vendor.operaEn} />}
                                  <Field label="Cant. productos" value={vendor.cantidadProductos} />
                                  <Field label="Tiempo despacho" value={vendor.tiempoDespacho} />
                                  <Field label="Cobertura envíos" value={vendor.coberturaEnvios} />
                                  <Field label="Inventario propio" value={vendor.inventarioPropio} />
                                  <Field label="Precios mayoristas" value={vendor.preciosMayoristas} />
                                  <Field label="Ofrece garantía" value={vendor.ofreceGarantia} />
                                </div>
                                {vendor.descripcion && (
                                  <div className="mt-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a2a5aa]">Descripción</p>
                                    <p className="mt-0.5 text-sm leading-6 text-[#1f2328]">{vendor.descripcion}</p>
                                  </div>
                                )}
                              </div>

                              {/* Documentos — siempre visibles */}
                              <>
                                <div className="border-t border-black/6" />
                                <div>
                                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b8d91]">Documentos adjuntos</p>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    {docLinks.map((doc) => {
                                      if (!doc.url) {
                                        return (
                                          <div key={doc.label} className="overflow-hidden rounded-[1.1rem] border border-dashed border-black/12 bg-white">
                                            <div className="flex items-center justify-between gap-3 border-b border-black/6 px-4 py-2.5">
                                              <p className="text-sm font-semibold text-[#a2a5aa]">{doc.label}</p>
                                              <span className="rounded-full bg-[#f5f5f4] px-2.5 py-1 text-xs font-medium text-[#a2a5aa]">No subido</span>
                                            </div>
                                            <div className="flex h-20 items-center justify-center gap-2 bg-[#fafaf9]">
                                              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 text-[#c8cacd]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                                <path d="M14 2v6h6"/>
                                              </svg>
                                              <p className="text-xs text-[#c8cacd]">Pendiente de entrega</p>
                                            </div>
                                          </div>
                                        );
                                      }
                                      const url = doc.url;
                                      const ext = url.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
                                      const isImage = ["jpg","jpeg","png","webp","gif","svg"].includes(ext);
                                      const isPdf = ext === "pdf";
                                      return (
                                        <div key={doc.label} className="overflow-hidden rounded-[1.1rem] border border-black/8 bg-white">
                                          <div className="flex items-center justify-between gap-3 border-b border-black/6 px-4 py-2.5">
                                            <div className="flex items-center gap-2">
                                              <span className="h-1.5 w-1.5 rounded-full bg-[#1f8b45]" />
                                              <p className="text-sm font-semibold text-[#1f2328]">{doc.label}</p>
                                            </div>
                                            <a
                                              href={url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-[#16384f] transition-colors hover:bg-[#16384f] hover:text-white"
                                            >
                                              Abrir
                                              <svg aria-hidden="true" viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M2 2h8v8"/><path d="M2 10 10 2"/>
                                              </svg>
                                            </a>
                                          </div>
                                          {isImage ? (
                                            <img src={url} alt={doc.label} className="max-h-48 w-full object-contain bg-[#f8f8f7] p-2" />
                                          ) : isPdf ? (
                                            <iframe src={url} title={doc.label} className="h-48 w-full" />
                                          ) : (
                                            <div className="flex h-24 flex-col items-center justify-center gap-1.5 bg-[#f8f8f7]">
                                              <svg aria-hidden="true" viewBox="0 0 32 32" className="h-8 w-8 text-[#16384f]/25" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M18 3H8a2 2 0 0 0-2 2v22a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V11z"/>
                                                <path d="M18 3v8h8"/>
                                              </svg>
                                              <p className="text-xs text-[#a2a5aa]">Archivo subido · haz clic en Abrir</p>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                    </div>
                                  </div>
                                </>
                            </div>
                          );
                        })()}

                        {/* Acciones */}
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-b-[2rem] border-t border-black/6 bg-[#fafaf9] px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setVendorExpandedId(vendorExpandedId === vendor.id ? null : vendor.id)}
                              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#16384f] transition-all duration-200 hover:bg-[#16384f] hover:text-white"
                            >
                              <svg
                                aria-hidden="true"
                                viewBox="0 0 20 20"
                                className={`h-3.5 w-3.5 transition-transform duration-200 ${vendorExpandedId === vendor.id ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M5 7.5l5 5 5-5" />
                              </svg>
                              {vendorExpandedId === vendor.id ? "Ocultar detalle" : "Ver detalle"}
                            </button>
                            {vendor.estado !== "EN_REVISION" && (
                              <button
                                type="button"
                                disabled={isSaving}
                                onClick={() => void handleVendorEstado(vendor.id, "EN_REVISION")}
                                className="inline-flex items-center gap-2 rounded-full border border-[#6366f1]/20 bg-[#f0f0ff] px-4 py-2 text-sm font-semibold text-[#4338ca] transition-all duration-200 hover:bg-[#e0e0ff] disabled:opacity-50"
                              >
                                Poner en revisión
                              </button>
                            )}
                            {vendor.estado !== "PENDIENTE" && (
                              <button
                                type="button"
                                disabled={isSaving}
                                onClick={() => void handleVendorEstado(vendor.id, "PENDIENTE")}
                                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#5d6167] transition-all duration-200 hover:bg-[#f8f8f7] disabled:opacity-50"
                              >
                                Marcar pendiente
                              </button>
                            )}
                          </div>

                          <div className="flex gap-3">
                            <button
                              type="button"
                              disabled={isSaving || isRechazada}
                              onClick={() => void handleVendorEstado(vendor.id, "RECHAZADA")}
                              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-40 ${
                                isRechazada
                                  ? "bg-[#fff1f1] text-[#c53b3b] cursor-default"
                                  : "border border-[#c53b3b]/20 bg-[#fff1f1] text-[#c53b3b] hover:bg-[#ffe0e0]"
                              }`}
                            >
                              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 5l10 10M15 5 5 15" />
                              </svg>
                              {isRechazada ? "Rechazada" : "Rechazar"}
                            </button>

                            <button
                              type="button"
                              disabled={isSaving || isAprobada}
                              onClick={() => void handleVendorEstado(vendor.id, "APROBADA")}
                              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-40 ${
                                isAprobada
                                  ? "bg-[#1f8b45] text-white cursor-default shadow-[0_8px_20px_rgba(31,139,69,0.3)]"
                                  : "bg-[#1f8b45] text-white hover:bg-[#176b35] shadow-[0_8px_20px_rgba(31,139,69,0.2)] hover:shadow-[0_8px_24px_rgba(31,139,69,0.35)]"
                              }`}
                            >
                              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 10.5 8 14.5l8-9" />
                              </svg>
                              {isAprobada ? "Aprobada" : "Aprobar"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          </div>
        </section>
      )}
    </main>
  );
}
