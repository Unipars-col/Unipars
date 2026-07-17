import OpenAI from "openai";
import sharp from "sharp";
import { slugCategoria } from "@/app/data/catalog";
import { getProducts, type StoreProduct } from "@/lib/products";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024;
const MAX_VISUAL_CANDIDATES = 12;
const MAX_PERCEPTUAL_CANDIDATES = 60;
const MAX_RESULTS = 3;
const ALLOWED_FILE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

let openAIClient: OpenAI | null = null;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;
  openAIClient ??= new OpenAI({ apiKey });
  return openAIClient;
}

type ImageAnalysis = {
  esRepuestoCatalogable: boolean;
  confianzaEsRepuesto: number;
  motivoNoRepuesto: string;
  tipo: string;
  categoriaProbable: string;
  categoriaSegura: boolean;
  funcionProbable: string;
  componentesVisibles: string[];
  esEscenaContextual: boolean;
  descripcionVisual: string;
  formas: string[];
  materiales: string[];
  colores: string[];
  rasgosDistintivos: string[];
  textoVisible: string[];
  palabrasClave: string[];
  cantidadPiezas: number;
};

type VisualMatch = {
  slug: string;
  confianza: number;
  razon: string;
};

type ColorFamily = "warm" | "red" | "clear";

type ImageFingerprint = {
  pixels: Buffer;
  channels: number;
};

const productFingerprintCache = new Map<string, Promise<ImageFingerprint | null>>();

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function tokenize(value: string) {
  return normalize(value)
    .split(/[^a-z0-9]+/g)
    .filter((token) => token.length >= 3);
}

function visibleColorFamilies(analysis: ImageAnalysis): ColorFamily[] {
  const text = normalize(
    [
      analysis.funcionProbable,
      analysis.descripcionVisual,
      ...analysis.formas,
      ...analysis.colores,
      ...analysis.rasgosDistintivos,
      ...analysis.textoVisible,
      ...analysis.palabrasClave,
    ].join(" "),
  );
  const families: ColorFamily[] = [];
  if (/amarill|ambar|naranj/.test(text)) families.push("warm");
  if (/rojo|roja/.test(text)) families.push("red");
  if (/blanc|cristal|transparent/.test(text)) families.push("clear");
  return families;
}

function productMatchesColorFamily(product: StoreProduct, family: ColorFamily) {
  const text = normalize(productText(product));
  if (family === "warm") return /amarill|ambar|naranj/.test(text);
  if (family === "red") return /rojo|roja/.test(text);
  return /blanc|cristal|transparent/.test(text);
}

function colorFamilyReason(family: ColorFamily) {
  if (family === "warm") {
    return "Coincide con la forma redonda y el lente ámbar visible en la fotografía.";
  }
  if (family === "red") {
    return "Coincide con la forma redonda y el lente rojo visible en la fotografía.";
  }
  return "Coincide con la forma redonda y el lente blanco o cristal visible en la fotografía.";
}

function parseJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function productText(product: StoreProduct) {
  return [
    product.nombre,
    product.categoria,
    product.marca,
    product.descripcion,
    product.sku,
    product.oemReferencia,
    ...(product.compatibilidad || []),
    ...(product.referenciasAlternas || []),
    ...(product.especificacionesTecnicas || []).flatMap((item) => [
      item.etiqueta,
      item.valor,
    ]),
  ]
    .filter(Boolean)
    .join(" ");
}

function productMatchesCategory(product: StoreProduct, category: string) {
  const productCategory = normalize(product.categoria);
  const probableCategory = normalize(category);
  const probableTokens = tokenize(probableCategory).filter(
    (token) => !["linea", "sistema", "sistemas", "repuesto", "repuestos"].includes(token),
  );

  return (
    productCategory.includes(probableCategory) ||
    probableCategory.includes(productCategory) ||
    probableTokens.filter((token) => productCategory.includes(token)).length >= 1
  );
}

