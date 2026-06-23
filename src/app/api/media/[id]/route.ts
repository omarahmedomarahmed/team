import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset?.data) return new Response("Not found", { status: 404 });

  return new Response(Buffer.from(asset.data), {
    headers: {
      "Content-Type": asset.mimeType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
