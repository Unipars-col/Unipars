import OpenAI from "openai";
import { slugCategoria } from "@/app/data/catalog";
import { getProducts, type StoreProduct } from "@/lib/products";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024;
const MAX_CANDIDATES = 30;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

type ImageSearchResult = {
  slug: string;
  categoria: string;
  confianza: number;
  razon: string;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function responseForMatch(
  product: StoreProduct,
  options: {
    confianza: number;
    razon: string;
    comparedCount: number;
    mode: "openai" | "local";
  },
) {
  return Response.json({
    product,
    categoria: product.categoria,
    categoriaUrl: `/categorias?categoria=${slugCategoria(product.categoria)}`,
    confianza: options.confianza,
    razon: options.razon,
    comparedCount: options.comparedCount,
    mode: options.mode,
  });
}

function getLocalFallbackMatch(file: File, candidates: StoreProduct[]) {
  const fileTokens = normalize(file.name)
    .split(/[^a-z0-9]+/g)
    .filter((token) => token.length >= 3 && !["png", "jpg", "jpeg", "webp"].includes(token));

  const scored = candidates
    .map((product) => {
      const haystack = normalize(
        [
          product.slug,
          product.nombre,
          product.marca,
          product.categoria,
          product.descripcion,
          product.aplicacion,
        ].join(" "),
      );
      const score = fileTokens.reduce(
        (total, token) => total + (haystack.includes(token) ? 1 : 0),
        0,
      );

      return { product, score };
    })
    .sort((a, b) => b.score - a.score);

  if (scored[0]?.score > 0) {
    return {
      product: scored[0].product,
      confianza: Math.min(76, 48 + scored[0].score * 12),
      razon:
        "Modo local: se eligió el producto por coincidencias entre el nombre del archivo y el catálogo.",
    };
  }

  const demoProduct =
    candidates.find((product) => /broca/i.test(product.nombre)) ??
    candidates.find((product) => product.destacado) ??
    candidates[0];

  return {
    product: demoProduct,
    confianza: 42,
    razon:
      "Modo demo local: falta la llave de OpenAI para comparar visualmente, pero el flujo ya devuelve una sugerencia del catálogo.",
  };
}

function productSummary(product: StoreProduct, index: number) {
  return [
    `Candidato ${index + 1}`,
    `slug: ${product.slug}`,
    `nombre: ${product.nombre}`,
    `categoria: ${product.categoria}`,
    `marca: ${product.marca}`,
    `descripcion: ${product.descripcion || "Sin descripcion"}`,
    `aplicacion: ${product.aplicacion || "Sin aplicacion"}`,
  ].join("\n");
}

function safeParseResult(value: string): ImageSearchResult | null {
  try {
    const parsed = JSON.parse(value) as Partial<ImageSearchResult>;

    if (
      typeof parsed.slug !== "string" ||
      typeof parsed.categoria !== "string" ||
      typeof parsed.confianza !== "number" ||
      typeof parsed.razon !== "string"
    ) {
      return null;
    }

    return {
      slug: parsed.slug,
      categoria: parsed.categoria,
      confianza: Math.max(0, Math.min(100, Math.round(parsed.confianza))),
      razon: parsed.razon.trim(),
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (
      !contentType.includes("multipart/form-data") &&
      !contentType.includes("application/x-www-form-urlencoded")
    ) {
      return Response.json({ error: "Debes enviar una imagen." }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "Debes seleccionar una imagen." }, { status: 400 });
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return Response.json(
        { error: "La imagen debe estar en formato JPG, PNG o WEBP." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return Response.json(
        { error: "La imagen supera el límite de 3 MB." },
        { status: 400 },
      );
    }

    const products = await getProducts();
    const candidates = products
      .filter((product) => product.imagen)
      .slice(0, MAX_CANDIDATES);

    if (candidates.length === 0) {
      return Response.json(
        { error: "No hay productos con imagen para comparar." },
        { status: 400 },
      );
    }

    if (!openai) {
      const fallback = getLocalFallbackMatch(file, candidates);

      return responseForMatch(fallback.product, {
        confianza: fallback.confianza,
        razon: fallback.razon,
        comparedCount: candidates.length,
        mode: "local",
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const imageDataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;

    const content = [
      {
        type: "input_text" as const,
        text: [
          "Compara la foto del cliente contra las fotos de productos candidatos.",
          "Devuelve el producto del catalogo que visualmente se parezca mas.",
          "Si varios se parecen, prioriza forma, material, uso y categoria.",
          "Usa exactamente un slug de la lista de candidatos.",
          "Foto del cliente:",
        ].join("\n"),
      },
      {
        type: "input_image" as const,
        image_url: imageDataUrl,
        detail: "high" as const,
      },
      ...candidates.flatMap((product, index) => [
        {
          type: "input_text" as const,
          text: productSummary(product, index),
        },
        {
          type: "input_image" as const,
          image_url: product.imagen,
          detail: "low" as const,
        },
      ]),
    ];

    const response = await openai.responses.create({
      model: process.env.OPENAI_IMAGE_SEARCH_MODEL || process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
      instructions: [
        "Eres un asistente visual de catalogo de repuestos para Totalpars.",
        "No inventes productos ni slugs.",
        "Responde solo con JSON valido segun el esquema.",
        "La confianza debe ser un numero de 0 a 100.",
        "La razon debe ser breve y en espanol.",
      ].join("\n"),
      input: [
        {
          role: "user",
          content,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "image_search_match",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              slug: { type: "string" },
              categoria: { type: "string" },
              confianza: { type: "number" },
              razon: { type: "string" },
            },
            required: ["slug", "categoria", "confianza", "razon"],
          },
        },
      },
    });

    const parsed = safeParseResult(response.output_text || "");
    const matchedProduct =
      candidates.find((product) => product.slug === parsed?.slug) ?? candidates[0];

    return responseForMatch(matchedProduct, {
      confianza: parsed?.confianza ?? 0,
      razon:
        parsed?.razon ||
        "Encontramos el producto visualmente mas cercano dentro del catalogo disponible.",
      comparedCount: candidates.length,
      mode: "openai",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No fue posible analizar la imagen en este momento.";

    return Response.json({ error: message }, { status: 500 });
  }
}
