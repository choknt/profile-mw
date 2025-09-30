import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Sign in", { status: 401 });

  const body = await req.json().catch(() => ({}));
  const handle = String(body?.handle || "").toLowerCase().trim();
  const reason = String(body?.reason || "").trim();
  if (!handle) return new Response("Missing handle", { status: 400 });
  if (!reason) return new Response("Missing reason", { status: 400 });

  const target = await prisma.user.findUnique({ where: { handle } });
  if (!target) return new Response("Target not found", { status: 404 });

  const createdBy = (session as any).uid as string;

  await prisma.report.create({
    data: {
      targetUserId: target.id,
      targetHandle: handle,
      reason,
      createdBy,
      // status ให้ใช้ค่า default จาก schema (เช่น "pending")
    },
  });

  return new Response(null, { status: 204 });
}