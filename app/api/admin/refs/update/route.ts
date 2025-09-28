import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  await requireAdmin();
  const fd = await req.formData();
  const type = String(fd.get("type")||"");
  const id = String(fd.get("id")||"");
  const label = String(fd.get("label")||"").trim();
  const previewUrl = String(fd.get("previewUrl")||"").trim() || undefined;

  if(type==="status") await prisma.statusRef.update({ where: { id }, data: { label, previewUrl } });
  else if(type==="frame") await prisma.frameRef.update({ where: { id }, data: { label, previewUrl } });
  else if(type==="effect") await prisma.effectRef.update({ where: { id }, data: { label, previewUrl } });
  else return new Response("Bad type", { status: 400 });

  return new Response(null, { status: 204 });
}
