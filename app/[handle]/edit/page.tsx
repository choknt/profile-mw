import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect, notFound } from "next/navigation";

export default async function EditPage({ params }: { params: { handle: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");
  const meId = (session as any).uid;

  const u = await prisma.user.findUnique({
    where: { handle: params.handle.toLowerCase() },
    select: {
      id: true, handle: true,
      displayName: true, nickname: true, bio: true,
      countryCode: true,
      gameId: true, level: true,
      avatarUrl: true,
      frameKey: true, effectKey: true,
      bgKind: true, bgValue: true,
      statusKey: true,
      favoriteShipName: true, favoriteShipCode: true, favoriteShipImage: true,
      musicEnabled: true, musicTrackId: true, musicEmbedUrl: true,
      showClan: true, clanId: true, clanTag: true,
    }
  });
  if (!u) notFound();
  if (u.id !== meId) redirect(`/${params.handle}`);

  async function save(formData: FormData) {
    "use server";
    const payload = Object.fromEntries(formData.entries());

    // เคลียร์ค่าที่เป็น string ว่าง => undefined
    for (const k of Object.keys(payload)) {
      if (payload[k] === "") (payload as any)[k] = undefined;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/profile/update`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      // สำคัญ: ใช้ cookies ฝั่ง server ให้ next-auth เห็น session
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${await res.text()}`);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Edit profile</h1>

      <form action={save} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Display name</label>
          <input name="displayName" defaultValue={u.displayName || ""} className="w-full rounded bg-white/5 p-2" />
        </div>

        <div>
          <label className="block text-sm mb-1">Nickname</label>
          <input name="nickname" defaultValue={u.nickname || ""} className="w-full rounded bg-white/5 p-2" />
        </div>

        <div>
          <label className="block text-sm mb-1">Bio</label>
          <textarea name="bio" defaultValue={u.bio || ""} className="w-full rounded bg-white/5 p-2" rows={3} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Game ID</label>
            <input name="gameId" defaultValue={u.gameId || ""} className="w-full rounded bg-white/5 p-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Level</label>
            <input name="level" type="number" defaultValue={u.level ?? ""} className="w-full rounded bg-white/5 p-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Avatar URL</label>
          <input name="avatarUrl" defaultValue={u.avatarUrl || ""} className="w-full rounded bg-white/5 p-2" />
          <p className="text-xs text-white/60 mt-1">วางลิงก์รูป (เช่นจาก Cloudinary) — ถ้ากรอกค่านี้จะใช้รูปนี้แทนไฟล์ default</p>
        </div>

        <button
          type="submit"
          className="rounded bg-cyan-600 px-4 py-2 font-medium hover:bg-cyan-500"
        >
          Save
        </button>
      </form>
    </main>
  );
}