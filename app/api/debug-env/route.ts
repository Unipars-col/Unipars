import { createHash } from "crypto";

export async function GET() {
  const secret = process.env.WOMPI_INTEGRITY_SECRET;
  let hashTest = "no ejecutado";
  try {
    if (secret) {
      const data = `test123${secret}`;
      hashTest = createHash("sha256").update(data).digest("hex").slice(0, 8) + "...";
    } else {
      hashTest = "secret es falsy";
    }
  } catch (e) {
    hashTest = `error: ${e instanceof Error ? e.message : String(e)}`;
  }

  return Response.json({
    WOMPI_INTEGRITY_SECRET_definida: !!secret,
    WOMPI_INTEGRITY_SECRET_length: secret?.length ?? 0,
    WOMPI_INTEGRITY_SECRET_starts: secret?.slice(0, 8) ?? "N/A",
    hash_test: hashTest,
    WOMPI_PRIVATE_KEY: !!process.env.WOMPI_PRIVATE_KEY,
    WOMPI_EVENTS_SECRET: !!process.env.WOMPI_EVENTS_SECRET,
    NEXT_PUBLIC_WOMPI_PUBLIC_KEY: !!process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY,
    DATABASE_URL: !!process.env.DATABASE_URL,
  });
}
