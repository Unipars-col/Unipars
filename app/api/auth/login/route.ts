import { authenticateUser } from "@/lib/users";
import { setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim() || "";
    const password = body.password || "";

    if (!email || !password) {
      return Response.json(
        { error: "Ingresa tu correo y contraseña." },
        { status: 400 },
      );
    }

    const user = await authenticateUser(email, password);

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return Response.json({
      user,
      message: "Inicio de sesión correcto.",
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message === "INVALID_CREDENTIALS"
        ? "Correo o contraseña incorrectos."
        : error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED"
          ? "La base de datos no está configurada todavía."
          : "No fue posible iniciar sesión.";

    return Response.json({ error: message }, { status: 500 });
  }
}
