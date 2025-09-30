import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
export { authOptions } from "@/app/api/auth/[...nextauth]/options";

/**
 * ใช้ในหน้า admin เท่านั้น
 * - ต้องล็อกอิน
 * - user.roleAdmin = true
 * คืนค่า user (จาก Prisma) ถ้าผ่าน
 * ถ้าไม่ผ่านจะ redirect ออก
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      roleAdmin: true,
      handle: true,
      displayName: true,
    },
  });

  if (!me || !me.roleAdmin) {
    redirect("/");
  }

  return me;
}

/** ถ้าต้องการแค่บังคับให้ล็อกอิน (ไม่ตรวจ admin) */
export async function requireSignedIn() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return session;
}