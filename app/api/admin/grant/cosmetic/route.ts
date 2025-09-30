// app/api/admin/grant/cosmetic/route.ts
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

export async function POST(req: Request) {
  await requireAdmin();

  const { handle, frameKey, effectKey, statusKey } = await req.json();

  if (!handle) {
    return new Response("Missing handle", { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { handle: String(handle).toLowerCase() } });
  if (!user) return new Response("User not found", { status: 404 });

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

  if (statusKey) {
    const s = await prisma.refStatus.findUnique({ where: { key: statusKey } });
    if (!s) return new Response("Status not found", { status: 404 });
    data.statusKey = s.key;
  }

  if (Object.keys(data).length === 0) {
    return new Response("Nothing to grant", { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data,
  });

  return Response.json({ ok: true });
}