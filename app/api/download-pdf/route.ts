export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const filename = searchParams.get("filename") || "ficha-tecnica.pdf";

  if (!url) {
    return new Response("Falta el parámetro url", { status: 400 });
  }

  const response = await fetch(url);

  if (!response.ok) {
    return new Response("No se pudo obtener el archivo", { status: 502 });
  }

  const buffer = await response.arrayBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
