import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  const me = await prisma.user.findUnique({ where: { id: (session as any).uid } });
  if (!me?.roleAdmin) throw new Error("Forbidden");
  return me;
}
