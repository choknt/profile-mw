import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  await requireAdmin();
  const form = await req.formData();
  const handle = String(form.get("handle") || "").toLowerCase().trim();
  const frameKey = String(form.get("frameKey") || "").trim();
  const effectKey = String(form.get("effectKey") || "").trim();

  const u = await prisma.user.findUnique({ where: { handle } });
  if (!u) return new Response("User not found", { status: 404 });

  const data: any = {};
  if (frameKey) {
    const f = await prisma.refFrame.findUnique({ where: { key: frameKey } });
    if (!f) return new Response("Frame not found", { status: 404 });
    data.frameKey = f.key;
  }
  if (effectKey) {
    const e = await prisma.refEffect.findUnique({ where: { key: effectKey } });
    if (!e) return new Response("Effect not found", { status: 404 });
    data.effectKey = e.key;
  }

  await prisma.user.update({ where: { id: u.id }, data });
  return new Response(null, { status: 204 });
}