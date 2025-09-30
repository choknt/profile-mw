import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Sign in", { status: 401 });

  const { handle } = await req.json();
  if (!handle) return new Response("Missing handle", { status: 400 });

  const meId = (session.user as any)?.id; // ✅ ใช้ session.user.id
  const target = await prisma.user.findUnique({
    where: { handle: handle.toLowerCase() },
  });
  if (!target) return new Response("Not found", { status: 404 });
  if (target.id === meId) return new Response("Cannot like yourself", { status: 400 });

  const where = { userId_targetUserId: { userId: meId, targetUserId: target.id } };

  const exists = await prisma.like.findUnique({ where }).catch(() => null);
  if (exists) {
    await prisma.like.delete({ where });
  } else {
    await prisma.like.create({ data: { targetUserId: target.id, userId: meId } });
  }

  const count = await prisma.like.count({ where: { targetUserId: target.id } });
  return Response.json({ liked: !exists, count });
}