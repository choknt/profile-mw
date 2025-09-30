import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

export default async function GrantsPage() {
  await requireAdmin();
  const [statuses, frames, effects] = await Promise.all([
    prisma.refStatus.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.refFrame.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.refEffect.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <section>
        <h2 className="text-lg font-semibold mb-2">Grant Status</h2>
        <form action="/api/admin/grant/status" method="post" className="space-y-2">
          <input name="handle" placeholder="handle" className="w-full rounded bg-white/5 px-3 py-2" />
          <select name="statusKey" className="w-full rounded bg-white/5 px-3 py-2">
            {statuses.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <button className="rounded bg-cyan-600 px-3 py-2">Grant</button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Grant Cosmetic (Frame/Effect)</h2>
        <form action="/api/admin/grant/cosmetic" method="post" className="space-y-2">
          <input name="handle" placeholder="handle" className="w-full rounded bg-white/5 px-3 py-2" />
          <select name="frameKey" className="w-full rounded bg-white/5 px-3 py-2">
            <option value="">(no frame)</option>
            {frames.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
          </select>
          <select name="effectKey" className="w-full rounded bg-white/5 px-3 py-2">
            <option value="">(no effect)</option>
            {effects.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
          </select>
          <button className="rounded bg-cyan-600 px-3 py-2">Grant</button>
        </form>
      </section>
    </main>
  );
}