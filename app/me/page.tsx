import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const me = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  if (!me) redirect("/login");

  // ตอนนี้เป็นแบบนี้:
  redirect(`/${me.handle}`);
}