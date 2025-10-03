import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MeRedirectPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/me");

  const id = (session.user as any)?.id as string | undefined;
  const handleFromSession = (session.user as any)?.handle as string | undefined;

  if (handleFromSession) redirect(`/${handleFromSession}/edit`);

  if (id) {
    const u = await prisma.user.findUnique({ where: { id }, select: { handle: true } });
    if (u?.handle) redirect(`/${u.handle}/edit`);
  }

  redirect("/login?callbackUrl=/me");
}