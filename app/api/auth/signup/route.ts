import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(req: Request){
  try {
    const body = await req.json().catch(() => ({}));
    const { gameId, handle, level, email, password } = body as any;

    if (!handle || !email || !password) {
      return new Response("Missing fields", { status: 400 });
    }

    const normHandle = String(handle).toLowerCase().trim();
    const normEmail  = String(email).toLowerCase().trim();
    const lvl = Number(level || 1);

    const exist = await prisma.user.findFirst({
      where: { OR: [{ email: normEmail }, { handle: normHandle }] }
    });
    if (exist) return new Response("Email or handle already exists", { status: 409 });

    const u = await prisma.user.create({
      data: {
        email: normEmail,
        passwordHash: await hash(password, 10),
        provider: "credentials",
        handle: normHandle,
        displayName: handle,
        gameId: gameId ? String(gameId) : null,
        level: Number.isFinite(lvl) ? lvl : 1,
      },
      select: { id: true }
    });

    return Response.json({ ok: true, id: u.id });
  } catch (e:any) {
    // 👇 ให้เห็น error จริงใน Vercel Logs
    console.error("SIGNUP ERROR:", e?.message || e, e?.stack);
    return new Response(`SIGNUP ERROR: ${e?.message || "Unknown error"}`, { status: 500 });
  }
}