import { deleteProduct, updateProduct } from "@/lib/products";
import { requireAdminUser } from "@/lib/admin";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    await requireAdminUser();
    const { slug } = await context.params;
    const body = await request.json();
    const product = await updateProduct(slug, body);

    return Response.json({ product });
  } catch (error) {
    const message =
      error instanceof Error &&
      (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")
        ? "No autorizado."
        : error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED"
          ? "Configura Supabase antes de editar productos desde el panel."
          : error instanceof Error && error.message === "PRODUCT_NOT_FOUND"
            ? "No encontramos el producto que intentas editar."
            : "No fue posible actualizar el producto.";

    const status =
      error instanceof Error &&
      (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")
        ? 401
        : 500;

    return Response.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    await requireAdminUser();
    const { slug } = await context.params;
    await deleteProduct(slug);

    return new Response(null, { status: 204 });
  } catch (error) {
    const message =
      error instanceof Error &&
      (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")
        ? "No autorizado."
        : error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED"
          ? "Configura Supabase antes de eliminar productos desde el panel."
          : "No fue posible eliminar el producto.";

    const status =
      error instanceof Error &&
      (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")
        ? 401
        : 500;

    return Response.json({ error: message }, { status });
  }
}
