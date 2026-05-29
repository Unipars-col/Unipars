import { requireAdminUser } from "@/lib/admin";
import { getVendorsWithMetrics } from "@/lib/empresas";

export async function GET() {
  try {
    await requireAdminUser();
    const vendors = await getVendorsWithMetrics();
    return Response.json({ vendors });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error del servidor.";
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return Response.json({ error: message }, { status });
  }
}
