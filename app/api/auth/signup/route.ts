export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    // ป้องกัน JSON พัง/อ่าน body ไม่ได้
    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response("Invalid JSON body", { status: 400 });
    }

    const rawEmail = String(body?.email || "").trim().toLowerCase();
    const rawHandle = String(body?.handle || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const gameId = body?.gameId ? String(body.gameId).trim() : null;
    const level = body?.level ? Number(body.level) : 1;

    if (!rawHandle || !rawEmail || !password) {
      return new Response("Missing fields", { status: 400 });
    }

    // ตรวจ ENV สำคัญก่อน (ช่วยจับ 500 แบบง่ายๆ)
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL is missing");
      return new Response("Server misconfigured (DB URL)", { status: 500 });
    }

    // ตรวจซ้ำ email/handle
    const exist = await prisma.user.findFirst({
      where: { OR: [{ email: rawEmail }, { handle: rawHandle }] },
      select: { id: true }
    });
    if (exist) {
      return new Response("Email or handle already exists", { status: 409 });
    }

    const passwordHash = await hash(password, 10);

    const u = await prisma.user.create({
      data: {
        email: rawEmail,
        passwordHash,
        provider: "credentials",
        handle: rawHandle,
        displayName: body?.handle || rawHandle,
        gameId,
        level: Number.isFinite(level) && level > 0 ? level : 1
      },
      select: { id: true }
    });

    return Response.json({ ok: true, id: u.id });
  } catch (err: any) {
    // Log แบบปลอดภัย
    console.error("SIGNUP ERROR:", err?.message || err);
    return new Response("Internal Server Error", { status: 500 });
  }
}