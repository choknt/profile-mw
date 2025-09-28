import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseSocial } from "@/lib/social";

export async function POST(req: Request){
  const session = await getServerSession(authOptions);
  if(!session) return new Response("Unauthorized",{status:401});
  const b=await req.json();
  const u = await prisma.user.findUnique({ where: { id: (session as any).uid }, include:{ socials:true } });
  if(!u) return new Response("Not found",{status:404});

  const now = Date.now(); const FIFTEEN=15*24*60*60*1000;
  const canChange = (d?:Date|null)=> !d || (now - new Date(d).getTime() > FIFTEEN);

  const data:any = {};
  if(b.displayName && b.displayName!==u.displayName){
    if(!canChange(u.displayNameChangedAt)) return new Response("Display name can be changed every 15 days.",{status:400});
    data.displayName = b.displayName; data.displayNameChangedAt = new Date();
  }
  if(b.handle && b.handle!==u.handle){
    if(!canChange(u.handleChangedAt)) return new Response("Handle can be changed every 15 days.",{status:400});
    data.handle = b.handle.toLowerCase(); data.handleChangedAt = new Date();
  }
  if(b.bio){ const words=b.bio.trim().split(/\s+/).filter(Boolean).length; if(words>250) return new Response("Bio must be ≤ 250 words.",{status:400}); data.bio=b.bio; }
  if(b.status) data.statusKey = b.status;
  if(b.country) data.countryCode = b.country;
  if(b.music) { data.musicEnabled=!!b.music?.trackId; data.musicTrackId=b.music?.trackId||null; data.musicEmbedUrl=b.music?.embedUrl||null; }
  if(b.favoriteShip){ data.favoriteShipName=b.favoriteShip.name; data.favoriteShipCode=b.favoriteShip.code||null; data.favoriteShipImage=b.favoriteShip.imageUrl||null; }
  if(b.background){ data.bgKind=b.background.kind; data.bgValue=b.background.value; }
  if(b.frame) data.frameKey = b.frame.key || null;
  if(b.effect) data.effectKey = b.effect.key || null;
  if(b.avatarUrl) data.avatarUrl = b.avatarUrl;
  if(b.privacy?.showClan !== undefined) data.showClan = !!b.privacy.showClan;

  await prisma.$transaction(async(tx)=>{
    await tx.user.update({ where:{ id:u.id }, data });
    if(Array.isArray(b.socials)){
      await tx.socialLink.deleteMany({ where: { userId: u.id } });
      const socials = b.socials.slice(0,10).map((x:any)=>parseSocial(x.url||x));
      await tx.socialLink.createMany({ data: socials.map(s=>({ userId: u.id, provider:s.provider, label:s.label, url:s.url })) });
    }
    if(Array.isArray(b.gallery)){
      await tx.galleryImage.deleteMany({ where: { userId: u.id } });
      await tx.galleryImage.createMany({ data: b.gallery.map((url:string)=>({ userId: u.id, url })) });
    }
  });

  return Response.json({ok:true});
}
