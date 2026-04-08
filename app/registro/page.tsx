import Link from "next/link";

export default function RegistroPage() {
  return (
    <main className="flex min-h-[calc(100vh-88px)] items-center justify-center bg-[#f5f5f5] px-6 py-16">
      <section className="w-full max-w-2xl rounded-[2rem] bg-white p-8 shadow-lg shadow-black/10 md:p-10">
        <Link
          href="/"
          className="text-sm font-semibold uppercase tracking-wide text-[#16384f] transition-colors duration-200 hover:text-[#ed8435]"
        >
          Volver al inicio
        </Link>

        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ed8435]">
            Unipars
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#16384f] md:text-4xl">
            Crear cuenta
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
            Regístrate para guardar pedidos, explorar categorías y comprar con
            una experiencia más ágil.
          </p>
        </div>

        <form className="mt-8 grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="nombre"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Nombre completo
            </label>
            <input
              id="nombre"
              type="text"
              placeholder="Tu nombre"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors duration-200 focus:border-[#ed8435]"
            />
          </div>

          <div>
            <label
              htmlFor="empresa"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Empresa o taller
            </label>
            <input
              id="empresa"
              type="text"
              placeholder="Nombre de tu negocio"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors duration-200 focus:border-[#ed8435]"
            />
          </div>

          <div>
            <label
              htmlFor="correo"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Correo electrónico
            </label>
            <input
              id="correo"
              type="email"
              placeholder="tu@correo.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors duration-200 focus:border-[#ed8435]"
            />
          </div>

          <div>
            <label
              htmlFor="telefono"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Teléfono
            </label>
            <input
              id="telefono"
              type="tel"
              placeholder="Tu número"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors duration-200 focus:border-[#ed8435]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="Crea una contraseña"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors duration-200 focus:border-[#ed8435]"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Repite tu contraseña"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors duration-200 focus:border-[#ed8435]"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full rounded-xl bg-[#ed8435] px-4 py-3 font-semibold text-white transition-colors duration-200 hover:bg-[#d67024]"
            >
              Crear cuenta
            </button>
          </div>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#16384f] transition-colors duration-200 hover:text-[#ed8435]"
          >
            Inicia sesión
          </Link>
        </p>
      </section>
    </main>
  );
}
