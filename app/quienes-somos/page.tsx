import Image from "next/image";
import Link from "next/link";

const pilares = [
  {
    titulo: "Compra clara",
    descripcion:
      "Te ayudamos a encontrar repuestos y soluciones con informacion simple y directa.",
  },
  {
    titulo: "Respaldo real",
    descripcion:
      "Conectamos categorias, productos y atencion para que compres con mayor confianza.",
  },
  {
    titulo: "Atencion cercana",
    descripcion:
      "Acompanamos a talleres, negocios y clientes finales en cada paso de la compra.",
  },
];

export default function QuienesSomosPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f5] text-[#111]">
      <section className="bg-[#16384f] text-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-6 py-16 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <Link
              href="/"
              className="text-sm font-semibold uppercase tracking-[0.24em] text-[#ed8435] transition-colors duration-200 hover:text-white"
            >
              Volver al inicio
            </Link>

            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-white/55">
              Quiénes somos
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
              Unipars nace para conectar repuestos, confianza y servicio.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">
              Construimos una experiencia de compra mas clara para personas,
              talleres y negocios que buscan productos confiables, soporte y
              procesos simples.
            </p>
          </div>

          <div className="overflow-hidden rounded-[2rem] bg-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
            <Image
              src="/hero-unipars.jpg"
              alt="Equipo y soluciones Unipars"
              width={720}
              height={520}
              className="h-auto w-full max-w-xl object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {pilares.map((pilar) => (
            <article
              key={pilar.titulo}
              className="rounded-[1.75rem] border border-black/8 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.05)]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#ed8435]">
                Unipars
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[#1f2328]">
                {pilar.titulo}
              </h2>
              <p className="mt-4 text-base leading-8 text-[#6e7379]">
                {pilar.descripcion}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 pb-20">
        <div className="rounded-[2rem] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.05)] md:p-12">
          <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#ed8435]">
                Nuestra visión
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#16384f] md:text-5xl">
                Ser una marca cercana, util y confiable para cada compra.
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6e7379]">
                Queremos que encontrar un repuesto o una categoria no sea una
                tarea complicada, sino una experiencia agil, clara y respaldada
                por un servicio humano.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-[#f8f8f7] p-6">
                <p className="text-4xl font-semibold tracking-[-0.05em] text-[#16384f]">
                  +1.000
                </p>
                <p className="mt-2 text-sm leading-7 text-[#6e7379]">
                  Productos y soluciones listas para crecer contigo.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-[#f8f8f7] p-6">
                <p className="text-4xl font-semibold tracking-[-0.05em] text-[#16384f]">
                  100%
                </p>
                <p className="mt-2 text-sm leading-7 text-[#6e7379]">
                  Enfoque en una experiencia clara y servicio con respaldo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
