import { prisma } from "@/lib/prisma";
import { createSupabaseStorageClient } from "@/lib/supabase-storage";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let data: Record<string, string | string[]>;
    let fotoFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const foto = formData.get("foto");
      if (foto instanceof File && foto.size > 0) fotoFile = foto;

      data = {
        nombreTaller: formData.get("nombreTaller")?.toString() ?? "",
        tipoTaller: formData.get("tipoTaller")?.toString() ?? "",
        servicios: formData.getAll("servicios").map(String),
        descripcion: formData.get("descripcion")?.toString() ?? "",
        ciudad: formData.get("ciudad")?.toString() ?? "",
        departamento: formData.get("departamento")?.toString() ?? "",
        direccion: formData.get("direccion")?.toString() ?? "",
        nombreContacto: formData.get("nombreContacto")?.toString() ?? "",
        telefono: formData.get("telefono")?.toString() ?? "",
        whatsapp: formData.get("whatsapp")?.toString() ?? "",
        correo: formData.get("correo")?.toString() ?? "",
        horario: formData.get("horario")?.toString() ?? "",
      };
    } else {
      data = await request.json();
    }

    const required = ["nombreTaller", "tipoTaller", "ciudad", "direccion", "nombreContacto", "telefono"];
    for (const f of required) {
      if (!data[f]?.toString().trim()) {
        return Response.json({ error: `El campo "${f}" es obligatorio.` }, { status: 400 });
      }
    }

    let urlFoto: string | undefined;
    if (fotoFile) {
      const supabase = createSupabaseStorageClient();
      if (supabase) {
        const ext = fotoFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `talleres/${Date.now()}.${ext}`;
        const buffer = Buffer.from(await fotoFile.arrayBuffer());
        const { error } = await supabase.storage
          .from(process.env.SUPABASE_STORAGE_BUCKET ?? "product-images")
          .upload(path, buffer, { contentType: fotoFile.type, upsert: false });
        if (!error) {
          const { data: urlData } = supabase.storage
            .from(process.env.SUPABASE_STORAGE_BUCKET ?? "product-images")
            .getPublicUrl(path);
          urlFoto = urlData.publicUrl;
        }
      }
    }

    if (!prisma) return Response.json({ error: "DB no configurada." }, { status: 500 });

    const solicitud = await prisma.tallerSolicitud.create({
      data: {
        nombreTaller: data.nombreTaller as string,
        tipoTaller: data.tipoTaller as string,
        servicios: data.servicios as string[],
        descripcion: data.descripcion as string,
        ciudad: data.ciudad as string,
        departamento: data.departamento as string,
        direccion: data.direccion as string,
        nombreContacto: data.nombreContacto as string,
        telefono: data.telefono as string,
        whatsapp: data.whatsapp as string,
        correo: data.correo as string,
        horario: data.horario as string,
        urlFoto,
      },
    });

    return Response.json({ ok: true, id: solicitud.id }, { status: 201 });
  } catch (err) {
    console.error("aliado POST:", err);
    return Response.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!prisma) return Response.json({ error: "DB no configurada." }, { status: 500 });
    const solicitudes = await prisma.tallerSolicitud.findMany({
      orderBy: { createdAt: "desc" },
    });
    return Response.json(solicitudes);
  } catch (err) {
    console.error("aliado GET:", err);
    return Response.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, estado, adminNotes } = await request.json();
    if (!prisma) return Response.json({ error: "DB no configurada." }, { status: 500 });
    const updated = await prisma.tallerSolicitud.update({
      where: { id },
      data: { estado, adminNotes },
    });
    return Response.json(updated);
  } catch (err) {
    console.error("aliado PATCH:", err);
    return Response.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
