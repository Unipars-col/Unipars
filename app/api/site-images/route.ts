import { getSiteImages } from "@/lib/site-images";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const images = await getSiteImages();
  return Response.json({ images }, {
    headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=60" },
  });
}
