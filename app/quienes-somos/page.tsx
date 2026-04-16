import Image from "next/image";
import Link from "next/link";

const beneficios = [
  {
    titulo: "Catálogo amplio",
    descripcion: "Miles de referencias disponibles para tus vehículos",
    icono: "/icon-catalogo.png",
  },
  {
    titulo: "Entrega rápida",
    descripcion: "Recibe tus repuestos en el menor tiempo posible",
    icono: "/icon-entrega.png",
  },
  {
    titulo: "Compra segura",
    descripcion: "Protegemos tu información en cada transacción",
    icono: "/icon-segura.png",
  },
];

export default function QuienesSomosPage() {
  return (
    <main className="min-h-screen bg-white text-[#1c2c3a]">
      
      {/* 1. BANNER PRINCIPAL */}
      <section className="relative w-full min-h-[550px] md:min-h-[700px] flex items-center bg-[#f2f2f2] overflow-hidden">
        
        {/* Capa de Imagen (Robot) */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('/robot-unipars.jpg')`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right center",
            backgroundSize: "contain", 
          }}
        />

        {/* Capa de Degradado */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#f2f2f2] via-[#f2f2f2]/90 to-transparent md:via-[#f2f2f2]/30" />

        <div className="relative z-20 mx-auto max-w-[1280px] w-full px-6 md:px-10">
          <div className="max-w-[700px]">
            <p className="text-[14px] font-bold uppercase tracking-[0.25em] text-[#ed8435]">
              ¿QUIÉNES SOMOS?
            </p>

            <h1 className="mt-6 text-[45px] font-black leading-[1.05] tracking-[-0.03em] text-[#2f4f68] md:text-[65px] lg:text-[75px]">
              Impulsamos <br />
              <span className="text-[#ed8435]">el movimiento</span> <br />
              de miles de vehículos
            </h1>

            <p className="mt-8 max-w-[500px] text-[18px] leading-relaxed text-[#4c6275] md:text-[21px]">
              En <span className="font-bold text-[#2f4f68]">Unipars</span> conectamos calidad, tecnología y confianza para que encuentres el repuesto exacto en toda Colombia.
            </p>

            <div className="mt-10">
              <Link 
                href="/catalogo" 
                className="inline-block bg-[#2f4f68] text-white px-8 py-4 rounded-full font-bold hover:bg-[#ed8435] transition-all shadow-lg hover:-translate-y-1"
              >
                Explorar Catálogo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECCIÓN DE CONTENIDO */}
      <section className="mx-auto max-w-[1280px] px-6 py-24 md:px-10">
        
        {/* BENEFICIOS */}
        <div className="grid gap-8 md:grid-cols-3">
          {beneficios.map((item) => (
            <article
              key={item.titulo}
              className="group flex flex-col items-center rounded-[40px] border border-[#f0f0f0] bg-white p-10 text-center shadow-[0_15px_45px_rgba(0,0,0,0.05)] transition-all hover:border-[#ed8435]/30 hover:shadow-[0_25px_60px_rgba(0,0,0,0.1)]"
            >
              <div className="mb-8 flex h-[110px] w-[110px] items-center justify-center rounded-full bg-[#f6f6f6] shadow-inner group-hover:scale-110 transition-transform">
                <div className="flex h-[85px] w-[85px] items-center justify-center rounded-full bg-white shadow-md border border-[#f0f0f0]">
                  <Image
                    src={item.icono}
                    alt={item.titulo}
                    width={40}
                    height={40}
                    style={{ width: "40px", height: "auto" }} // CORRECCIÓN AQUÍ
                    className="object-contain"
                  />
                </div>
              </div>
              <h2 className="text-[24px] font-black tracking-tight text-[#2f4f68]">{item.titulo}</h2>
              <div className="my-5 h-[4px] w-14 rounded-full bg-[#ed8435]" />
              <p className="max-w-[220px] text-[16px] leading-relaxed text-[#5c7285]">{item.descripcion}</p>
            </article>
          ))}
        </div>

        {/* MISIÓN Y VISIÓN */}
        <div className="mt-32 flex flex-col gap-12">
          
          {/* MISIÓN */}
          <div className="flex flex-col md:flex-row items-center rounded-[40px] bg-white px-8 py-12 md:px-16 border-l-[12px] border-[#ed8435] shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-all hover:shadow-xl">
            <div className="mb-8 md:mb-0 md:mr-16 flex h-[120px] w-[120px] shrink-0 items-center justify-center rounded-3xl bg-[#ed8435]/10">
              <Image 
                src="/icon-mision.png" 
                alt="Misión" 
                width={60} 
                height={60} 
                style={{ width: "60px", height: "auto" }} // CORRECCIÓN AQUÍ
              />
            </div>
            <div>
              <h3 className="text-[32px] font-black text-[#2f4f68] tracking-tighter mb-3 uppercase">Nuestra Misión</h3>
              <p className="max-w-[800px] text-[19px] leading-relaxed text-[#4c6275]">
                Ser líderes en repuestos automotrices con calidad y precio, brindando soluciones reales a clientes y talleres con excelencia e innovación.
              </p>
            </div>
          </div>
          
          {/* VISIÓN */}
          <div className="flex flex-col md:flex-row items-center rounded-[40px] bg-[#2f4f68] px-8 py-12 md:px-16 border-l-[12px] border-[#ed8435] shadow-2xl transition-all hover:scale-[1.01]">
            <div className="mb-8 md:mb-0 md:mr-16 flex h-[120px] w-[120px] shrink-0 items-center justify-center rounded-3xl bg-white/10">
              <Image 
                src="/icon-vision.png" 
                alt="Visión" 
                width={60} 
                height={60} 
                className="brightness-200"
                style={{ width: "60px", height: "auto" }} // CORRECCIÓN AQUÍ
              />
            </div>
            <div>
              <h3 className="text-[32px] font-black text-white tracking-tighter mb-3 uppercase">Nuestra Visión</h3>
              <p className="max-w-[800px] text-[19px] leading-relaxed text-blue-50/80">
                Ser la empresa más confiable del sector, expandiéndonos a nivel nacional e internacional como referentes en calidad y servicio.
              </p>
            </div>
          </div>
        </div>

      </section>
    </main>
  );
}