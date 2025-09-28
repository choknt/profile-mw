import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export default async function AdminGrantsPage() {
  await requireAdmin();
  const [statuses, frames, effects] = await Promise.all([
    prisma.statusRef.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.frameRef.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.effectRef.findMany({ orderBy: { createdAt: "desc" } })
  ]);

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin · Grants</h1>

      <section className="rounded-xl bg-white/5 p-4 space-y-3">
        <h2 className="font-semibold">Grant Roles</h2>
        <form action="/api/admin/grant/roles" method="POST" className="space-y-2">
          <input name="handle" placeholder="user handle (e.g., chok)" className="w-full rounded bg-black/20 border border-white/20 px-3 py-2"/>
          <div className="flex gap-3">
            <label className="flex items-center gap-2"><input type="checkbox" name="staff"/> Staff</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="legend"/> Legend</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="hero"/> Hero</label>
          </div>
          <button className="rounded bg-cyan-500 px-4 py-2">Apply</button>
        </form>
      </section>

      <section className="rounded-xl bg-white/5 p-4 space-y-3">
        <h2 className="font-semibold">Grant Status</h2>
        <form action="/api/admin/grant/status" method="POST" className="space-y-2">
          <input name="handle" placeholder="user handle" className="w-full rounded bg-black/20 border border-white/20 px-3 py-2"/>
          <select name="statusKey" className="w-full rounded bg-black/20 border border-white/20 px-3 py-2">
            <option value="">-- Select --</option>
            {statuses.map(s=><option key={s.id} value={s.key}>{s.label}</option>)}
          </select>
          <button className="rounded bg-cyan-500 px-4 py-2">Grant</button>
        </form>
      </section>

      <section className="rounded-xl bg-white/5 p-4 space-y-3">
        <h2 className="font-semibold">Grant Frame / Effect</h2>
        <form action="/api/admin/grant/cosmetic" method="POST" className="space-y-2">
          <input name="handle" placeholder="user handle" className="w-full rounded bg-black/20 border border-white/20 px-3 py-2"/>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <div className="text-sm mb-1">Frame</div>
              <select name="frameKey" className="w-full rounded bg-black/20 border border-white/20 px-3 py-2">
                <option value="">(no change)</option>
                {frames.map(f=><option key={f.id} value={f.key}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <div className="text-sm mb-1">Effect</div>
              <select name="effectKey" className="w-full rounded bg-black/20 border border-white/20 px-3 py-2">
                <option value="">(no change)</option>
                {effects.map(e=><option key={e.id} value={e.key}>{e.label}</option>)}
              </select>
            </div>
          </div>
          <button className="rounded bg-cyan-500 px-4 py-2">Apply</button>
        </form>
      </section>
    </main>
  );
}
