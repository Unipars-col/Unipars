import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const required = ["nombreEmpresa", "ciudad", "nombreContacto", "telefono"];
    for (const f of required) {
      if (!data[f]?.toString().trim())
        return Response.json({ error: `El campo "${f}" es obligatorio.` }, { status: 400 });
    }
    if (!prisma) return Response.json({ error: "DB no configurada." }, { status: 500 });
    const solicitud = await prisma.arriendoSolicitud.create({ data });
    return Response.json({ ok: true, id: solicitud.id }, { status: 201 });
  } catch (err) {
    console.error("arriendo POST:", err);
    return Response.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, estado, adminNotes } = await request.json();
    if (!prisma) return Response.json({ error: "DB no configurada." }, { status: 500 });
    const updated = await prisma.arriendoSolicitud.update({ where: { id }, data: { estado, adminNotes } });
    return Response.json(updated);
  } catch (err) {
    return Response.json({ error: "Error interno." }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!prisma) return Response.json({ error: "DB no configurada." }, { status: 500 });
    const solicitudes = await prisma.arriendoSolicitud.findMany({ orderBy: { createdAt: "desc" } });
    return Response.json(solicitudes);
  } catch (err) {
    return Response.json({ error: "Error interno." }, { status: 500 });
  }
}
