// app/api/admin/grant/status/route.ts
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

export async function POST(req: Request) {
  await requireAdmin();

  const form = await req.formData();
  const handle = String(form.get("handle") || "").toLowerCase();
  const statusKey = String(form.get("statusKey") || "");

  if (!handle || !statusKey) {
    return new Response("Missing handle or statusKey", { status: 400 });
  }

  // ใช้ชื่อให้ตรง Prisma: refStatus (ไม่ใช่ statusRef)
  const ref = await prisma.refStatus.findUnique({ where: { key: statusKey } });
  if (!ref) return new Response("Status not found", { status: 404 });

  const u = await prisma.user.findUnique({ where: { handle } });
  if (!u) return new Response("User not found", { status: 404 });

  await prisma.user.update({
    where: { id: u.id },
    data: { statusKey: ref.key },
  });

  return Response.json({ ok: true });
}