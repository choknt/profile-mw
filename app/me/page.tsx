import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function MePage() {
  // ถ้ายังไม่ได้ล็อกอิน → ไปหน้า login แล้วกลับมาที่ /me หลังสำเร็จ
  const session = await getServerSession(authOptions);
  if (!session) redirect(`/login?callbackUrl=/me`);

  const uid = (session.user as any)?.id;
  if (!uid) redirect(`/login?callbackUrl=/me`);

  // หา handle ของผู้ใช้ปัจจุบัน
  const me = await prisma.user.findUnique({
    where: { id: uid },
    select: { handle: true },
  });

  // ถ้ายังไม่เคยสร้างโปรไฟล์ → ไปหน้า Create profile
  if (!me || !me.handle) redirect("/create");

  // พร้อมแล้ว → ส่งไปหน้าแก้ไขโปรไฟล์
  redirect(`/${me.handle}/edit`);
}