function shortlistProducts(products: StoreProduct[], analysis: ImageAnalysis) {
  const queryTokens = tokenize(
    [
      analysis.tipo,
      analysis.categoriaProbable,
      analysis.funcionProbable,
      ...analysis.componentesVisibles,
      analysis.descripcionVisual,
      ...analysis.formas,
      ...analysis.materiales,
      ...analysis.colores,
      ...analysis.rasgosDistintivos,
      ...analysis.textoVisible,
      ...analysis.palabrasClave,
    ].join(" "),
  );
  const probableCategory = normalize(analysis.categoriaProbable);

  const ranked = products
    .filter((product) => Boolean(product.imagen))
    .map((product) => {
      const haystack = normalize(productText(product));
      const tokenScore = queryTokens.reduce(
        (score, token) => score + (haystack.includes(token) ? 2 : 0),
        0,
      );
      const categoryScore =
        probableCategory &&
        (normalize(product.categoria).includes(probableCategory) ||
          probableCategory.includes(normalize(product.categoria)))
          ? 18
          : 0;

      return { product, score: tokenScore + categoryScore };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_PERCEPTUAL_CANDIDATES)
    .map(({ product }) => product);

  return ranked;
}

function featureCandidates(products: StoreProduct[], analysis: ImageAnalysis) {
  const analysisText = normalize(
    [
      analysis.tipo,
      analysis.categoriaProbable,
      analysis.funcionProbable,
      ...analysis.componentesVisibles,
      analysis.descripcionVisual,
      ...analysis.formas,
      ...analysis.materiales,
      ...analysis.colores,
      ...analysis.rasgosDistintivos,
      ...analysis.textoVisible,
      ...analysis.palabrasClave,
    ].join(" "),
  );
  const asksForRoundShape = /redond|circular|circulo/.test(analysisText);
  const colorRoots = ["amarill", "ambar", "rojo", "blanc", "cristal", "naranj"].filter(
    (root) => analysisText.includes(root),
  );
  const typeTokens = tokenize(analysis.tipo);
  const componentTokens = analysis.componentesVisibles.flatMap(tokenize);
  const functionTokens = tokenize(analysis.funcionProbable);
  const visibleTextTokens = analysis.textoVisible.flatMap(tokenize);
  const shapeRoots = [
    "redond", "circular", "rectang", "cuadrad", "cilindr", "curv",
    "plano", "alargad", "irregular", "anillo", "perfil", "tubo",
    "disco", "helice", "aspas",
  ].filter((root) => analysisText.includes(root));
  const materialRoots = [
    "caucho", "goma", "metal", "acero", "alumin", "plast", "abs",
    "pvc", "nylon", "silicona", "cristal", "vidrio", "cobre",
  ].filter((root) => analysisText.includes(root));

  const ranked = products
    .filter((product) => Boolean(product.imagen))
    .map((product) => {
      const haystack = normalize(productText(product));
      const shapeScore =
        shapeRoots.reduce(
          (score, root) => score + (haystack.includes(root) ? 14 : 0),
          0,
        ) +
        (asksForRoundShape && /redond|redona|circular|circulo/.test(haystack)
          ? 20
          : 0);
      const colorScore = colorRoots.reduce(
        (score, root) => score + (haystack.includes(root) ? 12 : 0),
        0,
      );
      const materialScore = materialRoots.reduce(
        (score, root) => score + (haystack.includes(root) ? 12 : 0),
        0,
      );
      const typeScore = typeTokens.reduce(
        (score, token) => score + (haystack.includes(token) ? 8 : 0),
        0,
      );
      const functionScore = functionTokens.reduce(
        (score, token) => score + (haystack.includes(token) ? 5 : 0),
        0,
      );
      const visibleTextScore = visibleTextTokens.reduce(
        (score, token) => score + (haystack.includes(token) ? 30 : 0),
        0,
      );
      const componentScore = componentTokens.reduce(
        (score, token) => score + (haystack.includes(token) ? 18 : 0),
        0,
      );

      return {
        product,
        score:
          shapeScore + colorScore + materialScore + typeScore +
          functionScore + visibleTextScore + componentScore,
      };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ product }) => product);

  if (!asksForRoundShape || colorRoots.length < 2) return ranked;

  const diversified: StoreProduct[] = [];
  for (const colorRoot of colorRoots) {
    const colorMatches = ranked.filter((product) => {
      const haystack = normalize(productText(product));
      const matchesColor =
        haystack.includes(colorRoot) ||
        (colorRoot === "blanc" &&
          (haystack.includes("cristal") || haystack.includes("transparente")));
      return (
        /redond|redona|circular|circulo/.test(haystack) &&
        matchesColor
      );
    });
    diversified.push(...colorMatches.slice(0, 2));
  }

  return Array.from(
    new Map([...diversified, ...ranked].map((product) => [product.slug, product])).values(),
  );
}

