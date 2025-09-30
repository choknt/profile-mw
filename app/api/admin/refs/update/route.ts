import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  await requireAdmin();
  const fd = await req.formData();

  const type = String(fd.get("type") || "");
  const key = String(fd.get("key") || "").trim();          // ใช้ key ไม่ใช่ id
  const label = String(fd.get("label") || "").trim() || undefined;
  const previewUrl = String(fd.get("previewUrl") || "").trim() || undefined;
  const rarity = String(fd.get("rarity") || "").trim() || undefined;

  if (!key) return new Response("Missing key", { status: 400 });

  if (type === "status") {
    await prisma.refStatus.update({
      where: { key },
      data: { label, /* previewUrl ไม่มีใน RefStatus ตาม schema ก็ไม่ต้องใส้ถ้าไม่ได้ประกาศ */ },
    });
  } else if (type === "frame") {
    await prisma.refFrame.update({
      where: { key },
      data: { label, rarity /* ถ้ามี previewUrl ใน schema ค่อยใส่ */, /* previewUrl */ },
    });
  } else if (type === "effect") {
    await prisma.refEffect.update({
      where: { key },
      data: { label, rarity /* previewUrl ถ้ามีใน schema */, /* previewUrl */ },
    });
  } else {
    return new Response("Bad type", { status: 400 });
  }

  return new Response(null, { status: 204 });
}