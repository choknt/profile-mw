import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { v2 as cloudinary } from "cloudinary";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: { handle: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

// -- Cloudinary (ถ้าตั้งค่า .env ไว้ จะอัปโหลดจริง / ถ้าไม่ มันจะข้ามการอัปโหลด) --
const canUpload =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

if (canUpload) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  });
}

// รายชื่อประเทศแบบย่อ (เพิ่มง่าย ๆ ถ้าต้องการทั้งหมด)
const COUNTRIES: { code: string; name: string }[] = [
  { code: "TH", name: "Thailand" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "CN", name: "China" },
  { code: "VN", name: "Vietnam" },
  { code: "ID", name: "Indonesia" },
  { code: "MY", name: "Malaysia" },
  { code: "SG", name: "Singapore" },
  // …ถ้าต้องการ “ทุกประเทศ” จริง ๆ แนะนำเก็บเป็นไฟล์ JSON แล้ว import เข้ามา
];

// Favorite ships (ตัวอย่าง)
const FAVORITE_SHIPS = [
  { code: "DDG-1000", name: "USS Zumwalt" },
  { code: "KDX-III", name: "Sejong the Great" },
  { code: "Type-055", name: "Nanchang" },
  { code: "CVN-78", name: "USS Gerald R. Ford" },
];

async function uploadFile(file: File, folder: string) {
  "use server";
  if (!canUpload || !file || file.size === 0) return null;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // upload_stream (รองรับบัฟเฟอร์)
  const res: any = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });

  return { url: res.secure_url as string, publicId: res.public_id as string };
}

