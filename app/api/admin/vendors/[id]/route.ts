import { requireAdminUser } from "@/lib/admin";
import { updateEmpresaSolicitudEstado } from "@/lib/empresas";
import type { SolicitudEstado } from "@/generated/prisma/client";

const VALID_ESTADOS: SolicitudEstado[] = [
  "PENDIENTE",
  "EN_REVISION",
  "APROBADA",
  "RECHAZADA",
];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminUser();

    const { id } = await params;
    const body = (await request.json()) as {
      estado?: SolicitudEstado;
      adminNotes?: string;
    };

    if (!body.estado || !VALID_ESTADOS.includes(body.estado)) {
      return Response.json({ error: "Estado inválido." }, { status: 400 });
    }

    const updated = await updateEmpresaSolicitudEstado(
      id,
      body.estado,
      body.adminNotes,
    );

    return Response.json({ vendor: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error del servidor.";
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return Response.json({ error: message }, { status });
  }
}
