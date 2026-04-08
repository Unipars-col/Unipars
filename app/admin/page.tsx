"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useProducts } from "../components/products-provider";
import { categorias, type Categoria, type ProductoCatalogo } from "../data/catalog";

const disponibilidades: ProductoCatalogo["disponibilidad"][] = [
  "Entrega inmediata",
  "Disponible por pedido",
  "Recoger en tienda",
];

type FormState = {
  categoria: Categoria;
  nombre: string;
  marca: string;
  precioValor: string;
  precioAnteriorValor: string;
  imagen: string;
  disponibilidad: ProductoCatalogo["disponibilidad"];
};

const initialState: FormState = {
  categoria: categorias[0],
  nombre: "",
  marca: "Unipars",
  precioValor: "",
  precioAnteriorValor: "",
  imagen: "/hero-unipars.jpg",
  disponibilidad: "Entrega inmediata",
};

const ADMIN_EMAIL = "unipars@gail.com";
const ADMIN_PASSWORD = "15472007";
const ADMIN_STORAGE_KEY = "unipars-admin-auth";

export default function AdminPage() {
  const { adminProducts, createProduct, removeProduct } = useProducts();
  const [form, setForm] = useState<FormState>(initialState);
  const [saved, setSaved] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(ADMIN_STORAGE_KEY) === "true";
  });

  const productCountLabel = useMemo(
    () => `${adminProducts.length} producto${adminProducts.length === 1 ? "" : "s"} creados`,
    [adminProducts.length],
  );

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    createProduct({
      categoria: form.categoria,
      nombre: form.nombre,
      marca: form.marca,
      precioValor: Number(form.precioValor),
      precioAnteriorValor: Number(form.precioAnteriorValor || form.precioValor),
      imagen: form.imagen,
      disponibilidad: form.disponibilidad,
    });

    setForm(initialState);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const handleAdminLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      email.trim().toLowerCase() === ADMIN_EMAIL &&
      password === ADMIN_PASSWORD
    ) {
      window.localStorage.setItem(ADMIN_STORAGE_KEY, "true");
      setIsAuthenticated(true);
      setAuthError("");
      setPassword("");
      return;
    }

    setAuthError("Correo o contraseña incorrectos.");
  };

  const handleLogout = () => {
    window.localStorage.removeItem(ADMIN_STORAGE_KEY);
    setIsAuthenticated(false);
    setEmail("");
    setPassword("");
    setAuthError("");
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] text-[#111]">
        <section className="mx-auto flex max-w-[1440px] px-6 py-16">
          <div className="mx-auto w-full max-w-md rounded-[2rem] border border-black/8 bg-white p-8 shadow-[0_16px_35px_rgba(15,23,42,0.05)]">
            <Link
              href="/"
              className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16384f] transition-colors duration-200 hover:text-[#ed8435]"
            >
              Volver al inicio
            </Link>

            <div className="mt-6">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#ed8435]">
                Acceso administrador
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#16384f]">
                Ingresar al panel
              </h1>
              <p className="mt-3 text-sm leading-7 text-[#6e7379]">
                Solo una cuenta autorizada puede administrar productos.
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="mt-8 space-y-5">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-[#4f545a]">
                  Correo electrónico
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="unipars@gail.com"
                  required
                  className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-[#4f545a]">
                  Contraseña
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Ingresa tu contraseña"
                  required
                  className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
                />
              </label>

              {authError && (
                <p className="rounded-2xl border border-[#ed8435]/20 bg-[#fff6ee] px-4 py-3 text-sm font-medium text-[#b85d12]">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-full bg-[#ed8435] px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#d67024]"
              >
                Entrar como administrador
              </button>
            </form>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5] text-[#111]">
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
              catálogo sin modificar el código.
            </p>
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

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
          <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_16px_35px_rgba(15,23,42,0.05)] md:p-8"
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

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-[#4f545a]">
                  Imagen en public
                </span>
                <input
                  name="imagen"
                  value={form.imagen}
                  onChange={handleChange}
                  placeholder="/mi-producto.jpg"
                  className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#ed8435]"
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

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="submit"
                className="inline-flex rounded-full bg-[#ed8435] px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#d67024]"
              >
                Crear producto
              </button>
              <button
                type="button"
                onClick={() => setForm(initialState)}
                className="inline-flex rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
              >
                Limpiar
              </button>
            </div>
          </form>

          <aside className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_16px_35px_rgba(15,23,42,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b8d91]">
              Productos creados
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#16384f]">
              {productCountLabel}
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#6e7379]">
              Estos productos se guardan en este navegador y aparecen en catálogo
              y en la vista de detalle.
            </p>

            <div className="mt-8 space-y-4">
              {adminProducts.length === 0 ? (
                <div className="rounded-[1.4rem] border border-dashed border-black/12 bg-[#fafaf9] p-6 text-sm leading-7 text-[#6e7379]">
                  Aún no has creado productos desde el panel.
                </div>
              ) : (
                adminProducts.map((product) => (
                  <article
                    key={product.slug}
                    className="rounded-[1.4rem] border border-black/8 bg-[#fafaf9] p-4"
                  >
                    <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#8b8d91]">
                      {product.categoria}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-[#1f2328]">
                      {product.nombre}
                    </h3>
                    <p className="mt-1 text-sm text-[#6e7379]">{product.marca}</p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-lg font-semibold text-[#ed8435]">
                        {product.precio}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeProduct(product.slug)}
                        className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
