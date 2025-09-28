import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  await requireAdmin();
  const r = await prisma.report.findUnique({ where: { id: params.id } });
  if (!r) return new Response("Not found", { status: 404 });
  await prisma.report.update({ where: { id: r.id }, data: { status: "rejected", moderatorNote: "No action" } });
  return new Response(null, { status: 204 });
}
