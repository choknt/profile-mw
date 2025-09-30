import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Sign in", { status: 401 });

  const body = await req.json().catch(() => ({}));
  const code = String(body?.code || "").trim();
  if (!code) return new Response("Missing code", { status: 400 });

  const me = await prisma.user.findUnique({ where: { id: (session as any).uid } });
  if (!me) return new Response("Not found", { status: 404 });

  const g = await prisma.giftCode.findUnique({ where: { code } });
  if (!g) return new Response("Invalid code", { status: 404 });
  if (g.expiresAt && g.expiresAt.getTime() < Date.now()) {
    return new Response("Code expired", { status: 400 });
  }
  if (g.uses >= g.maxUses) {
    return new Response("Code limit reached", { status: 400 });
  }

  const [type, value] = (g.reward || "").split(":");
  const data: Record<string, any> = {};
  if (type === "frame") data.frameKey = value;
  else if (type === "effect") data.effectKey = value;
  else if (type === "status") data.statusKey = value;
  else return new Response("Bad reward", { status: 400 });

  // ทำธุรกรรมให้สำเร็จทั้งคู่หรือยกเลิกทั้งคู่
  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: me.id }, data });
    await tx.giftCode.update({ where: { code: g.code }, data: { uses: g.uses + 1 } });
  });

  return Response.json({ ok: true, reward: g.reward });
}