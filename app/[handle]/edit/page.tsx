import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import React from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = { params: { handle: string } };

export default async function EditProfilePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const meId = (session.user as any)?.id as string | undefined;
  if (!meId) redirect("/login");

  const handle = params.handle.toLowerCase();

  // ดึงโปรไฟล์จากฐานข้อมูล
  const me = await prisma.user.findUnique({
    where: { handle },
    select: {
      id: true,
      handle: true,
      displayName: true,
      nickname: true,
      bio: true,
      countryCode: true,
      avatarUrl: true,
      bgKind: true,
      bgValue: true,
      statusKey: true,
      frameKey: true,
      effectKey: true,
      favoriteShipName: true,
      favoriteShipCode: true,
      favoriteShipImage: true,
      musicEnabled: true,
      musicEmbedUrl: true,
    },
  });

  if (!me) notFound();

  // กันแก้โปรไฟล์คนอื่น
  const owner = await prisma.user.findUnique({
    where: { id: meId },
    select: { id: true, handle: true },
  });
  if (!owner) redirect("/login");

  if (owner.handle !== handle) {
    redirect(`/${handle}`); // ไม่ใช่เจ้าของ -> พาไปดูหน้า public profile
  }

  // ---- Server Action: Save ----
  async function saveProfile(formData: FormData) {
    "use server";

    const sessionInAction = await getServerSession(authOptions);
    if (!sessionInAction) redirect("/login");
    const actionUid = (sessionInAction.user as any)?.id;
    if (!actionUid) redirect("/login");

    // ยืนยันว่าเจ้าของ = คนที่ยิง action
    const ownerNow = await prisma.user.findUnique({ where: { id: actionUid }, select: { handle: true } });
    if (!ownerNow || ownerNow.handle !== handle) {
      redirect(`/${handle}`); // ป้องกันแก้ของคนอื่น
    }

    // รับค่าจากฟอร์ม
    const displayName = (formData.get("displayName") || "") as string;
    const nickname = (formData.get("nickname") || "") as string;
    const bio = (formData.get("bio") || "") as string;
    const countryCode = (formData.get("countryCode") || "") as string;

    const avatarUrl = (formData.get("avatarUrl") || "") as string; // ถ้าอัปโหลดไปที่ cloud แล้ว เก็บ URL ไว้ตรงนี้
    const bgKind = (formData.get("bgKind") || "") as string;
    const bgValue = (formData.get("bgValue") || "") as string;

    const statusKey = (formData.get("statusKey") || "") as string;
    const frameKey = (formData.get("frameKey") || "") as string;
    const effectKey = (formData.get("effectKey") || "") as string;

    const favoriteShipName = (formData.get("favoriteShipName") || "") as string;
    const favoriteShipCode = (formData.get("favoriteShipCode") || "") as string;
    const favoriteShipImage = (formData.get("favoriteShipImage") || "") as string;

    const musicEnabled = formData.get("musicEnabled") === "on";
    const musicEmbedUrl = (formData.get("musicEmbedUrl") || "") as string;

    // เตรียม data (กำจัดค่าว่างให้เป็น undefined จะได้ไม่ทับ null อย่างงง ๆ)
    const data: any = {
      displayName: displayName?.trim() || undefined,
      nickname: nickname?.trim() || undefined,
      bio: bio?.trim() || undefined,
      countryCode: countryCode?.trim() || undefined,

      avatarUrl: avatarUrl?.trim() || undefined,
      bgKind: bgKind?.trim() || undefined,
      bgValue: bgValue?.trim() || undefined,

      statusKey: statusKey?.trim() || undefined,
      frameKey: frameKey?.trim() || undefined,
      effectKey: effectKey?.trim() || undefined,

      favoriteShipName: favoriteShipName?.trim() || undefined,
      favoriteShipCode: favoriteShipCode?.trim() || undefined,
      favoriteShipImage: favoriteShipImage?.trim() || undefined,

      musicEnabled,
      musicEmbedUrl: musicEmbedUrl?.trim() || undefined,
    };

    await prisma.user.update({
      where: { id: actionUid },
      data,
    });

    // เซฟเสร็จ พากลับหน้า public เพื่อดูผล หรือจะ redirect กลับหน้า edit ก็ได้
    redirect(`/${handle}`);
  }

  // UI ฟอร์ม (Server Component + Server Action)
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Edit profile</h1>

      <form action={saveProfile} className="space-y-4">
        {/* แสดง avatar (ถ้าไม่มีให้ fallback เป็น /avatar.png) */}
        <div className="flex items-center gap-4">
          <img
            src={me.avatarUrl || "/avatar.png"}
            alt="avatar"
            className="h-20 w-20 rounded-full object-cover border border-white/10"
          />
          <div className="flex-1">
            <label className="block text-sm mb-1">Avatar URL</label>
            <input
              name="avatarUrl"
              defaultValue={me.avatarUrl || ""}
              placeholder="https://..."
              className="w-full rounded bg-white/5 px-3 py-2 outline-none ring-0"
            />
            <p className="text-xs text-white/50 mt-1">
              ถ้ารูปไม่ขึ้น ลองวาง URL ของรูปโดยตรง (เช่นที่อัปโหลดไป Cloudinary) — ไฟล์ /avatar.png เป็นแค่ fallback
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Display name</label>
            <input
              name="displayName"
              defaultValue={me.displayName || ""}
              className="w-full rounded bg-white/5 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Nickname</label>
            <input
              name="nickname"
              defaultValue={me.nickname || ""}
              className="w-full rounded bg-white/5 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Country code (เช่น TH, US)</label>
            <input
              name="countryCode"
              defaultValue={me.countryCode || ""}
              className="w-full rounded bg-white/5 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Status key</label>
            <input
              name="statusKey"
              defaultValue={me.statusKey || ""}
              className="w-full rounded bg-white/5 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Frame key</label>
            <input
              name="frameKey"
              defaultValue={me.frameKey || ""}
              className="w-full rounded bg-white/5 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Effect key</label>
            <input
              name="effectKey"
              defaultValue={me.effectKey || ""}
              className="w-full rounded bg-white/5 px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Bio</label>
          <textarea
            name="bio"
            defaultValue={me.bio || ""}
            rows={4}
            className="w-full rounded bg-white/5 px-3 py-2"
          />
        </div>

        {/* BG */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Background kind</label>
            <input
              name="bgKind"
              defaultValue={me.bgKind || ""}
              placeholder='เช่น "color"'
              className="w-full rounded bg-white/5 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Background value</label>
            <input
              name="bgValue"
              defaultValue={me.bgValue || ""}
              placeholder='เช่น "ocean" หรือ #001122'
              className="w-full rounded bg-white/5 px-3 py-2"
            />
          </div>
        </div>

        {/* Favorite Ship */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Favorite ship name</label>
            <input
              name="favoriteShipName"
              defaultValue={me.favoriteShipName || ""}
              className="w-full rounded bg-white/5 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Favorite ship code</label>
            <input
              name="favoriteShipCode"
              defaultValue={me.favoriteShipCode || ""}
              className="w-full rounded bg-white/5 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Favorite ship image URL</label>
            <input
              name="favoriteShipImage"
              defaultValue={me.favoriteShipImage || ""}
              placeholder="https://..."
              className="w-full rounded bg-white/5 px-3 py-2"
            />
          </div>
        </div>

        {/* Music */}
        <div className="rounded-xl bg-white/5 p-4 space-y-3">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="musicEnabled" defaultChecked={!!me.musicEnabled} />
            <span>Enable music</span>
          </label>
          <div>
            <label className="block text-sm mb-1">Music embed URL</label>
            <input
              name="musicEmbedUrl"
              defaultValue={me.musicEmbedUrl || ""}
              placeholder="https://open.spotify.com/embed/track/..."
              className="w-full rounded bg-white/5 px-3 py-2"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-cyan-500 px-4 py-2 text-black font-semibold hover:bg-cyan-400"
          >
            Save changes
          </button>
          <a
            href={`/${me.handle}`}
            className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20"
          >
            Cancel
          </a>
        </div>
      </form>
    </main>
  );
}