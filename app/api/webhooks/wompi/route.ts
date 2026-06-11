import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyWompiWebhookSignature } from "@/lib/wompi";

type WompiTransaction = {
  id?: string;
  status?: string;
  reference?: string;
  amount_in_cents?: number;
  currency?: string;
};

type WompiEvent = {
  event: string;
  data: { transaction?: WompiTransaction };
  timestamp: number;
  signature?: { checksum: string; properties: string[] };
};

export async function POST(request: Request) {
  const bodyText = await request.text();

  let event: WompiEvent;
  try {
    event = JSON.parse(bodyText) as WompiEvent;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (event.signature?.properties && event.signature.checksum) {
    const isValid = verifyWompiWebhookSignature(
      event.signature.properties,
      event.data as Record<string, unknown>,
      event.timestamp,
      event.signature.checksum,
    );
    if (!isValid) {
      return new Response("Invalid signature", { status: 401 });
    }
  }

  if (event.event === "transaction.updated" && prisma) {
    const transaction = event.data?.transaction;
    const reference = transaction?.reference;

    if (!reference) return new Response("OK", { status: 200 });

    if (transaction?.status === "APPROVED") {
      try {
        await prisma.order.update({
          where: { id: reference },
          data: { status: "PAID", paymentStatus: "PAID" },
        });
        revalidatePath("/mi-cuenta");
        revalidatePath("/admin");
      } catch {
        // Order may not exist for this reference
      }
    } else if (transaction?.status === "DECLINED" || transaction?.status === "ERROR") {
      try {
        await prisma.order.update({
          where: { id: reference },
          data: { paymentStatus: "FAILED" },
        });
      } catch {
        // ignore
      }
    }
  }

  return new Response("OK", { status: 200 });
}
