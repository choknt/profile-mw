import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  await requireAdmin();
  const form = await req.formData();
  const handle = String(form.get("handle")||"").toLowerCase();
  const statusKey = String(form.get("statusKey")||"");
  const ref = await prisma.statusRef.findUnique({ where: { key: statusKey } });
  if (!ref) return new Response("Status not found", { status: 404 });
  const u = await prisma.user.findUnique({ where: { handle } });
  if (!u) return new Response("User not found", { status: 404 });
  await prisma.user.update({ where: { id: u.id }, data: { statusKey: ref.key } });
  return new Response(null, { status: 204 });
}
