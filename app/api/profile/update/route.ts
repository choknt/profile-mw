import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const meId = (session as any).uid;
  if (!meId) return new Response("Unauthorized", { status: 401 });

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const allowKeys = [
    "displayName", "nickname", "bio",
    "countryCode",
    "gameId", "level",
    "avatarUrl",
    "frameKey", "effectKey",
    "bgKind", "bgValue",
    "statusKey",
    "favoriteShipName", "favoriteShipCode", "favoriteShipImage",
    "musicEnabled", "musicTrackId", "musicEmbedUrl",
    "showClan", "clanId", "clanTag"
  ] as const;

  const data: Record<string, any> = {};
  for (const k of allowKeys) {
    if (k in body) data[k] = body[k];
  }

  if ("level" in data) {
    const n = Number(data.level);
    data.level = Number.isFinite(n) ? n : null;
  }

  if ("musicEnabled" in data) {
    data.musicEnabled = !!data.musicEnabled;
  }
  if ("showClan" in data) {
    data.showClan = !!data.showClan;
  }

  await prisma.user.update({
    where: { id: meId },
    data,
  });

  return new Response(null, { status: 204 });
}