import { requireMasterUser } from "@/lib/admin";
import { createSupabaseStorageClient, getStorageBucket } from "@/lib/supabase-storage";

const MAX_IMG_SIZE = 5 * 1024 * 1024;
const MAX_VID_SIZE = 50 * 1024 * 1024;
const ALLOWED_IMAGES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEOS = ["video/mp4", "video/webm"];
const ALLOWED = [...ALLOWED_IMAGES, ...ALLOWED_VIDEOS];

export async function POST(request: Request) {
  try {
    await requireMasterUser();
    const supabase = createSupabaseStorageClient();
    if (!supabase) return Response.json({ error: "Storage no configurado." }, { status: 500 });

    const formData = await request.formData();
    const file = formData.get("file");
    const key = String(formData.get("key") || "banner");

    if (!(file instanceof File)) return Response.json({ error: "Archivo requerido." }, { status: 400 });
    if (!ALLOWED.includes(file.type)) return Response.json({ error: "Formato no válido. Usa JPG, PNG, WEBP, MP4 o WEBM." }, { status: 400 });

    const isVideo = ALLOWED_VIDEOS.includes(file.type);
    const maxSize = isVideo ? MAX_VID_SIZE : MAX_IMG_SIZE;
    if (file.size > maxSize) return Response.json({ error: `El archivo supera el límite de ${isVideo ? "50" : "5"} MB.` }, { status: 400 });

    const ext = file.name.split(".").pop()?.toLowerCase() ?? (isVideo ? "mp4" : "jpg");
    const folder = isVideo ? "videos" : "banners";
    const filePath = `${folder}/${key}-${Date.now()}.${ext}`;
    const bucket = getStorageBucket();

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { contentType: file.type, upsert: false });

    if (uploadError) return Response.json({ error: `Error al subir: ${uploadError.message}` }, { status: 500 });

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return Response.json({ publicUrl: data.publicUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return Response.json({ error: msg }, { status: msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500 });
  }
}
