import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  await requireAdmin();
  const fd = await req.formData();
  const type = String(fd.get("type")||"");
  const id = String(fd.get("id")||"");

  if(type==="status") await prisma.statusRef.delete({ where: { id } });
  else if(type==="frame") await prisma.frameRef.delete({ where: { id } });
  else if(type==="effect") await prisma.effectRef.delete({ where: { id } });
  else return new Response("Bad type", { status: 400 });

  return new Response(null, { status: 204 });
}
