import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const id = (session.user as any)?.id as string | undefined;
  const handleFromSession = (session.user as any)?.handle as string | undefined;

  if (id && handleFromSession) {
    return Response.json({ id, email: session.user?.email || null, handle: handleFromSession });
  }

  if (id) {
    const u = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, handle: true },
    });
    if (!u) return new Response("Not found", { status: 404 });
    return Response.json(u);
  }

  return new Response("Unauthorized", { status: 401 });
}