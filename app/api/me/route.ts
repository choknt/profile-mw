import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(){
  const session = await getServerSession(authOptions);
  if(!session) return new Response("Unauthorized",{status:401});
  const me = await prisma.user.findUnique({
    where: { id: (session as any).uid },
    include: { socials: true, gallery: true }
  });
  return Response.json(me);
}
