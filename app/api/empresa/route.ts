import { createEmpresaSolicitud } from "@/lib/empresas";
import { getSessionFromCookies } from "@/lib/auth";
import { createSupabaseStorageClient } from "@/lib/supabase-storage";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

async function uploadDoc(
  supabase: ReturnType<typeof createSupabaseStorageClient>,
  file: File,
  folder: string,
): Promise<string | undefined> {
  if (!supabase || !file || file.size === 0) return undefined;

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `empresa-docs/${folder}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(process.env.SUPABASE_STORAGE_BUCKET ?? "product-images")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (error) throw new Error(`Error subiendo ${folder}: ${error.message}`);

  const { data } = supabase.storage
    .from(process.env.SUPABASE_STORAGE_BUCKET ?? "product-images")
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (!contentType.includes("multipart/form-data")) {
      return Response.json({ error: "Se esperaba multipart/form-data." }, { status: 400 });
    }

    const formData = await request.formData();

    // Validate required fields
    const required = [
      "nombreEmpresa", "razonSocial", "nit", "tipoEmpresa", "pais", "ciudad",
      "direccion", "telefonoEmpresa", "correoEmpresa",
      "repNombre", "repTipoDoc", "repNumDoc", "repCargo", "repCelular", "repCorreo",
      "descripcion", "anosEnMercado", "cantidadProductos", "tiempoDespacho",
      "coberturaEnvios", "banco", "tipoCuenta", "numeroCuenta", "titularCuenta",
      "correoFacturacion",
    ];

    for (const field of required) {
      if (!formData.get(field)?.toString().trim()) {
        return Response.json(
          { error: `El campo "${field}" es obligatorio.` },
          { status: 400 },
        );
      }
    }

    // Upload documents to Supabase Storage
    const supabase = createSupabaseStorageClient();
    const fileFields: Array<[string, string]> = [
      ["rut", "urlRut"],
      ["camaraComercio", "urlCamaraComercio"],
      ["docRepLegal", "urlDocRepLegal"],
      ["certBancaria", "urlCertBancaria"],
      ["logo", "urlLogo"],
      ["catalogo", "urlCatalogo"],
    ];

    const uploadedUrls: Record<string, string | undefined> = {};

    for (const [fieldName, urlKey] of fileFields) {
      const file = formData.get(fieldName);
      if (file instanceof File && file.size > 0) {
        if (file.size > MAX_FILE_SIZE) {
          return Response.json(
            { error: `El archivo ${fieldName} supera el límite de 10 MB.` },
            { status: 400 },
          );
        }
        uploadedUrls[urlKey] = await uploadDoc(supabase, file, fieldName);
      }
    }

    // Get session if logged in
    let userId: string | undefined;
    try {
      const session = await getSessionFromCookies();
      if (session) userId = session.userId;
    } catch {
      // Not logged in, that's OK
    }

    // Parse categorias array
    const categoriasRaw = formData.get("categorias")?.toString() ?? "";
    const categorias = categoriasRaw
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    await createEmpresaSolicitud({
      nombreEmpresa: formData.get("nombreEmpresa") as string,
      razonSocial: formData.get("razonSocial") as string,
      nit: formData.get("nit") as string,
      tipoEmpresa: formData.get("tipoEmpresa") as string,
      pais: formData.get("pais") as string,
      ciudad: formData.get("ciudad") as string,
      direccion: formData.get("direccion") as string,
      telefonoEmpresa: formData.get("telefonoEmpresa") as string,
      correoEmpresa: formData.get("correoEmpresa") as string,
      paginaWeb: formData.get("paginaWeb")?.toString() || undefined,
      repNombre: formData.get("repNombre") as string,
      repTipoDoc: formData.get("repTipoDoc") as string,
      repNumDoc: formData.get("repNumDoc") as string,
      repCargo: formData.get("repCargo") as string,
      repCelular: formData.get("repCelular") as string,
      repCorreo: formData.get("repCorreo") as string,
      categorias,
      subcategorias: formData.get("subcategorias")?.toString() || undefined,
      descripcion: formData.get("descripcion") as string,
      anosEnMercado: formData.get("anosEnMercado") as string,
      vendeOnline: formData.get("vendeOnline") === "true",
      linkTienda: formData.get("linkTienda")?.toString() || undefined,
      operaEn: formData.get("operaEn")?.toString() || undefined,
      cantidadProductos: formData.get("cantidadProductos") as string,
      inventarioPropio: formData.get("inventarioPropio") === "true",
      preciosMayoristas: formData.get("preciosMayoristas") === "true",
      ofreceGarantia: formData.get("ofreceGarantia") === "true",
      tiempoDespacho: formData.get("tiempoDespacho") as string,
      coberturaEnvios: formData.get("coberturaEnvios") as string,
      banco: formData.get("banco") as string,
      tipoCuenta: formData.get("tipoCuenta") as string,
      numeroCuenta: formData.get("numeroCuenta") as string,
      titularCuenta: formData.get("titularCuenta") as string,
      emiteFactura: formData.get("emiteFactura") === "true",
      correoFacturacion: formData.get("correoFacturacion") as string,
      userId,
      ...uploadedUrls,
    });

    return Response.json(
      { message: "Solicitud enviada correctamente." },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED"
        ? "La base de datos no está configurada todavía."
        : error instanceof Error
          ? error.message
          : "No fue posible enviar la solicitud.";

    return Response.json({ error: message }, { status: 500 });
  }
}