async function createFingerprint(input: Buffer): Promise<ImageFingerprint> {
  const { data, info } = await sharp(input)
    .rotate()
    .flatten({ background: "#ffffff" })
    .trim({ background: "#ffffff", threshold: 12 })
    .resize(48, 48, {
      fit: "contain",
      background: "#ffffff",
      kernel: sharp.kernel.lanczos3,
    })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return { pixels: data, channels: info.channels };
}

async function fingerprintForProduct(product: StoreProduct, requestUrl: string) {
  const imageUrl = publicImageUrl(product.imagen, requestUrl);
  const cached = productFingerprintCache.get(imageUrl);
  if (cached) return cached;

  const promise = (async () => {
    try {
      const response = await fetch(imageUrl, {
        signal: AbortSignal.timeout(8_000),
        cache: "force-cache",
      });
      if (!response.ok) return null;
      return await createFingerprint(Buffer.from(await response.arrayBuffer()));
    } catch {
      return null;
    }
  })();

  productFingerprintCache.set(imageUrl, promise);
  return promise;
}

function fingerprintSimilarity(a: ImageFingerprint, b: ImageFingerprint) {
  if (a.channels !== b.channels || a.pixels.length !== b.pixels.length) return 0;

  let squaredError = 0;
  for (let index = 0; index < a.pixels.length; index += 1) {
    const difference = a.pixels[index] - b.pixels[index];
    squaredError += difference * difference;
  }

  const meanSquaredError = squaredError / a.pixels.length;
  return Math.max(0, 100 * (1 - meanSquaredError / (255 * 255)));
}

async function rankByPerceptualSimilarity(
  uploadedImage: Buffer,
  products: StoreProduct[],
  requestUrl: string,
) {
  const uploadedFingerprint = await createFingerprint(uploadedImage);
  const fingerprints = await Promise.all(
    products.map(async (product) => ({
      product,
      fingerprint: await fingerprintForProduct(product, requestUrl),
    })),
  );

  return fingerprints
    .filter(
      (item): item is { product: StoreProduct; fingerprint: ImageFingerprint } =>
        Boolean(item.fingerprint),
    )
    .map(({ product, fingerprint }) => ({
      product,
      similarity: fingerprintSimilarity(uploadedFingerprint, fingerprint),
    }))
    .sort((a, b) => b.similarity - a.similarity);
}

function resultForMatch(
  product: StoreProduct,
  confianza: number,
  razon: string,
) {
  return {
    product,
    categoria: product.categoria,
    categoriaUrl: `/categorias?categoria=${slugCategoria(product.categoria)}`,
    confianza: Math.max(0, Math.min(100, Math.round(confianza))),
    razon,
  };
}

function productSummary(product: StoreProduct, index: number) {
  return [
    `Candidato ${index + 1}`,
    `slug: ${product.slug}`,
    `nombre: ${product.nombre}`,
    `categoria: ${product.categoria}`,
    `marca: ${product.marca}`,
    `descripcion: ${product.descripcion || "Sin descripción"}`,
  ].join("\n");
}

