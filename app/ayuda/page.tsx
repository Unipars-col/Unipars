import type { Metadata } from "next";
import HelpSearch from "./help-search";
import HelpCategories from "./help-categories";
import SiteFooter from "../components/site-footer";

export const metadata: Metadata = {
  title: "Centro de ayuda — Unipars",
  description:
    "Encuentra respuestas rápidas sobre repuestos, talleres, proveedores y seguridad en Unipars.",
};

const categories = [
  {
    id: "compradores",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    ),
    title: "Compradores",
    description: "Busca repuestos, cotizaciones, seguimiento de pedidos y devoluciones.",
    color: "bg-blue-50 text-blue-700",
  },
  {
    id: "talleres",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
    title: "Talleres",
    description: "Registro, perfil, red Uniparceros y gestión de servicios aliados.",
    color: "bg-orange-50 text-orange-700",
  },
  {
    id: "proveedores",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
    title: "Proveedores",
    description: "Cómo vender, publicar catálogo, comisiones y gestión de cuenta.",
    color: "bg-green-50 text-green-700",
  },
  {
    id: "pagos",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    title: "Pagos y facturación",
    description: "Métodos de pago, facturas electrónicas y comprobantes.",
    color: "bg-purple-50 text-purple-700",
  },
  {
    id: "envios",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 5v3h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    title: "Envíos y entregas",
    description: "Cobertura nacional, tiempos de entrega y seguimiento.",
    color: "bg-sky-50 text-sky-700",
  },
  {
    id: "seguridad",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Seguridad y garantías",
    description: "Productos verificados, garantías y reportes de inconvenientes.",
    color: "bg-rose-50 text-rose-700",
  },
];

