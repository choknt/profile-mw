import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  await requireAdmin();
  const fd = await req.formData();
  const type = String(fd.get("type")||"");
  const key = String(fd.get("key")||"").trim();
  const label = String(fd.get("label")||"").trim();
  const previewUrl = String(fd.get("previewUrl")||"").trim() || undefined;
  if(!key || !label) return new Response("Missing key/label", { status: 400 });

  if(type==="status") await prisma.statusRef.create({ data: { key, label, previewUrl } });
  else if(type==="frame") await prisma.frameRef.create({ data: { key, label, previewUrl } });
  else if(type==="effect") await prisma.effectRef.create({ data: { key, label, previewUrl } });
  else return new Response("Bad type", { status: 400 });

  return Response.redirect(new URL("/admin/refs", req.url), 302);
}
