import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required.");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

function slug(name: string, suffix: string) {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    suffix
  );
}

function price(base: number) {
  const prev = Math.round(base * (1 + Math.random() * 0.3 + 0.1));
  return { price: base, previousPrice: prev };
}

const PLACEHOLDER = "/hero-unipars.jpg";

const products = [
  // ── Espejos retrovisores y soportes (10) ────────────────────────────
  { name: "Espejo retrovisor panorámico 180°", brand: "MirrorTech", category: "Espejos retrovisores y soportes", ...price(187000), sku: "ESP-001", description: "Espejo panorámico de gran angular para buses urbanos. Cristal templado de 5mm con marco reforzado en aluminio.", compatibility: ["Chevrolet NQR", "International 4300", "Mercedes OF-1721"] },
  { name: "Soporte brazo espejo izquierdo universal", brand: "Unipars", category: "Espejos retrovisores y soportes", ...price(98500), sku: "ESP-002", description: "Soporte de brazo para espejo lateral izquierdo, fabricado en acero galvanizado. Compatible con la mayoría de buses de servicio urbano.", compatibility: ["Universal buses urbanos"] },
  { name: "Kit espejo lateral doble vista", brand: "ProVision", category: "Espejos retrovisores y soportes", ...price(243000), sku: "ESP-003", description: "Kit completo con espejo principal y espejo gran angular para punto ciego. Incluye brazo y herrajes de fijación.", compatibility: ["Agrale MA 15.0", "Volkswagen 17.230"] },
  { name: "Cristal repuesto espejo plano 200x150mm", brand: "GlassPro", category: "Espejos retrovisores y soportes", ...price(54000), sku: "ESP-004", description: "Cristal de repuesto plano para espejos laterales. Dimensiones 200x150mm. Vidrio templado con borde pulido.", compatibility: ["Universal"] },
  { name: "Espejo retrovisor interior panorámico", brand: "SafeView", category: "Espejos retrovisores y soportes", ...price(165000), sku: "ESP-005", description: "Espejo interior de 30cm para visibilidad completa del interior del bus. Anti-deslumbrante y anti-vibración.", compatibility: ["Universal buses"] },
  { name: "Soporte espejo derecho articulado", brand: "FlexMount", category: "Espejos retrovisores y soportes", ...price(112000), sku: "ESP-006", description: "Soporte articulado con resorte de retorno para espejo lateral derecho. Fabricado en aluminio fundido.", compatibility: ["Mercedes OF-1218", "Volkswagen 15.190"] },
  { name: "Espejo gran angular punto ciego 6 pulgadas", brand: "ProVision", category: "Espejos retrovisores y soportes", ...price(78000), sku: "ESP-007", description: "Espejo auxiliar convexo de 6 pulgadas para eliminación de puntos ciegos en esquinas y maniobras.", compatibility: ["Universal"] },
  { name: "Kit soporte doble brazo espejo largo", brand: "Unipars", category: "Espejos retrovisores y soportes", ...price(198000), sku: "ESP-008", description: "Kit de soporte doble brazo para buses de carretera. Alcance extendido 45cm desde la carrocería.", compatibility: ["Marcopolo Viaggio", "Busscar Vissta"] },
  { name: "Espejo lateral eléctrico 12V ajustable", brand: "ElectroMirror", category: "Espejos retrovisores y soportes", ...price(312000), sku: "ESP-009", description: "Espejo lateral con ajuste eléctrico a 12V. Motor paso a paso silencioso con 3 posiciones de memoria.", compatibility: ["Modelos con arnés eléctrico"] },
  { name: "Tornillería kit fijación espejo M10", brand: "Unipars", category: "Espejos retrovisores y soportes", ...price(35000), sku: "ESP-010", description: "Kit completo de tornillos, tuercas y arandelas M10 inoxidables para instalación de espejos.", compatibility: ["Universal"] },

  // ── Motores y ventiladores (10) ──────────────────────────────────────
  { name: "Ventilador radiador 24V 450mm", brand: "CoolTech", category: "Motores y ventiladores", ...price(487000), sku: "MOT-001", description: "Ventilador axial para radiador de motor diésel. 24V, 450mm de diámetro, caudal 4200 m³/h.", compatibility: ["Cummins ISB", "Cummins ISC"] },
  { name: "Motor ventilador habitáculo 12V 180W", brand: "ClimaPlus", category: "Motores y ventiladores", ...price(213000), sku: "MOT-002", description: "Motor eléctrico para ventilación interna de pasajeros. 12V, 180W, 3 velocidades.", compatibility: ["Universal buses urbanos"] },
  { name: "Conjunto ventilador intercooler universal", brand: "AirFlow", category: "Motores y ventiladores", ...price(365000), sku: "MOT-003", description: "Ventilador auxiliar para intercooler en motores turbocargados. Incluye soporte de montaje.", compatibility: ["Motores turbo 4 y 6 cilindros"] },
  { name: "Correa ventilador serpentina 8PK-1865", brand: "Gates", category: "Motores y ventiladores", ...price(87000), sku: "MOT-004", description: "Correa de accesorios tipo serpentina 8 canales, longitud 1865mm. Alta resistencia a temperatura y aceite.", compatibility: ["Cummins ISB 4.5", "Volkswagen 17.230 OD"] },
  { name: "Polea tensora correa accesorios", brand: "SKF", category: "Motores y ventiladores", ...price(156000), sku: "MOT-005", description: "Polea tensora con rodamiento sellado para correa de accesorios. Incluye tornillo de fijación central.", compatibility: ["Mercedes OM 906", "Mercedes OM 926"] },
  { name: "Motor eléctrico bomba agua auxiliar 24V", brand: "Bosch", category: "Motores y ventiladores", ...price(423000), sku: "MOT-006", description: "Bomba de agua eléctrica auxiliar para sistemas de calefacción. 24V, 100W, 40L/min.", compatibility: ["Buses con calefacción auxiliar"] },
  { name: "Rodamiento ventilador 6208-2RS", brand: "FAG", category: "Motores y ventiladores", ...price(48000), sku: "MOT-007", description: "Rodamiento de bolas sellado 6208-2RS para ejes de ventilador. Capacidad dinámica 29kN.", compatibility: ["Universal ventiladores"] },
  { name: "Soporte motor ventilador universal", brand: "Unipars", category: "Motores y ventiladores", ...price(134000), sku: "MOT-008", description: "Soporte de montaje en acero para motor de ventilador. Ajuste universal con ranuras de 6 posiciones.", compatibility: ["Universal"] },
  { name: "Manguera silicona radiador superior 50mm", brand: "SiliFlex", category: "Motores y ventiladores", ...price(76000), sku: "MOT-009", description: "Manguera de silicona roja para circuito superior de radiador. Diámetro interno 50mm, longitud 55cm.", compatibility: ["Cummins ISB", "Cummins QSB"] },
  { name: "Termostato motor 83°C universal diésel", brand: "Wahler", category: "Motores y ventiladores", ...price(95000), sku: "MOT-010", description: "Termostato de apertura a 83°C para motores diésel de buses. Incluye junta de sellado.", compatibility: ["Cummins 4 y 6 cilindros", "Scania DC"] },

  // ── Luces y direccionales (10) ───────────────────────────────────────
  { name: "Faro LED frontal H4 24V 70W", brand: "LuminaPlus", category: "Luces y direccionales", ...price(224000), sku: "LUC-001", description: "Faro LED de alta potencia para montaje frontal. Casquillo H4, 24V, 70W efectivos. Temperatura 6000K.", compatibility: ["Universal 24V"] },
  { name: "Kit luces de posición LED naranja 24V", brand: "Unipars", category: "Luces y direccionales", ...price(67000), sku: "LUC-002", description: "Kit de 4 luces de posición laterales LED color naranja. 24V, IP67 resistentes al agua.", compatibility: ["Universal"] },
  { name: "Faro trasero completo LED con stop", brand: "TailLight Pro", category: "Luces y direccionales", ...price(189000), sku: "LUC-003", description: "Faro trasero LED integrado: stop, direccional y marcha atrás. Carcasa en policarbonato anti-UV.", compatibility: ["Buses carrocería de 10-12m"] },
  { name: "Bombillo H7 24V 70W halógeno", brand: "Osram", category: "Luces y direccionales", ...price(38000), sku: "LUC-004", description: "Bombillo halógeno H7 para vehículos 24V. 70W, larga vida útil 1000h, fácil reemplazo.", compatibility: ["Universal 24V"] },
  { name: "Módulo control luces CAN-Bus 24V", brand: "Hella", category: "Luces y direccionales", ...price(345000), sku: "LUC-005", description: "Módulo electrónico de control de luces con protocolo CAN-Bus para buses modernos.", compatibility: ["Buses con electrónica CAN-Bus"] },
  { name: "Luz de emergencia LED estroboscópica", brand: "SafeFlash", category: "Luces y direccionales", ...price(134000), sku: "LUC-006", description: "Luz de emergencia LED con 12 modos de destello. 24V, IP65, montaje universal imán/tornillo.", compatibility: ["Universal"] },
  { name: "Flexible luces tablero 10 LEDs 24V", brand: "Unipars", category: "Luces y direccionales", ...price(28000), sku: "LUC-007", description: "Tira flexible LED para iluminación de tablero. 10 LEDs blanco cálido, 24V, adhesivo 3M.", compatibility: ["Universal"] },
  { name: "Luz lateral LED delineadora ámbar", brand: "SideMark", category: "Luces y direccionales", ...price(45000), sku: "LUC-008", description: "Luz lateral delineadora LED en ámbar. 24V, IP67, montaje empotrado en carrocería.", compatibility: ["Universal"] },
  { name: "Faro antiniebla frontal LED 55W", brand: "FogMaster", category: "Luces y direccionales", ...price(178000), sku: "LUC-009", description: "Faro antiniebla LED rectangular 55W efectivos. Haz de luz asimétrico SAE/ECE. 24V, IP68.", compatibility: ["Montaje universal 24V"] },
  { name: "Intermitente lateral espejo LED universal", brand: "Unipars", category: "Luces y direccionales", ...price(52000), sku: "LUC-010", description: "Módulo intermitente LED para incorporar en brazo de espejo. 24V, autoadhesivo + conector.", compatibility: ["Universal"] },

  // ── Sistemas limpiaparabrisas (10) ───────────────────────────────────
  { name: "Escobilla limpiaparabrisas 600mm pantógrafo", brand: "Bosch", category: "Sistemas limpiaparabrisas", ...price(87000), sku: "LIM-001", description: "Escobilla pantógrafo de 600mm para sistemas de barrido paralelo. Goma de silicona de alta durabilidad.", compatibility: ["Mercedes OF-1218", "Comil Campione"] },
  { name: "Motor limpiaparabrisas 24V pantógrafo", brand: "Valeo", category: "Sistemas limpiaparabrisas", ...price(312000), sku: "LIM-002", description: "Motor de limpiaparabrisas 24V con mecanismo de estacionamiento automático. 2 velocidades + intermitente.", compatibility: ["Mercedes Benz OF-1721", "Volkswagen 17.230"] },
  { name: "Brazo limpiaparabrisas izquierdo 550mm", brand: "Unipars", category: "Sistemas limpiaparabrisas", ...price(134000), sku: "LIM-003", description: "Brazo porta-escobilla 550mm lado izquierdo. Acero inoxidable con resorte de presión regulable.", compatibility: ["Universal pantógrafo"] },
  { name: "Depósito agua parabrisas 5L con bomba 24V", brand: "WashPro", category: "Sistemas limpiaparabrisas", ...price(167000), sku: "LIM-004", description: "Depósito de 5 litros con bomba eléctrica integrada 24V. Incluye filtro y dos salidas de manguera.", compatibility: ["Universal"] },
  { name: "Bomba washer 24V doble salida", brand: "Bosch", category: "Sistemas limpiaparabrisas", ...price(78000), sku: "LIM-005", description: "Bomba eléctrica para sistema lavador de parabrisas. 24V, doble salida, caudal 1.2L/min.", compatibility: ["Universal 24V"] },
  { name: "Kit manguera y boquillas washer universal", brand: "Unipars", category: "Sistemas limpiaparabrisas", ...price(45000), sku: "LIM-006", description: "Kit completo de manguera 6mm y 4 boquillas ajustables para sistema de lavado de parabrisas.", compatibility: ["Universal"] },
  { name: "Escobilla plana 700mm clip universal", brand: "SWF", category: "Sistemas limpiaparabrisas", ...price(67000), sku: "LIM-007", description: "Escobilla plana aerodinámicas 700mm con adaptador universal clip. Goma de grafito sin chattering.", compatibility: ["Universal clip 22mm"] },
  { name: "Temporizador relay limpiaparabrisas 24V", brand: "Hella", category: "Sistemas limpiaparabrisas", ...price(89000), sku: "LIM-008", description: "Relé temporizado ajustable para intervalo de limpiaparabrisas. 24V, 5 posiciones 2-30 segundos.", compatibility: ["Universal 24V"] },
  { name: "Goma repuesto escobilla silicona 600mm", brand: "Trico", category: "Sistemas limpiaparabrisas", ...price(34000), sku: "LIM-009", description: "Repuesto de goma de silicona para escobilla 600mm. Silicona hidrófobo de alto rendimiento.", compatibility: ["Universal 600mm"] },
  { name: "Mecanismo limpiaparabrisas completo 24V", brand: "Valeo", category: "Sistemas limpiaparabrisas", ...price(456000), sku: "LIM-010", description: "Mecanismo completo de limpiaparabrisas con motor, brazos y biela. Listo para instalar en carrocería nueva.", compatibility: ["Buses 10-12m carrocería nueva"] },

  // ── Línea neumática (10) ─────────────────────────────────────────────
  { name: "Válvula freno servicio tipo 30", brand: "Wabco", category: "Línea neumática", ...price(267000), sku: "NEU-001", description: "Válvula de freno de servicio tipo 30 para sistema neumático. Homologada E-Mark, certificada INMETRO.", compatibility: ["Universal buses y camiones"] },
  { name: "Cámara freno tipo 30 con resorte", brand: "Knorr-Bremse", category: "Línea neumática", ...price(312000), sku: "NEU-002", description: "Cámara de freno combinada tipo 30/30. Actuador de servicio y estacionamiento en una sola unidad.", compatibility: ["Ejes traseros buses diésel"] },
  { name: "Compresor aire 24V 150L/min", brand: "Viair", category: "Línea neumática", ...price(567000), sku: "NEU-003", description: "Compresor neumático eléctrico 24V para mantenimiento de presión auxiliar. 150L/min, ciclo 100%.", compatibility: ["Universal 24V"] },
  { name: "Válvula protectora 4 circuitos", brand: "Wabco", category: "Línea neumática", ...price(198000), sku: "NEU-004", description: "Válvula de protección de cuatro circuitos para sistemas de aire de buses con ABS.", compatibility: ["Buses con sistema de frenos ABS"] },
  { name: "Manguera espiral neumática 12mm 5m", brand: "Parker", category: "Línea neumática", ...price(89000), sku: "NEU-005", description: "Manguera espiral de nylon para líneas neumáticas. 12mm de diámetro, 5 metros, presión máx 12bar.", compatibility: ["Universal"] },
  { name: "Válvula dosificadora freno mano", brand: "Knorr-Bremse", category: "Línea neumática", ...price(234000), sku: "NEU-006", description: "Válvula de freno de mano dosificadora. Control proporcional de presión en eje trasero.", compatibility: ["Buses con freno de parqueo manual"] },
  { name: "Secador aire con válvula regeneración", brand: "Wabco", category: "Línea neumática", ...price(445000), sku: "NEU-007", description: "Secador de aire con válvula de regeneración automática. Elimina humedad del sistema neumático.", compatibility: ["Universal buses y camiones"] },
  { name: "Racor rápido neumático 12mm push-in", brand: "Festo", category: "Línea neumática", ...price(28000), sku: "NEU-008", description: "Racor de conexión rápida push-in para tuberías de 12mm. Acero inoxidable, máx 10bar.", compatibility: ["Universal tuberías 12mm"] },
  { name: "Filtro trampa humedad neumático 1/2\"", brand: "Parker", category: "Línea neumática", ...price(134000), sku: "NEU-009", description: "Filtro separador de agua con trampa automática. Conexión 1/2\", elemento filtrante de 40 micras.", compatibility: ["Universal 1/2\""] },
  { name: "Regulador presión con manómetro 0-10bar", brand: "SMC", category: "Línea neumática", ...price(167000), sku: "NEU-010", description: "Regulador de presión con manómetro glicerina integrado. Rango 0-10bar, conexión 1/2\".", compatibility: ["Universal"] },

  // ── Línea inyección y extrusión (10) ─────────────────────────────────
  { name: "Inyector diésel Cummins ISB 6.7", brand: "Bosch", category: "Línea inyección y extrusión", ...price(876000), sku: "INY-001", description: "Inyector piezo common rail para Cummins ISB 6.7. Reconstruido con tobera nueva, garantía 6 meses.", compatibility: ["Cummins ISB 6.7", "Cummins QSB 6.7"] },
  { name: "Bomba alta presión common rail 1800bar", brand: "Bosch", category: "Línea inyección y extrusión", ...price(1245000), sku: "INY-002", description: "Bomba de inyección CP3 common rail 1800bar. Remanufacturada a especificación OEM.", compatibility: ["Mercedes OM 906", "Mercedes OM 926 LA"] },
  { name: "Tobera inyector DLLA152P1089", brand: "Denso", category: "Línea inyección y extrusión", ...price(234000), sku: "INY-003", description: "Tobera de inyector para sistema common rail. Referencia DLLA152P1089. Acero de herramienta.", compatibility: ["Inyectores Bosch CRI 2.2"] },
  { name: "Filtro combustible doble etapa 10 micras", brand: "Fleetguard", category: "Línea inyección y extrusión", ...price(78000), sku: "INY-004", description: "Filtro de combustible doble etapa 10 micras para common rail. Incluye separador de agua.", compatibility: ["Sistemas common rail 1400-2000bar"] },
  { name: "Kit juntas inyectores Cummins ISC", brand: "Unipars", category: "Línea inyección y extrusión", ...price(67000), sku: "INY-005", description: "Kit de juntas tóricas y arandelas de cobre para 6 inyectores Cummins ISC. Material Viton resistente.", compatibility: ["Cummins ISC 8.3", "Cummins QSC 8.3"] },
  { name: "Riel combustible common rail CR presión", brand: "Bosch", category: "Línea inyección y extrusión", ...price(534000), sku: "INY-006", description: "Riel de alta presión para sistema common rail. Capacidad 135cc, presión nominal 1600bar.", compatibility: ["Scania DC9", "Scania DC11"] },
  { name: "Sensor presión combustible 0-1800bar", brand: "Bosch", category: "Línea inyección y extrusión", ...price(189000), sku: "INY-007", description: "Sensor electrónico de presión de combustible 0-1800bar para sistema CRS. Conector Bosch 3 pines.", compatibility: ["Universal common rail Bosch"] },
  { name: "Válvula control presión high pressure", brand: "Bosch", category: "Línea inyección y extrusión", ...price(312000), sku: "INY-008", description: "Válvula de control de presión para bomba CP3. Regulación electrónica 200-1800bar.", compatibility: ["Bombas Bosch CP3 y CP4"] },
  { name: "Manguera alta presión inyector 12cm", brand: "Parker", category: "Línea inyección y extrusión", ...price(89000), sku: "INY-009", description: "Manguera de alta presión inyector-riel 12cm. Presión de trabajo 2000bar, punta cónica 60°.", compatibility: ["Sistemas common rail"] },
  { name: "Calibrador caudal inyectores set 6 piezas", brand: "Unipars", category: "Línea inyección y extrusión", ...price(445000), sku: "INY-010", description: "Set de 6 calibradores de caudal para banco de prueba de inyectores. Rango 2-120cc/30seg.", compatibility: ["Banco de prueba universal"] },

  // ── Línea mecanizado (10) ────────────────────────────────────────────
  { name: "Buje bronce dirección 50x60x40mm", brand: "Unipars", category: "Línea mecanizado", ...price(134000), sku: "MEC-001", description: "Buje de bronce al plomo para dirección de buses pesados. Dimensiones 50x60x40mm. Tolerancia H7.", compatibility: ["Ejes King Pin 50mm"] },
  { name: "Pivote dirección King Pin 35mm acero", brand: "Mecanizados Bogotá", category: "Línea mecanizado", ...price(198000), sku: "MEC-002", description: "Pivote king pin mecanizado en acero aleado 4140. Diámetro 35mm, longitud 250mm. Temple y rectificado.", compatibility: ["Ejes delanteros universales 35mm"] },
  { name: "Eje árbol cardan mecanizado 1350", brand: "Spicer", category: "Línea mecanizado", ...price(876000), sku: "MEC-003", description: "Árbol de transmisión tipo 1350 remanufacturado. Equilibrado dinámico, crucetas nuevas.", compatibility: ["Transmisiones Allison", "Transmisiones ZF"] },
  { name: "Cruceta cardan 1350 con grasa", brand: "Spicer", category: "Línea mecanizado", ...price(178000), sku: "MEC-004", description: "Cruceta para árbol de transmisión serie 1350. Acero forjado, tapas selladas con grasa de por vida.", compatibility: ["Árboles serie 1350"] },
  { name: "Eje rueda trasero rectificado 45mm", brand: "Mecanizados Bogotá", category: "Línea mecanizado", ...price(345000), sku: "MEC-005", description: "Eje de rueda trasero rectificado y endurecido. Diámetro 45mm, longitud según aplicación.", compatibility: ["Ejes Meritor", "Ejes Rockwell"] },
  { name: "Cojinete de empuje axial 51210", brand: "SKF", category: "Línea mecanizado", ...price(89000), sku: "MEC-006", description: "Cojinete de empuje axial SKF 51210. Capacidad estática 150kN, anillo doble.", compatibility: ["Universal 50mm bore"] },
  { name: "Rodamiento cónico 30208 cubo rueda", brand: "FAG", category: "Línea mecanizado", ...price(134000), sku: "MEC-007", description: "Rodamiento cónico de rodillos 30208 para cubo de rueda. d=40mm, D=80mm, T=19.75mm.", compatibility: ["Cubos rueda ejes delanteros"] },
  { name: "Bocín goma barra estabilizadora 22mm", brand: "Lemförder", category: "Línea mecanizado", ...price(48000), sku: "MEC-008", description: "Buje de goma para barra estabilizadora 22mm de diámetro. Dureza 65 Shore A.", compatibility: ["Barras estabilizadoras 22mm"] },
  { name: "Rótula dirección externa M16 cónica", brand: "TRW", category: "Línea mecanizado", ...price(167000), sku: "MEC-009", description: "Rótula externa de dirección con espárrago cónico M16. Articulación 35°, sellada con fuelle.", compatibility: ["Brazos de dirección universales"] },
  { name: "Grasera cónica 1/4\" BSP kit x10", brand: "Unipars", category: "Línea mecanizado", ...price(28000), sku: "MEC-010", description: "Kit de 10 niples engrasadores cónicos tipo DIN 71412 1/4\" BSP. Acero zincado.", compatibility: ["Universal"] },

  // ── Línea cauchos (10) ───────────────────────────────────────────────
  { name: "Kit cauchos suspensión delantera completo", brand: "Fenner", category: "Línea cauchos", ...price(287000), sku: "CAU-001", description: "Kit completo de cauchos y silentblocks para suspensión delantera. Incluye 8 piezas por eje.", compatibility: ["Mercedes OF-1218", "Volkswagen 15.190"] },
  { name: "Silentblock soporte motor goma-metal 80mm", brand: "Corteco", category: "Línea cauchos", ...price(134000), sku: "CAU-002", description: "Silentblock soporte motor goma-metal. Diámetro exterior 80mm, eje M12. Frecuencia natural 8Hz.", compatibility: ["Motores Cummins ISB", "Motores Mercedes OM 906"] },
  { name: "Goma junta homocinética exterior CV", brand: "Ruville", category: "Línea cauchos", ...price(98000), sku: "CAU-003", description: "Fuelle de goma para junta homocinética CV exterior. Material EPDM resistente a alta temperatura.", compatibility: ["Juntas CV universales"] },
  { name: "Kit 4 silentblocks barra estabilizadora", brand: "Lemförder", category: "Línea cauchos", ...price(167000), sku: "CAU-004", description: "Kit de 4 silentblocks para barra estabilizadora. Caucho natural reforzado con inserto metálico.", compatibility: ["Barras 22-25mm universales"] },
  { name: "Perfil caucho junta puertas autobús 10m", brand: "UniSeal", category: "Línea cauchos", ...price(234000), sku: "CAU-005", description: "Perfil de goma EPDM para sellado de puertas de buses. Sección 20x15mm, rollo de 10 metros.", compatibility: ["Puertas neumáticas universales"] },
  { name: "Tope caucho suspensión bump-stop 80mm", brand: "Monroe", category: "Línea cauchos", ...price(56000), sku: "CAU-006", description: "Tope de goma microceldas para suspensión neumática y mecánica. Altura 80mm, diámetro 65mm.", compatibility: ["Universal amortiguadores"] },
  { name: "Manguito caucho inter-eje cardán 2\"", brand: "Unipars", category: "Línea cauchos", ...price(112000), sku: "CAU-007", description: "Manguito de caucho para acoplamiento suave entre segmentos de árbol. Diámetro 2\", 6 nervios.", compatibility: ["Conexiones árbol cardan 2\""] },
  { name: "Perfil caucho escalón bus antideslizante 1m", brand: "SafeStep", category: "Línea cauchos", ...price(45000), sku: "CAU-008", description: "Perfil antideslizante para escalones de bus. Material EPDM con estrías, longitud 1 metro.", compatibility: ["Escalones buses urbanos y turismo"] },
  { name: "Diafragma caucho cámara freno tipo 24", brand: "Fremax", category: "Línea cauchos", ...price(78000), sku: "CAU-009", description: "Diafragma de goma para cámara de freno neumático tipo 24. Material SBR resistente al calor.", compatibility: ["Cámaras freno tipo 24"] },
  { name: "Soporte caucho tanque combustible par", brand: "Unipars", category: "Línea cauchos", ...price(89000), sku: "CAU-010", description: "Par de soportes de caucho-metal para tanque de combustible. Amortiguación eje vertical 12Hz.", compatibility: ["Tanques hasta 200L"] },

  // ── Adhesivos, lubricantes y sellantes (10) ──────────────────────────
  { name: "Silicona RTV negra motor alta temperatura", brand: "Permatex", category: "Adhesivos, lubricantes y sellantes", ...price(67000), sku: "ADH-001", description: "Silicona RTV negra para juntas de motor. Resistente hasta 340°C, sellado de cárter y tapas.", compatibility: ["Universal"] },
  { name: "Adhesivo estructural EP bicomponente 50ml", brand: "3M", category: "Adhesivos, lubricantes y sellantes", ...price(134000), sku: "ADH-002", description: "Adhesivo epóxico bicomponente de alta resistencia. Resistencia a cizalla 25MPa. Tiempo trabajo 5min.", compatibility: ["Metal, plástico, fibra de vidrio"] },
  { name: "Grasa poliurea rodamientos NLGI-2 400g", brand: "Mobil", category: "Adhesivos, lubricantes y sellantes", ...price(89000), sku: "ADH-003", description: "Grasa de poliurea para rodamientos de alta velocidad. NLGI-2, rango -30°C a 180°C, 400g.", compatibility: ["Rodamientos universales"] },
  { name: "Aceite motor 15W40 diésel pesado 20L", brand: "Shell Rimula", category: "Adhesivos, lubricantes y sellantes", ...price(312000), sku: "ADH-004", description: "Aceite mineral 15W40 CH-4 para motores diésel de buses y camiones. Protección desgaste superior.", compatibility: ["Cummins ISB", "Mercedes OM 926", "Scania DC"] },
  { name: "Sellante anaeróbico fijador tornillos Loctite 243", brand: "Loctite", category: "Adhesivos, lubricantes y sellantes", ...price(78000), sku: "ADH-005", description: "Fijador de tornillos desmontable azul. Resistencia ruptura 2000psi. Temperatura máx 150°C.", compatibility: ["Tornillos M6-M20"] },
  { name: "Limpiador frenos y partes aerosol 500ml", brand: "WD-40", category: "Adhesivos, lubricantes y sellantes", ...price(45000), sku: "ADH-006", description: "Limpiador de frenos y piezas mecánicas en aerosol. Elimina grasa, aceite y polvo de freno.", compatibility: ["Universal"] },
  { name: "Pasta cobre alta temperatura bulón freno", brand: "Liqui Moly", category: "Adhesivos, lubricantes y sellantes", ...price(67000), sku: "ADH-007", description: "Pasta de cobre para bulones y guías de frenos. Resistente hasta 1100°C. Antichirrido.", compatibility: ["Sistemas de freno universales"] },
  { name: "Aceite transmisión automática Dextron VI 20L", brand: "Castrol", category: "Adhesivos, lubricantes y sellantes", ...price(498000), sku: "ADH-008", description: "Aceite ATF Dexron VI para transmisiones automáticas Allison y ZF de buses.", compatibility: ["Allison 1000/2000/3000", "ZF 6HP"] },
  { name: "Sellante poliuretano parabrisas negro 310ml", brand: "Sika", category: "Adhesivos, lubricantes y sellantes", ...price(89000), sku: "ADH-009", description: "Sellante monocomponente PU para instalación de parabrisas. Cartridge 310ml, negro. UL certificado.", compatibility: ["Instalación parabrisas universal"] },
  { name: "Anticorrosivo penetrante lubricante 400ml", brand: "WD-40", category: "Adhesivos, lubricantes y sellantes", ...price(38000), sku: "ADH-010", description: "Spray anticorrosivo y penetrante multiusos 400ml. Desplaza humedad, lubrica y protege metal.", compatibility: ["Universal"] },

  // ── Línea eléctrica (10) ─────────────────────────────────────────────
  { name: "Alternador 24V 80A buses diésel", brand: "Bosch", category: "Línea eléctrica", ...price(678000), sku: "ELE-001", description: "Alternador remanufacturado 24V 80A para buses diésel. Tensión regulada 28.5V, IP54.", compatibility: ["Cummins ISB", "Mercedes OM 906 LA"] },
  { name: "Motor arranque 24V 5.5kW reducción", brand: "Bosch", category: "Línea eléctrica", ...price(543000), sku: "ELE-002", description: "Motor de arranque con reductor 24V 5.5kW. Dientes piñón 10. Remanufacturado a especificación OEM.", compatibility: ["Motores diésel 6 cilindros 24V"] },
  { name: "Batería 12V 200Ah AGM para buses", brand: "Optima", category: "Línea eléctrica", ...price(789000), sku: "ELE-003", description: "Batería AGM 12V 200Ah de ciclo profundo. CCA 1200A, sin mantenimiento. Para bancos 24V en bus.", compatibility: ["Sistemas 24V con 2 baterías en serie"] },
  { name: "Cable batería flexible 70mm² 2m", brand: "Unipars", category: "Línea eléctrica", ...price(89000), sku: "ELE-004", description: "Cable flexible 70mm² para conexión principal de batería. Cobre estañado, cubierta XLPE 90°C.", compatibility: ["Universal 24V sistemas eléctricos"] },
  { name: "Relay electromagnético 24V 100A sellado", brand: "Tyco", category: "Línea eléctrica", ...price(134000), sku: "ELE-005", description: "Relay de potencia para corte de batería y ATS. 24V bobina, 100A contactos, IP67 sellado.", compatibility: ["Universal 24V"] },
  { name: "Central fusibles auto 12 posiciones 24V", brand: "Hella", category: "Línea eléctrica", ...price(167000), sku: "ELE-006", description: "Caja porta-fusibles de 12 posiciones con cubierta. Para fusibles tipo ATO, con borna tierra.", compatibility: ["Universal 24V"] },
  { name: "Sensor temperatura motor NTC 2kOhm", brand: "Bosch", category: "Línea eléctrica", ...price(67000), sku: "ELE-007", description: "Sensor temperatura refrigerante NTC 2kΩ a 25°C. Rosca M12, conector Bosch 2 pines.", compatibility: ["ECUs Bosch y Cummins"] },
  { name: "Módulo CAN-Bus diagnóstico OBD2 24V", brand: "Autel", category: "Línea eléctrica", ...price(345000), sku: "ELE-008", description: "Módulo de diagnóstico OBD2/J1939 para buses. Lee y borra DTC, visualiza parámetros en tiempo real.", compatibility: ["Vehículos 24V J1939 CAN-Bus"] },
  { name: "Conectores deutsch DT 2 y 4 pines kit", brand: "Deutsch", category: "Línea eléctrica", ...price(89000), sku: "ELE-009", description: "Kit de conectores Deutsch DT Series: 10x DT04-2P y 10x DT04-4P. IP67, para cableado exterior.", compatibility: ["Universal"] },
  { name: "Interruptor llave corte batería 24V 300A", brand: "Hella", category: "Línea eléctrica", ...price(198000), sku: "ELE-010", description: "Llave de corte de batería 300A 24V. Instalación en panel, posición 0-1, resistente a vibraciones.", compatibility: ["Universal buses y camiones"] },
];

async function main() {
  console.log(`\n⚙  Insertando ${products.length} productos en la BD...\n`);

  let created = 0;
  let skipped = 0;

  for (const p of products) {
    const productSlug = slug(p.name, p.sku.toLowerCase());
    try {
      await prisma.product.upsert({
        where: { slug: productSlug },
        update: {},
        create: {
          slug: productSlug,
          sku: p.sku,
          category: p.category,
          name: p.name,
          brand: p.brand,
          price: p.price,
          previousPrice: p.previousPrice,
          stock: Math.floor(Math.random() * 40) + 5,
          minimumStock: 3,
          image: PLACEHOLDER,
          availability: "Entrega inmediata",
          description: p.description,
          compatibility: p.compatibility ?? [],
          warranty: "6 meses",
          featured: Math.random() < 0.15,
          active: true,
        },
      });
      created++;
      process.stdout.write(`  ✓ [${p.sku}] ${p.name}\n`);
    } catch {
      skipped++;
      process.stdout.write(`  ⚠ [${p.sku}] ya existe — saltado\n`);
    }
  }

  const total = await prisma.product.count();
  console.log(`\n✅ Listo — ${created} creados, ${skipped} saltados`);
  console.log(`📦 Total productos en BD: ${total}\n`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
