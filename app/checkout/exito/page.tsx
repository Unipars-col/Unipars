import Link from "next/link";
import EncuestaReferido from "./encuesta-referido";
import FacturaElectronica from "./factura-electronica";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ pedido?: string; pagado?: string; id?: string }>;
}) {
  const params = await searchParams;
  const fromWompi = Boolean(params.id);
  const paymentConfirmed = params.pagado === "1" || fromWompi;

  return (
    <main className="flex min-h-[calc(100vh-88px)] items-center justify-center bg-[#f5f5f5] px-6 py-16">
      <section className="w-full max-w-2xl rounded-[2rem] bg-white p-8 text-center shadow-lg shadow-black/10 md:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#ed8435]">
          {paymentConfirmed ? "Pago procesado" : "Pedido creado"}
        </p>
        <h1 className="mt-3 text-3xl font-bold text-[#16384f] md:text-4xl">
          {paymentConfirmed
            ? "¡Tu pago fue recibido!"
            : "Recibimos tu solicitud correctamente"}
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          {paymentConfirmed
            ? "Wompi procesó tu pago. Recibirás una confirmación por correo y podrás ver el estado de tu pedido en tu cuenta."
            : "Tu pedido quedó guardado. Si cerraste la ventana de pago antes de completarlo, puedes retomarlo desde tu cuenta."}
        </p>

        {params.pedido && (
          <div className="mt-8 rounded-[1.4rem] border border-black/8 bg-[#fafaf9] px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b8d91]">
              Código de pedido
            </p>
            <p className="mt-2 text-lg font-semibold text-[#16384f]">{params.pedido}</p>
          </div>
        )}

        <FacturaElectronica pedido={params.pedido} />

        <EncuestaReferido />

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/mi-cuenta"
            className="rounded-full bg-[#ed8435] px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#d67024]"
          >
            Ver mis pedidos
          </Link>
          <Link
            href="/categorias"
            className="rounded-full border border-[#16384f]/20 px-6 py-3 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
          >
            Seguir comprando
          </Link>
        </div>
      </section>
    </main>
  );
}
