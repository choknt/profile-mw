import { prisma } from "@/lib/prisma";
import LikeButton from "@/components/LikeButton";

function flagEmoji(code?:string){ if(!code) return ""; const A=127397; return String.fromCodePoint(...[...(code||"").toUpperCase()].map(c=>A+c.charCodeAt(0))); }

export default async function PublicProfile({ params }:{ params:{ handle:string } }) {
  const u = await prisma.user.findUnique({
    where: { handle: params.handle.toLowerCase() },
    include: { gallery: true, socials: true }
  });
  if(!u) return <main className="p-6">Profile not found</main>;

  const likeCount = await prisma.like.count({ where: { targetUserId: u.id } });

  return (
    <main className={u.bgKind==="color" && u.bgValue==="ocean" ? "bg-ocean" : "bg-ocean"}>
      <div className="scrim">
        <div className="mx-auto max-w-6xl p-6">
          <section className="grid gap-8 md:grid-cols-2">
            {/* Left */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold">{u.displayName || u.handle}</h1>
                <span className="text-2xl">{flagEmoji(u.countryCode||"")}</span>
                {u.roleStaff && (
                  <span className="inline-flex items-center gap-1 rounded bg-cyan-500/20 px-2 py-0.5 text-[11px] text-cyan-300">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><path d="M12 2l3 6 6 .9-4.5 4.3 1.1 6.3L12 16.9 6.4 19.5 7.5 13 3 8.9 9 8z" fill="currentColor"/></svg>
                    Staff
                  </span>
                )}
                <span className="text-white/60">#{u.accountOrder}</span>
              </div>
              {u.nickname && <div className="text-cyan-300">{u.nickname}</div>}
              <div className="text-sm text-white/70">ID / Invite: {u.inviteCode || "-"}</div>
              {u.roleStaff && (<div className="text-sm text-white/80">staff playmw.fun · support playmw.fun / modern warships game staff</div>)}
              {u.bio && <p className="text-white/85">{u.bio}</p>}
              {u.musicEnabled && u.musicEmbedUrl && (
                <div className="mt-2"><iframe src={u.musicEmbedUrl} width="100%" height="152" frameBorder="0" allow="autoplay; encrypted-media" className="rounded-lg"/></div>
              )}
              <div className="flex flex-wrap gap-2">
                {(u.socials||[]).map((s)=>(
                  <a key={s.id} href={s.url} target="_blank" className="rounded bg-white/5 px-3 py-1 text-sm hover:bg-white/10">
                    {s.provider}: <span className="font-medium">{s.label}</span>
                  </a>
                ))}
              </div>
              {u.favoriteShipName && (
                <div>
                  <h3 className="font-semibold mb-2">Favorite Ship</h3>
                  <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                    {u.favoriteShipImage && <img src={u.favoriteShipImage} className="w-16 h-16 rounded object-cover" />}
                    <div className="text-lg font-bold">{u.favoriteShipName}</div>
                  </div>
                </div>
              )}
              <LikeButton handle={u.handle} initialCount={likeCount} />
            </div>

            {/* Right */}
            <div className="space-y-4">
              <div className="relative">
                <img src={u.avatarUrl || "/avatar.png"} className="w-full max-w-md rounded-2xl object-cover mx-auto" />
                {u.roleLegend && <div className="absolute -top-2 -left-2 px-2 py-1 rounded bg-purple-600 text-xs">Legend</div>}
                {u.roleHero &&   <div className="absolute -top-2 -right-2 px-2 py-1 rounded bg-orange-500 text-xs">Hero</div>}
              </div>
              {(u.gallery||[]).length>0 && (
                <div>
                  <h3 className="font-semibold mb-2">Game Gallery</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {u.gallery.map((g)=><img key={g.id} src={g.url} className="aspect-square w-full rounded object-cover" />)}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
