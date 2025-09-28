import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export default async function AdminRefsPage() {
  await requireAdmin();
  const [statuses, frames, effects] = await Promise.all([
    prisma.statusRef.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.frameRef.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.effectRef.findMany({ orderBy: { createdAt: "desc" } })
  ]);

  function Block({ title, type, items }:{ title:string; type:"status"|"frame"|"effect"; items:any[] }) {
    return (
      <section className="rounded-xl bg-white/5 p-4 space-y-3">
        <h2 className="font-semibold">{title}</h2>
        <form action="/api/admin/refs/create" method="POST" className="grid gap-2 sm:grid-cols-4">
          <input type="hidden" name="type" value={type}/>
          <input name="key" placeholder="key (unique)" className="px-3 py-2 rounded bg-black/20 border border-white/20 sm:col-span-1" required/>
          <input name="label" placeholder="label" className="px-3 py-2 rounded bg-black/20 border border-white/20 sm:col-span-1" required/>
          <input name="previewUrl" placeholder="previewUrl (optional)" className="px-3 py-2 rounded bg-black/20 border border-white/20 sm:col-span-1"/>
          <button className="rounded bg-cyan-500 px-3 py-2 sm:col-span-1">Add</button>
        </form>
        <ul className="space-y-2">
          {items.map((it:any)=>(
            <li key={it.id} className="flex items-center justify-between rounded bg-white/5 px-3 py-2">
              <div className="min-w-0">
                <div className="truncate"><span className="text-white/60">{it.key}</span> · <span className="font-medium">{it.label}</span></div>
                {it.previewUrl && <div className="text-xs text-white/50 truncate">{it.previewUrl}</div>}
              </div>
              <div className="flex items-center gap-2">
                <form action="/api/admin/refs/update" method="POST" className="hidden sm:flex gap-2">
                  <input type="hidden" name="type" value={type}/>
                  <input type="hidden" name="id" value={String(it.id)}/>
                  <input name="label" defaultValue={it.label} className="px-2 py-1 rounded bg-black/20 border border-white/20 text-sm"/>
                  <input name="previewUrl" defaultValue={it.previewUrl||""} className="px-2 py-1 rounded bg-black/20 border border-white/20 text-sm" />
                  <button className="rounded bg-amber-500 px-2 py-1 text-sm">Update</button>
                </form>
                <form action="/api/admin/refs/delete" method="POST">
                  <input type="hidden" name="type" value={type}/>
                  <input type="hidden" name="id" value={String(it.id)}/>
                  <button className="rounded bg-rose-600 px-2 py-1 text-sm">Delete</button>
                </form>
              </div>
            </li>
          ))}
          {items.length===0 && <li className="text-white/60">No items.</li>}
        </ul>
      </section>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin · References</h1>
      <Block title="Statuses" type="status" items={statuses}/>
      <Block title="Frames"   type="frame"  items={frames}/>
      <Block title="Effects"  type="effect" items={effects}/>
    </main>
  );
}
