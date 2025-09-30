import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  await requireAdmin();
  const fd = await req.formData();
  const type = String(fd.get("type") || "");
  const key = String(fd.get("key") || "").trim();

  if (!key) return new Response("Missing key", { status: 400 });

  if (type === "status") {
    await prisma.refStatus.delete({ where: { key } });
  } else if (type === "frame") {
    await prisma.refFrame.delete({ where: { key } });
  } else if (type === "effect") {
    await prisma.refEffect.delete({ where: { key } });
  } else {
    return new Response("Bad type", { status: 400 });
  }

  return new Response(null, { status: 204 });
}