function publicImageUrl(image: string, requestUrl: string) {
  if (/^https?:\/\//i.test(image)) return image;
  return new URL(image.startsWith("/") ? image : `/${image}`, requestUrl).toString();
}

export async function POST(request: Request) {
  try {
    if (!(request.headers.get("content-type") || "").includes("multipart/form-data")) {
      return Response.json({ error: "Debes enviar una imagen." }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return Response.json({ error: "Debes seleccionar una imagen." }, { status: 400 });
    }
    if (!ALLOWED_FILE_TYPES.has(file.type)) {
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

    const openai = getOpenAIClient();
    if (!openai) {
      return Response.json(
        {
          error:
            "La búsqueda visual aún no tiene configurada la clave OPENAI_API_KEY.",
          code: "IMAGE_SEARCH_NOT_CONFIGURED",
        },
        { status: 503 },
      );
    }

    const products = await getProducts();
    if (products.length === 0) {
      return Response.json({ error: "No hay productos disponibles para comparar." }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const imageDataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
    const model =
      process.env.OPENAI_IMAGE_SEARCH_MODEL ||
      process.env.OPENAI_CHAT_MODEL ||
      "gpt-4o-mini";

    const analysisResponse = await openai.responses.create({
      model,
      instructions:
        "Analiza la foto de un repuesto para transporte público o de carga. Describe solo lo visible y no inventes marcas ni referencias. Responde únicamente con el JSON solicitado, en español.",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Primero decide si la imagen contiene un repuesto, herramienta, consumible técnico o componente catalogable para buses, camiones o mantenimiento industrial. Muñecos, personas, animales, comida, paisajes, personajes, ropa y objetos domésticos deben marcarse esRepuestoCatalogable=false. Si sí es catalogable, identifica el componente comprable realmente visible, su función, categoría, cantidad, geometría, materiales, colores, conexiones, perforaciones, patrones, texto o referencias. Distingue la pieza del contexto donde está instalada. Marca categoriaSegura=true solo cuando la categoría sea visualmente clara.",
            },
            { type: "input_image", image_url: imageDataUrl, detail: "high" },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "part_image_analysis",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              esRepuestoCatalogable: { type: "boolean" },
              confianzaEsRepuesto: {
                type: "integer",
                minimum: 0,
                maximum: 100,
              },
              motivoNoRepuesto: { type: "string" },
              tipo: { type: "string" },
              categoriaProbable: { type: "string" },
              categoriaSegura: { type: "boolean" },
              funcionProbable: { type: "string" },
              componentesVisibles: { type: "array", items: { type: "string" } },
              esEscenaContextual: { type: "boolean" },
              descripcionVisual: { type: "string" },
              formas: { type: "array", items: { type: "string" } },
              materiales: { type: "array", items: { type: "string" } },
              colores: { type: "array", items: { type: "string" } },
              rasgosDistintivos: { type: "array", items: { type: "string" } },
              textoVisible: { type: "array", items: { type: "string" } },
              palabrasClave: { type: "array", items: { type: "string" } },
              cantidadPiezas: { type: "integer", minimum: 1, maximum: 10 },
            },
            required: [
              "esRepuestoCatalogable",
              "confianzaEsRepuesto",
              "motivoNoRepuesto",
              "tipo",
              "categoriaProbable",
              "categoriaSegura",
              "funcionProbable",
              "componentesVisibles",
              "esEscenaContextual",
              "descripcionVisual",
              "formas",
              "materiales",
              "colores",
              "rasgosDistintivos",
              "textoVisible",
              "palabrasClave",
              "cantidadPiezas",
            ],
          },
        },
      },
    });

    const analysis = parseJson<ImageAnalysis>(analysisResponse.output_text || "");
    if (!analysis) throw new Error("No fue posible interpretar la imagen.");

    if (!analysis.esRepuestoCatalogable || analysis.confianzaEsRepuesto < 45) {
      return Response.json(
        {
          error:
            analysis.motivoNoRepuesto.trim() ||
            "No identificamos un repuesto o componente del catálogo en esta imagen.",
          code: "NOT_A_CATALOG_PART",
        },
        { status: 422 },
      );
    }

    const categoryProducts = products.filter((product) =>
      productMatchesCategory(product, analysis.categoriaProbable),
    );
    const searchPool =
      analysis.categoriaSegura && categoryProducts.length >= 2
        ? categoryProducts
        : products;
    const semanticCandidates = shortlistProducts(searchPool, analysis);
    if (semanticCandidates.length === 0) {
      return Response.json(
        { error: "No encontramos productos con imágenes para comparar." },
        { status: 404 },
      );
    }

    const perceptualRanking = await rankByPerceptualSimilarity(
      buffer,
      products.filter((product) => Boolean(product.imagen)),
      request.url,
    );
    const exactMatch = perceptualRanking[0];

    if (exactMatch && exactMatch.similarity >= 96) {
      return Response.json({
        matches: [
          resultForMatch(
            exactMatch.product,
            Math.min(100, exactMatch.similarity),
            "La imagen coincide directamente con la fotografía de este producto en el catálogo.",
          ),
        ],
        analysis: {
          tipo: analysis.tipo,
          descripcion: analysis.descripcionVisual,
        },
        comparedCount: products.length,
        catalogCount: products.length,
        mode: "perceptual",
      });
    }

    const searchPoolSlugs = new Set(searchPool.map((product) => product.slug));
    const candidates = Array.from(
      new Map(
        [
          ...featureCandidates(searchPool, analysis).slice(0, 7),
          ...perceptualRanking
            .filter(({ product }) => searchPoolSlugs.has(product.slug))
            .slice(0, 5)
            .map(({ product }) => product),
          ...semanticCandidates,
        ].map((product) => [product.slug, product]),
      ).values(),
    ).slice(0, MAX_VISUAL_CANDIDATES);

    const comparisonResponse = await openai.responses.create({
      model,
      instructions: [
        "Eres el buscador visual del catálogo Totalpars.",
        "Compara la foto del cliente con cada candidato y devuelve hasta tres coincidencias, ordenadas de mejor a peor.",
        "Si la foto contiene varias piezas, devuelve candidatos que cubran las distintas formas o colores visibles.",
        "Cuando haya varias luces de colores distintos en la foto y existan candidatos adecuados, devuelve una coincidencia por cada color visible, hasta completar tres.",
        "Prioriza geometría, proporciones, material, color, conectores, perforaciones, patrón interno, texto visible y función antes que una categoría genérica.",
        "No elijas productos que solo estén relacionados con el contexto de la escena. Deben parecerse al componente físico visible y pertenecer a su misma categoría cuando esta sea clara.",
        "Usa únicamente slugs incluidos en los candidatos. No inventes productos.",
        "La confianza es un PORCENTAJE ENTERO de 0 a 100: por ejemplo, 85 significa 85%. Nunca uses la escala decimal de 0 a 1.",
        "La confianza debe reflejar la similitud visual real; si la coincidencia es débil, usa un porcentaje bajo.",
        "Responde únicamente con el JSON solicitado, en español.",
      ].join("\n"),
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Análisis preliminar: ${JSON.stringify(analysis)}\n\nFoto del cliente:`,
            },
            { type: "input_image", image_url: imageDataUrl, detail: "high" },
            ...candidates.flatMap((product, index) => [
              { type: "input_text" as const, text: productSummary(product, index) },
              {
                type: "input_image" as const,
                image_url: publicImageUrl(product.imagen, request.url),
                detail: "high" as const,
              },
            ]),
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "visual_catalog_matches",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              matches: {
                type: "array",
                maxItems: MAX_RESULTS,
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    slug: { type: "string" },
                    confianza: {
                      type: "integer",
                      minimum: 0,
                      maximum: 100,
                    },
                    razon: { type: "string" },
                  },
                  required: ["slug", "confianza", "razon"],
                },
              },
            },
            required: ["matches"],
          },
        },
      },
    });

    const parsed = parseJson<{ matches: VisualMatch[] }>(
      comparisonResponse.output_text || "",
    );
    const candidateBySlug = new Map(candidates.map((product) => [product.slug, product]));
    const seen = new Set<string>();
    let matches = (parsed?.matches || [])
      .filter((match) => candidateBySlug.has(match.slug) && !seen.has(match.slug))
      .map((match) => {
        seen.add(match.slug);
        const product = candidateBySlug.get(match.slug)!;
        return resultForMatch(product, match.confianza, match.razon.trim());
      });

    const colorFamilies = visibleColorFamilies(analysis);
    if (colorFamilies.length >= 2) {
      const diverseMatches: typeof matches = [];
      const usedSlugs = new Set<string>();

      for (const family of colorFamilies) {
        const existing = matches.find(
          (match) =>
            !usedSlugs.has(match.product.slug) &&
            productMatchesColorFamily(match.product, family),
        );
        const fallbackProduct = candidates.find(
          (product) =>
            !usedSlugs.has(product.slug) &&
            productMatchesColorFamily(product, family),
        );
        const selected =
          existing ||
          (fallbackProduct
            ? resultForMatch(fallbackProduct, 68, colorFamilyReason(family))
            : null);

        if (selected) {
          usedSlugs.add(selected.product.slug);
          diverseMatches.push(selected);
        }
      }

      for (const match of matches) {
        if (diverseMatches.length >= MAX_RESULTS) break;
        if (!usedSlugs.has(match.product.slug)) {
          usedSlugs.add(match.product.slug);
          diverseMatches.push(match);
        }
      }

      matches = diverseMatches.slice(0, MAX_RESULTS);
    }

    if (matches.length === 0) {
      return Response.json(
        { error: "No encontramos una coincidencia confiable en el catálogo." },
        { status: 404 },
      );
    }

    return Response.json({
      matches,
      analysis: {
        tipo: analysis.tipo,
        descripcion: analysis.descripcionVisual,
      },
      comparedCount: candidates.length,
      catalogCount: products.length,
      mode: "openai",
    });
  } catch (error) {
    console.error("Image search failed", error);
    return Response.json(
      { error: "No fue posible analizar la imagen en este momento. Inténtalo de nuevo." },
      { status: 500 },
    );
  }
}
