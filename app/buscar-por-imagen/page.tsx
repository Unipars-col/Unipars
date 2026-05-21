import ImageSearchClient from "./image-search-client";
import { getProducts } from "@/lib/products";

export const metadata = {
  title: "Buscar por imagen | Unipars",
  description: "Búsqueda visual de repuestos por imagen en Unipars.",
};

export default async function BuscarPorImagenPage() {
  const products = await getProducts();
  const selectedProduct = products[0];

  if (!selectedProduct) {
    return (
      <main className="min-h-[calc(100vh-90px)] bg-[#f5f6f8] px-6 py-16">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-black/8 bg-white p-10 text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8b8d91]">
            Buscar por imagen
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[#16384f]">
            Aún no hay productos cargados
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-90px)] bg-[#eef2f5] px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-[520px]">
        <section className="rounded-[6px] border border-black/10 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          <div className="border-b border-black/8 px-6 py-5">
            <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[#1f2328]">
              Buscar por imagen
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#5f666d]">
              Sube una imagen del repuesto en formato JPG, PNG o WEBP.
            </p>
          </div>
          <ImageSearchClient fallbackProduct={selectedProduct} />
        </section>
      </div>
    </main>
  );
}
