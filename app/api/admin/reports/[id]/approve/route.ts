import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  await requireAdmin();
  const r = await prisma.report.findUnique({ where: { id: params.id } });
  if (!r) return new Response("Not found", { status: 404 });

  if (r.type === "image" && r.imagePublicId) {
    try { await cloudinary.uploader.destroy(r.imagePublicId); } catch {}
    if (r.imageUrl) {
      await prisma.galleryImage.deleteMany({ where: { url: r.imageUrl } });
    }
  }

  await prisma.report.update({ where: { id: r.id }, data: { status: "approved", moderatorNote: "Removed by moderator" } });
  return new Response(null, { status: 204 });
}
