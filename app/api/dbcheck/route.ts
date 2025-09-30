import { prisma } from "@/lib/prisma";
export async function GET() {
  try {
    const r = await prisma.$queryRaw`SELECT NOW() as now`;
    return Response.json({ ok: true, r });
  } catch (e:any) {
    console.error("DBCHECK ERROR:", e?.message || e);
    return new Response(`DBCHECK ERROR: ${e?.message || e}`, { status: 500 });
  }
}