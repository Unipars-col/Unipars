import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-88px)] items-center justify-center bg-[#f5f5f5] px-6 py-16">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg shadow-black/10">
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
          <h1 className="mt-2 text-3xl font-bold text-[#16384f]">
            Iniciar sesión
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Ingresa tus datos para acceder a tu cuenta.
          </p>
        </div>

        <form className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              placeholder="tu@correo.com"
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
              placeholder="Ingresa tu contraseña"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-colors duration-200 focus:border-[#ed8435]"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#ed8435] px-4 py-3 font-semibold text-white transition-colors duration-200 hover:bg-[#d67024]"
          >
            Iniciar sesión
          </button>
        </form>
      </section>
    </main>
  );
}
