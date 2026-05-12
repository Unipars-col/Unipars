import { setSessionCookie } from "@/lib/auth";
import { authenticateUser } from "@/lib/users";

const PROVIDER_LOGIN_EMAIL = "uniparscolombia@gmail.com";
const PROVIDER_LOGIN_PASSWORD = "123456789";

export async function POST() {
  try {
    const user = await authenticateUser(PROVIDER_LOGIN_EMAIL, PROVIDER_LOGIN_PASSWORD);

    if (user.role !== "ADMIN") {
      return Response.json(
        { error: "Esta cuenta no tiene permisos de administrador." },
        { status: 403 },
      );
    }

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return Response.json({
      user: {
        id: user.id,
        role: user.role,
      },
      message: "Acceso de proveedor correcto.",
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message === "INVALID_CREDENTIALS"
        ? "No fue posible entrar con la cuenta de proveedor."
        : error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED"
          ? "La base de datos no está configurada todavía."
          : "No fue posible iniciar sesión como proveedor.";

    return Response.json({ error: message }, { status: 500 });
  }
}
