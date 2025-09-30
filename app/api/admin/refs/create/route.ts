import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  await requireAdmin();
  const form = await req.formData();
  const type = String(form.get("type") || "");
  const key = String(form.get("key") || "").trim();
  const label = String(form.get("label") || "").trim();
  const rarity = String(form.get("rarity") || "").trim() || undefined;

  if (!key || !label) return new Response("Missing key/label", { status: 400 });

  if (type === "status") {
    await prisma.refStatus.create({ data: { key, label } });
  } else if (type === "frame") {
    await prisma.refFrame.create({ data: { key, label, rarity } });
  } else if (type === "effect") {
    await prisma.refEffect.create({ data: { key, label, rarity } });
  } else {
    return new Response("Bad type", { status: 400 });
  }

  return new Response(null, { status: 204 });
}