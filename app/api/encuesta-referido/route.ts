import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    if (!prisma) return Response.json({ error: "DB no configurada." }, { status: 500 });

    const { opcion, orderId } = await req.json();
    if (!opcion || typeof opcion !== "string") {
      return Response.json({ error: "Opción inválida." }, { status: 400 });
    }

    await prisma.encuestaReferido.create({
      data: { opcion, orderId: orderId ?? null },
    });

    return Response.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error.";
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!prisma) return Response.json({ error: "DB no configurada." }, { status: 500 });

    const respuestas = await prisma.encuestaReferido.findMany({
      orderBy: { createdAt: "desc" },
    });

    const conteo = respuestas.reduce<Record<string, number>>((acc, r) => {
      acc[r.opcion] = (acc[r.opcion] ?? 0) + 1;
      return acc;
    }, {});

    return Response.json({ total: respuestas.length, conteo });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error.";
    return Response.json({ error: msg }, { status: 500 });
  }
}
