import { getSessionFromCookies } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) return Response.json({ user: null });
  return Response.json({ user: { role: session.role, email: session.email } });
}
