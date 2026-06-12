require("dotenv").config({ path: ".env.local" });
const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  await pool.query(`DELETE FROM "EmpresaSolicitud" WHERE "nombreEmpresa" = 'Repuestos Norte S.A.S'`);
  console.log("Solicitudes anteriores borradas");

  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 14);
  const newId = "c" + ts + rand;
  console.log("ID generado:", newId);

  const result = await pool.query(
    `INSERT INTO "EmpresaSolicitud" (
      id, "nombreEmpresa", "razonSocial", nit, "tipoEmpresa", pais, ciudad, direccion,
      "telefonoEmpresa", "correoEmpresa", "repNombre", "repTipoDoc", "repNumDoc",
      "repCargo", "repCelular", "repCorreo", categorias, descripcion,
      "anosEnMercado", "vendeOnline", "cantidadProductos", "inventarioPropio",
      "preciosMayoristas", "ofreceGarantia", "tiempoDespacho", "coberturaEnvios",
      banco, "tipoCuenta", "numeroCuenta", "titularCuenta", "emiteFactura",
      "correoFacturacion", estado, "createdAt", "updatedAt"
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
      $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
      $31, $32, $33, NOW(), NOW()
    ) RETURNING id, "nombreEmpresa"`,
    [
      newId,
      "Repuestos Norte S.A.S",
      "Repuestos Norte S.A.S",
      "900123456-7",
      "SA",
      "Colombia",
      "Medellín",
      "Calle 50 #43-90",
      "6042345678",
      "contacto@repuestosnorte.co",
      "Carlos Hernández",
      "CC",
      "1045678901",
      "Gerente General",
      "3001234567",
      "carlos@repuestosnorte.co",
      ["Frenos y suspensión", "Motor y transmisión", "Eléctrico"],
      "Empresa de repuestos para buses urbanos con 12 años de experiencia.",
      "12",
      false,
      "50-200",
      false,
      false,
      false,
      "2-3 días hábiles",
      "Todo Colombia",
      "Bancolombia",
      "Ahorros",
      "123-456789-00",
      "Repuestos Norte S.A.S",
      false,
      "contacto@repuestosnorte.co",
      "PENDIENTE",
    ]
  );

  console.log("Solicitud creada:", result.rows[0]);
  await pool.end();
}

run().catch((e) => { console.error(e.message); process.exit(1); });
