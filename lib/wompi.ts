import { createHash } from "crypto";

export function generateWompiIntegrityHash(
  reference: string,
  amountInCents: number,
  currency: string,
  secret?: string,
): string {
  const s = secret ?? (process.env as Record<string, string | undefined>)["WOMPI_INTEGRITY_SECRET"];
  if (!s) throw new Error("WOMPI_INTEGRITY_SECRET not configured");
  const data = `${reference}${amountInCents}${currency}${s}`;
  return createHash("sha256").update(data).digest("hex");
}

export function verifyWompiWebhookSignature(
  properties: string[],
  eventData: Record<string, unknown>,
  timestamp: number,
  receivedChecksum: string,
): boolean {
  const secret = process.env.WOMPI_EVENTS_SECRET;
  if (!secret) return false;

  const values = properties.map((prop) => {
    const keys = prop.split(".");
    let value: unknown = eventData;
    for (const key of keys) {
      value = (value as Record<string, unknown>)?.[key];
    }
    return String(value ?? "");
  });

  const concatenated = [...values, timestamp, secret].join("");
  const expected = createHash("sha256").update(concatenated).digest("hex");
  return expected === receivedChecksum;
}
