import OpenAI from "openai";

export const dynamic = "force-dynamic";

const openai = (process.env as Record<string, string | undefined>)["OPENAI_API_KEY"]
  ? new OpenAI({ apiKey: (process.env as Record<string, string | undefined>)["OPENAI_API_KEY"] })
  : null;

const CATEGORIAS = [
  "Espejos retrovisores y soportes",
  "Motores y ventiladores",
  "Luces y direccionales",
  "Sistemas limpiaparabrisas",
  "Línea neumática",
  "Línea inyección y extrusión",
  "Línea mecanizado",
  "Línea cauchos",
  "Adhesivos, lubricantes y sellantes",
  "Línea eléctrica",
];

export type AiExpandResponse = {
  keywords: string[];
  categoria: string | null;
  interpretacion: string | null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q) {
    return Response.json({ error: "q es requerido" }, { status: 400 });
  }

  if (!openai) {
    return Response.json({ keywords: [q], categoria: null, interpretacion: null } satisfies AiExpandResponse);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres un asistente técnico para Totalpars, marketplace colombiano de repuestos para buses, camiones y transporte público.
Categorías disponibles: ${CATEGORIAS.join(", ")}.
Dado un texto del usuario, extrae palabras clave técnicas para buscar repuestos en el catálogo.
Responde SOLO con JSON: {"keywords":["word1","word2"],"categoria":"nombre exacto o null","interpretacion":"frase corta descriptiva"}
Reglas:
- Máximo 6 keywords en español, minúsculas, sin artículos ni preposiciones
- categoria debe ser exactamente uno de los nombres listados o null
- interpretacion: máx 8 palabras describiendo qué busca el usuario`,
        },
        { role: "user", content: q },
      ],
      max_tokens: 150,
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0].message.content ?? "{}";
    const result = JSON.parse(raw) as Partial<AiExpandResponse>;

    return Response.json({
      keywords: Array.isArray(result.keywords) && result.keywords.length > 0 ? result.keywords : [q],
      categoria: typeof result.categoria === "string" ? result.categoria : null,
      interpretacion: typeof result.interpretacion === "string" ? result.interpretacion : null,
    } satisfies AiExpandResponse);
  } catch {
    return Response.json({ keywords: [q], categoria: null, interpretacion: null } satisfies AiExpandResponse);
  }
}
