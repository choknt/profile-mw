import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic"; // ให้รันฝั่งเซิร์ฟเวอร์ทุกครั้ง

export default async function MePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <main className="mx-auto max-w-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Unauthorized</h1>
        <p className="mb-4">โปรดล็อกอินก่อนใช้งาน</p>
        <Link href="/login" className="rounded bg-white/10 px-3 py-1">ไปหน้า Login</Link>
      </main>
    );
  }

  const userId = (session.user as any)?.id; // << ใช้ session.user.id
  if (!userId) {
    return (
      <main className="mx-auto max-w-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Session invalid</h1>
        <p>ไม่พบรหัสผู้ใช้ในเซสชัน</p>
      </main>
    );
  }

  const me = await prisma.user.findUnique({
    where: { id: userId },
    include: { socials: true, gallery: true },
  });

  if (!me) {
    // มีเซสชัน แต่ยังไม่มีเรคคอร์ดใน DB (เช่น สร้างบัญชีไม่สำเร็จ)
    return (
      <main className="mx-auto max-w-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Profile not found</h1>
        <p className="mb-4">ยังไม่มีโปรไฟล์สำหรับบัญชีนี้</p>
        <Link href="/create" className="rounded bg-white/10 px-3 py-1">ไปสร้างโปรไฟล์</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Hello, {me.displayName || me.handle}</h1>
      <div className="flex items-center gap-4">
        <img
          src={me.avatarUrl || "/avatar.png"}
          alt="avatar"
          className="h-20 w-20 rounded object-cover"
        />
        <div>
          <div>@{me.handle}</div>
          {me.email && <div className="text-white/70">{me.email}</div>}
        </div>
      </div>

      {me.bio && <p className="text-white/80">{me.bio}</p>}

      <div className="space-y-2">
        <h2 className="font-semibold">Socials</h2>
        <div className="flex flex-wrap gap-2">
          {(me.socials || []).map((s) => (
            <a key={s.id} href={s.url} target="_blank" className="rounded bg-white/10 px-3 py-1">
              {s.platform}: {s.displayName || s.url}
            </a>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">Gallery</h2>
        <div className="grid grid-cols-3 gap-2">
          {(me.gallery || []).map((g) => (
            <img key={g.id} src={g.url} className="aspect-square w-full rounded object-cover" />
          ))}
        </div>
      </div>

      <div className="pt-4">
        <Link href={`/${me.handle}`} className="rounded bg-white/10 px-3 py-1">
          ดูหน้าโปรไฟล์สาธารณะ
        </Link>
      </div>
    </main>
  );
      }
