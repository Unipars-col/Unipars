export async function GET() {
  return Response.json({
    WOMPI_INTEGRITY_SECRET: process.env.WOMPI_INTEGRITY_SECRET ? "✅ definida" : "❌ undefined",
    WOMPI_PRIVATE_KEY: process.env.WOMPI_PRIVATE_KEY ? "✅ definida" : "❌ undefined",
    WOMPI_EVENTS_SECRET: process.env.WOMPI_EVENTS_SECRET ? "✅ definida" : "❌ undefined",
    NEXT_PUBLIC_WOMPI_PUBLIC_KEY: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY ? "✅ definida" : "❌ undefined",
    DATABASE_URL: process.env.DATABASE_URL ? "✅ definida" : "❌ undefined",
    APP_SESSION_SECRET: process.env.APP_SESSION_SECRET ? "✅ definida" : "❌ undefined",
  });
}
