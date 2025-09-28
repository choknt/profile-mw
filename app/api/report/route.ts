import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { type, targetHandle, reason, image } = await req.json();
  if (!type || !targetHandle || !reason) return new Response("Missing fields", { status: 400 });

  const session = await getServerSession(authOptions);
  const createdBy = session ? (session as any).uid : undefined;

  const target = await prisma.user.findUnique({ where: { handle: String(targetHandle).toLowerCase() } });
  if (!target) return new Response("Target not found", { status: 404 });

  await prisma.report.create({
    data: {
      type, targetUserId: target.id, reason,
      imageUrl: image?.url, imagePublicId: image?.publicId, createdBy
    }
  });
  return new Response(null, { status: 201 });
}