const faqs = [
  {
    id: "buscar-repuesto",
    q: "¿Cómo busco un repuesto en Unipars?",
    a: "Usa la barra de búsqueda en la parte superior o navega por categorías. Puedes filtrar por marca, tipo de vehículo o línea de producto. También puedes usar la búsqueda visual para subir una foto del repuesto.",
    tags: "buscar repuesto catálogo",
    categories: ["compradores"],
  },
  {
    id: "cotizacion",
    q: "¿Cómo solicito una cotización?",
    a: "Desde la página de cualquier producto puedes contactar directamente al proveedor o al equipo comercial por WhatsApp. Para pedidos de volumen, usa el formulario en /contacto y te respondemos en menos de 24 horas.",
    tags: "cotización precio pedido",
    categories: ["compradores", "proveedores"],
  },
  {
    id: "taller-cercano",
    q: "¿Cómo encuentro un taller cerca de mí?",
    a: "Ve a la sección 'Uniparceros' en el menú principal. Puedes filtrar por ciudad y tipo de servicio para encontrar talleres aliados verificados cerca de tu ubicación.",
    tags: "taller cercano servicio",
    categories: ["compradores", "talleres"],
  },
  {
    id: "registro-taller",
    q: "¿Cómo registro mi taller?",
    a: "Ingresa a 'Vender' en el menú y selecciona 'Registrar como taller aliado'. Completa el formulario con la información de tu negocio. Nuestro equipo validará tu solicitud en 2-3 días hábiles.",
    tags: "registro taller aliado uniparcero",
    categories: ["talleres"],
  },
  {
    id: "vender-proveedor",
    q: "¿Cómo puedo vender repuestos como proveedor?",
    a: "Ve a la sección 'Vender' y selecciona 'Registrar empresa proveedora'. Necesitas RUT, cámara de comercio y catálogo de productos. Una vez aprobado puedes publicar tu inventario directamente en la plataforma.",
    tags: "vender proveedor empresa",
    categories: ["proveedores"],
  },
  {
    id: "comision",
    q: "¿Qué comisión cobra Unipars?",
    a: "La comisión varía según el volumen de ventas y el tipo de proveedor. Los planes van desde 5% hasta 12% por transacción. Consulta los planes detallados en la sección 'Vender' o contacta a nuestro equipo comercial.",
    tags: "comisión tarifa costo",
    categories: ["proveedores", "pagos"],
  },
  {
    id: "metodos-pago",
    q: "¿Qué métodos de pago aceptan?",
    a: "Aceptamos transferencias bancarias, pagos PSE, consignaciones y efectivo en puntos autorizados. Para compras de volumen también manejamos crédito empresarial previa aprobación.",
    tags: "pago método transferencia PSE",
    categories: ["pagos", "compradores"],
  },
  {
    id: "factura",
    q: "¿Cómo solicito mi factura electrónica?",
    a: "La factura se genera automáticamente al confirmar el pago y se envía al correo registrado. Si necesitas datos adicionales como NIT o razón social, actualiza tu perfil en 'Mi cuenta' antes de hacer el pedido.",
    tags: "factura electrónica NIT",
    categories: ["pagos"],
  },
  {
    id: "tiempo-entrega",
    q: "¿Cuánto demora el envío a mi ciudad?",
    a: "Los envíos a Bogotá, Medellín, Cali y Barranquilla tardan 1-2 días hábiles. A otras ciudades principales 2-3 días. Para municipios apartados puede ser 3-5 días hábiles. Recibirás un código de rastreo una vez despachado.",
    tags: "envío tiempo entrega días",
    categories: ["envios", "compradores"],
  },
  {
    id: "cobertura-envio",
    q: "¿Hacen envíos a todo Colombia?",
    a: "Sí, cubrimos todo el territorio nacional a través de alianzas con operadores logísticos como Servientrega, Coordinadora y TCC. El costo varía según el peso, dimensiones y destino del pedido.",
    tags: "envío Colombia cobertura nacional",
    categories: ["envios"],
  },
  {
    id: "garantias",
    q: "¿Cómo funcionan las garantías?",
    a: "Todos los productos publicados en Unipars tienen garantía mínima de 3 meses. Si el repuesto presenta defectos de fabricación dentro del periodo de garantía, el proveedor está obligado a reponerlo sin costo adicional.",
    tags: "garantía devolución defecto",
    categories: ["seguridad", "compradores"],
  },
  {
    id: "reportar-problema",
    q: "¿Cómo reporto un problema con un pedido o proveedor?",
    a: "Desde tu cuenta en 'Mi cuenta' puedes abrir un caso de soporte adjuntando evidencias. También puedes escribirnos al WhatsApp (57) 305 724 9454 o al correo comercial1@unipars.com.co. Atendemos de lunes a sábado.",
    tags: "problema reporte soporte reclamo",
    categories: ["seguridad", "compradores"],
  },
];

export default function AyudaPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f5]">

      {/* Hero con buscador */}
      <section style={{ backgroundColor: "#1E3445" }} className="px-6 py-16 text-center">
        <h1 className="mb-3 text-3xl font-bold text-white md:text-4xl">
          ¿En qué podemos ayudarte?
        </h1>
        <p className="mb-8 text-base text-white/65">
          Encuentra respuestas rápidas sobre repuestos, talleres, proveedores y seguridad en Unipars.
        </p>
        <HelpSearch faqs={faqs} />
      </section>

      {/* Categorías + FAQ interactivo */}
      <HelpCategories categories={categories} faqs={faqs} />

      {/* Sección de contacto final */}
      <section style={{ backgroundColor: "#1E3445" }} className="px-6 py-14 text-center">
        <h2 className="mb-2 text-2xl font-bold text-white">
          ¿No encontraste lo que buscabas?
        </h2>
        <p className="mb-8 text-base text-white/65">
          Nuestro equipo puede ayudarte con tu solicitud.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="https://wa.me/573057249454"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "#F28C28" }}
          >
            Contactar soporte
          </a>
          <a
            href="/registro-empresa"
            className="rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            Registrar proveedor
          </a>
          <a
            href="/registro-aliado"
            className="rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            Registrar taller
          </a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
