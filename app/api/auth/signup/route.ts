import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(req: Request){
  const { gameId, handle, level, email, password } = await req.json();
  if(!handle || !email || !password) return new Response("Missing fields", { status:400 });

  const exist = await prisma.user.findFirst({ where: { OR: [{ email }, { handle: handle.toLowerCase() }] } });
  if(exist) return new Response("Email or handle already exists", { status:409 });

  const u = await prisma.user.create({
    data: {
      email, passwordHash: await hash(password, 10), provider: "credentials",
      handle: handle.toLowerCase(), displayName: handle,
      gameId, level: Number(level||1)
    }
  });
  return Response.json({ ok:true, id: u.id });
}
