import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  await requireAdmin();

  const r = await prisma.report.findUnique({ where: { id: params.id } });
  if (!r) return new Response("Not found", { status: 404 });

  // ไม่มีการลบรูปเพราะ schema ไม่มีคอลัมน์รูป
  await prisma.report.update({
    where: { id: r.id },
    data: { status: "approved" },
  });

  return new Response(null, { status: 204 });
}