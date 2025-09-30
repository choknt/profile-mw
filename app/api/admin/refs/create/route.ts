import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  await requireAdmin();

  const form = await req.formData();
  const type  = String(form.get("type") || "").trim();   // "status" | "frame" | "effect"
  const key   = String(form.get("key")  || "").trim();
  const label = String(form.get("label")|| "").trim();

  if (!key || !label) {
    return new Response("Missing key/label", { status: 400 });
  }

  if (type === "status") {
    await prisma.refStatus.create({ data: { key, label } });
  } else if (type === "frame") {
    await prisma.refFrame.create({ data: { key, label } });
  } else if (type === "effect") {
    await prisma.refEffect.create({ data: { key, label } });
  } else {
    return new Response("Bad type", { status: 400 });
  }

  return new Response(null, { status: 204 });
}