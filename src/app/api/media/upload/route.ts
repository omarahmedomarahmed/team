import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

// Vercel serverless caps request bodies ~4.5MB; keep uploads comfortably under.
const MAX = 4 * 1024 * 1024;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!file.type.startsWith("image/"))
    return NextResponse.json({ error: "Please upload an image." }, { status: 415 });
  if (file.size > MAX)
    return NextResponse.json({ error: "Image is too large (max 4MB). Please compress it." }, { status: 413 });

  const buf = Buffer.from(await file.arrayBuffer());
  const asset = await prisma.mediaAsset.create({
    data: { data: buf, mimeType: file.type, filename: file.name || "upload", size: file.size },
  });
  const url = `/api/media/${asset.id}`;
  await prisma.mediaAsset.update({ where: { id: asset.id }, data: { url } });

  return NextResponse.json({ id: asset.id, url });
}
