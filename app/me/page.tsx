import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const userId = (session.user as any)?.id as string | undefined;
  if (!userId) {
    redirect("/login");
  }

  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { handle: true },
  });

  if (!me?.handle) {
    redirect("/create"); // กรณีบัญชีเพิ่งสมัครแล้วยังไม่มี handle
  }

  redirect(`/${me.handle}/edit`);
}