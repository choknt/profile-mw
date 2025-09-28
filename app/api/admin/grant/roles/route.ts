import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  await requireAdmin();
  const form = await req.formData();
  const handle = String(form.get("handle")||"").toLowerCase();
  const u = await prisma.user.findUnique({ where: { handle } });
  if (!u) return new Response("User not found", { status: 404 });
  await prisma.user.update({ where: { id: u.id }, data: {
    roleStaff: !!form.get("staff"),
    roleLegend: !!form.get("legend"),
    roleHero: !!form.get("hero")
  }});
  return new Response(null, { status: 204 });
}