export default async function EditProfilePage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const meId = (session.user as any)?.id as string | undefined;
  if (!meId) redirect("/login");

  const handle = params.handle.toLowerCase();

  // ข้อมูลผู้ใช้
  const me = await prisma.user.findUnique({
    where: { handle },
    include: {
      socials: true,
      gallery: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!me) notFound();

  // กันแก้โปรไฟล์คนอื่น
  if (me.id !== meId) redirect(`/${handle}`);

  // โหลด reference (แสดงให้ดู แต่ “ล็อกไว้” ให้แอดมินแก้)
  const [statuses, frames, effects] = await Promise.all([
    prisma.refStatus.findMany({ where: { active: true }, orderBy: { label: "asc" } }),
    prisma.refFrame.findMany({ where: { active: true }, orderBy: { label: "asc" } }),
    prisma.refEffect.findMany({ where: { active: true }, orderBy: { label: "asc" } }),
  ]);

  const saved = searchParams?.saved === "1";

  // ---- Server Action: Save ----
  async function saveAction(formData: FormData) {
    "use server";

    const s = await getServerSession(authOptions);
    if (!s) redirect("/login");
    const uid = (s.user as any)?.id;
    if (!uid) redirect("/login");

    const you = await prisma.user.findUnique({ where: { id: uid }, select: { handle: true } });
    if (!you || you.handle !== handle) redirect(`/${handle}`);

    // ---- อ่านค่าวิธี “เลือกรูป/อัปโหลด” ----
    const newAvatarFile = formData.get("avatarFile") as File | null;
    const newBgFile = formData.get("bgFile") as File | null;

    // ถ้าไม่อัปโหลดไฟล์ใหม่ ให้ใช้ค่าที่กรอก (เช่น URL โดยตรง)
    const avatarUrlText = (formData.get("avatarUrl") || "") as string;
    const bgValueColor = (formData.get("bgValue") || "") as string; // สี BG
    const bgKind = (formData.get("bgKind") || "image") as string; // "image" หรือ "color"

    // อัปโหลดไฟล์ (ถ้ามี)
    let avatarUrl: string | undefined = avatarUrlText?.trim() || undefined;
    if (newAvatarFile && newAvatarFile.size > 0) {
      const up = await uploadFile(newAvatarFile, `profiles/${uid}/avatar`);
      if (up?.url) avatarUrl = up.url;
    }

    let bgImageUrl: string | undefined = undefined;
    if (newBgFile && newBgFile.size > 0) {
      const up = await uploadFile(newBgFile, `profiles/${uid}/background`);
      if (up?.url) bgImageUrl = up.url;
    }

    // ฟิลด์ทั่ว ๆ ไป
    const displayName = (formData.get("displayName") || "") as string;
    const nickname = (formData.get("nickname") || "") as string;
    const bio = (formData.get("bio") || "") as string;
    const countryCode = (formData.get("countryCode") || "") as string;

    // Status/Frame/Effect — “ล็อก” ให้แก้เฉพาะแอดมิน
    // const statusKey = formData.get("statusKey") as string | null;
    // const frameKey  = formData.get("frameKey")  as string | null;
    // const effectKey = formData.get("effectKey") as string | null;

    // Favorite ship
    const favShipCode = (formData.get("favoriteShipCode") || "") as string;
    const favShip = FAVORITE_SHIPS.find((s) => s.code === favShipCode);
    const favoriteShipName = favShip?.name || null;
    const favoriteShipCode = favShip?.code || null;
    const favoriteShipImage = null as string | null; // ตามสเปค: “เว็บจะใส่รูปให้” ไม่ให้ผู้ใช้กรอก

    // Music
    const musicEnabled = formData.get("musicEnabled") === "on";
    const musicEmbedUrl = (formData.get("musicEmbedUrl") || "") as string;

    // Social links (10 รายการ)
    const socialInputs: { url: string; label: string }[] = [];
    for (let i = 0; i < 10; i++) {
      const url = (formData.get(`socialUrl_${i}`) || "") as string;
      const label = (formData.get(`socialLabel_${i}`) || "") as string;
      if (url.trim()) socialInputs.push({ url: url.trim(), label: label.trim() || "link" });
    }

    // Gallery uploads (5 ไฟล์)
    const galleryFiles: (File | null)[] = [
      formData.get("galleryFile_0") as File | null,
      formData.get("galleryFile_1") as File | null,
      formData.get("galleryFile_2") as File | null,
      formData.get("galleryFile_3") as File | null,
      formData.get("galleryFile_4") as File | null,
    ];
    const galleryUrls: string[] = [];
    for (const f of galleryFiles) {
      if (f && f.size > 0) {
        const up = await uploadFile(f, `profiles/${uid}/gallery`);
        if (up?.url) galleryUrls.push(up.url);
      }
    }

    // สร้าง payload อัปเดต
    const data: any = {
      displayName: displayName?.trim() || undefined,
      nickname: nickname?.trim() || undefined,
      bio: bio?.trim() || undefined,
      countryCode: countryCode?.trim() || undefined,

      // avatar
      avatarUrl: avatarUrl,

      // BG: ถ้าอัปโหลดรูปใหม่ ให้บันทึกเป็น kind=image + bgValue = URL รูป
      // ถ้าไม่ได้อัปโหลด และกรอกสี → kind=color + bgValue = สี
      ...(bgImageUrl
        ? { bgKind: "image", bgValue: bgImageUrl }
        : bgKind === "color"
        ? { bgKind: "color", bgValue: bgValueColor?.trim() || undefined }
        : {}),

      // cosmetics: ล็อกไว้ให้แอดมินแก้จากหลังบ้าน
      // statusKey: statusKey || undefined,
      // frameKey: frameKey || undefined,
      // effectKey: effectKey || undefined,

      musicEnabled,
      musicEmbedUrl: musicEmbedUrl?.trim() || undefined,

      favoriteShipName,
      favoriteShipCode,
      favoriteShipImage,
    };

    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: uid }, data });

      // โซเชียล: ลบทั้งหมดแล้วสร้างใหม่ (ง่ายสุด/ตรงสเปค 10 ช่อง)
      await tx.socialLink.deleteMany({ where: { userId: uid } });
      if (socialInputs.length) {
        await tx.socialLink.createMany({
          data: socialInputs.map((s) => ({
            userId: uid,
            url: s.url,
            platform: "custom",
            displayName: s.label || null,
          })),
        });
      }

      // แกลเลอรี: เพิ่มรูปใหม่ (ไม่ลบของเดิม—ถ้าอยากจำกัดรวมไม่เกิน 5 ภาพ ให้ลบก่อนแล้วสร้าง)
      for (const url of galleryUrls) {
        await tx.galleryImage.create({
          data: { userId: uid, url },
        });
      }
    });

    redirect(`/${handle}/edit?saved=1`);
  }

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Edit profile</h1>

      {saved && (
        <div className="rounded-lg bg-green-600/20 border border-green-500/30 px-3 py-2 text-green-300">
          บันทึกแล้ว
        </div>
      )}

      <form action={saveAction} className="space-y-6" encType="multipart/form-data">
        {/* Avatar */}
        <section className="space-y-3">
          <h2 className="font-semibold">Avatar</h2>
          <div className="flex items-center gap-4">
            <img
              src={me.avatarUrl || "/avatar.png"}
              className="h-20 w-20 rounded-full object-cover border border-white/10"
              alt=""
            />
            <div className="flex-1 grid gap-2">
              <input
                type="file"
                name="avatarFile"
                accept="image/*"
                className="block w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-3 file:py-2"
              />
              <input
                name="avatarUrl"
                placeholder="หรือวาง URL รูป (ถ้าไม่อัปไฟล์)"
                defaultValue={me.avatarUrl || ""}
                className="w-full rounded bg-white/5 px-3 py-2"
              />
            </div>
          </div>
        </section>

        {/* ข้อมูลทั่วไป */}
        <section className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Display name</label>
            <input name="displayName" defaultValue={me.displayName || ""} className="w-full rounded bg-white/5 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Nickname</label>
            <input name="nickname" defaultValue={me.nickname || ""} className="w-full rounded bg-white/5 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Country</label>
            <select name="countryCode" defaultValue={me.countryCode || ""} className="w-full rounded bg-white/5 px-3 py-2">
              <option value="">—</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Bio</label>
            <textarea name="bio" rows={3} defaultValue={me.bio || ""} className="w-full rounded bg-white/5 px-3 py-2" />
          </div>
        </section>

        {/* Status / Frame / Effect (ล็อกให้แอดมินเท่านั้น) */}
        <section className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Status (admin only)</label>
            <select disabled defaultValue={me.statusKey || ""} className="w-full rounded bg-white/5 px-3 py-2">
              <option value="">—</option>
              {statuses.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
            {/* <select name="statusKey" ... > ถ้าจะให้ผู้ใช้เลือกจาก “grant” ค่อยเปิดใช้ */}
          </div>
          <div>
            <label className="block text-sm mb-1">Frame (admin only)</label>
            <select disabled defaultValue={me.frameKey || ""} className="w-full rounded bg-white/5 px-3 py-2">
              <option value="">—</option>
              {frames.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Effect (admin only)</label>
            <select disabled defaultValue={me.effectKey || ""} className="w-full rounded bg-white/5 px-3 py-2">
              <option value="">—</option>
              {effects.map((e) => (
                <option key={e.key} value={e.key}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Background */}
        <section className="space-y-2">
          <h2 className="font-semibold">Background</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Upload image</label>
              <input type="file" name="bgFile" accept="image/*" className="block w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-3 file:py-2" />
              <p className="text-xs text-white/50 mt-1">เลือกรูปเพื่อใช้เป็นฉากหลัง</p>
            </div>
            <div>
              <label className="block text-sm mb-1">Background value (color)</label>
              <input name="bgValue" placeholder="#001122" defaultValue={me.bgKind === "color" ? me.bgValue || "" : ""} className="w-full rounded bg-white/5 px-3 py-2" />
              <input type="hidden" name="bgKind" value={me.bgKind === "color" ? "color" : "image"} />
              <p className="text-xs text-white/50 mt-1">ถ้าอัปภาพ จะบันทึกเป็นชนิด image อัตโนมัติ</p>
            </div>
          </div>
        </section>

        {/* Favorite ship */}
        <section className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <label className="block text-sm mb-1">Favorite ship</label>
            <select name="favoriteShipCode" defaultValue={me.favoriteShipCode || ""} className="w-full rounded bg-white/5 px-3 py-2">
              <option value="">—</option>
              {FAVORITE_SHIPS.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-white/50 mt-1">รูปเราจะใส่ให้เอง ไม่ต้องกรอก URL</p>
          </div>
        </section>

        {/* Music */}
        <section className="rounded-xl bg-white/5 p-4 space-y-3">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="musicEnabled" defaultChecked={!!me.musicEnabled} />
            <span>Enable music</span>
          </label>
          <div>
            <label className="block text-sm mb-1">Music embed URL</label>
            <input
              name="musicEmbedUrl"
              defaultValue={me.musicEmbedUrl || ""}
              placeholder="เช่น ลิงก์ embed จาก Spotify/YouTube"
              className="w-full rounded bg-white/5 px-3 py-2"
            />
            <p className="text-xs text-white/50 mt-1">อยากทำเป็น “กล่องค้นหาเพลง” จริง ๆ ได้—ค่อยต่อ API ภายหลัง</p>
          </div>
        </section>

        {/* Gallery (5 รูป) */}
        <section className="space-y-2">
          <h2 className="font-semibold">Game Gallery (5 รูป)</h2>
          <div className="grid md:grid-cols-5 gap-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <input type="file" name={`galleryFile_${i}`} accept="image/*" className="block w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-3 file:py-2" />
              </div>
            ))}
          </div>
          {me.gallery?.length ? (
            <div className="grid grid-cols-5 gap-2">
              {me.gallery.map((g) => (
                <img key={g.id} src={g.url} className="aspect-square w-full rounded object-cover" alt="" />
              ))}
            </div>
          ) : null}
        </section>

        {/* Social links (10 ลิงก์) */}
        <section className="space-y-2">
          <h2 className="font-semibold">Social Links (สูงสุด 10)</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {Array.from({ length: 10 }).map((_, i) => {
              const existing = me.socials?.[i];
              return (
                <div key={i} className="grid grid-cols-5 gap-2">
                  <input
                    name={`socialLabel_${i}`}
                    placeholder="Label"
                    defaultValue={existing?.displayName || ""}
                    className="col-span-2 rounded bg-white/5 px-3 py-2"
                  />
                  <input
                    name={`socialUrl_${i}`}
                    placeholder="https://..."
                    defaultValue={existing?.url || ""}
                    className="col-span-3 rounded bg-white/5 px-3 py-2"
                  />
                </div>
              );
            })}
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button type="submit" className="rounded-lg bg-cyan-500 px-4 py-2 text-black font-semibold hover:bg-cyan-400">
            Save changes
          </button>
          <a href={`/${me.handle}`} className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20">
            Cancel
          </a>
        </div>
      </form>
    </main>
  );
}