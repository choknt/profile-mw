import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

export default async function RefsPage() {
  await requireAdmin();

  const [statuses, frames, effects] = await Promise.all([
    prisma.refStatus.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.refFrame.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.refEffect.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-2">Statuses</h2>
        <ul className="space-y-2">
          {statuses.map(s => (
            <li key={s.key} className="rounded bg-white/5 px-3 py-2">
              <div className="font-medium">{s.label}</div>
              <div className="text-xs text-white/60">key: {s.key}</div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Frames</h2>
        <ul className="space-y-2">
          {frames.map(f => (
            <li key={f.key} className="rounded bg-white/5 px-3 py-2">
              <div className="font-medium">{f.label}</div>
              <div className="text-xs text-white/60">key: {f.key} {f.rarity ? `· ${f.rarity}` : ""}</div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Effects</h2>
        <ul className="space-y-2">
          {effects.map(e => (
            <li key={e.key} className="rounded bg-white/5 px-3 py-2">
              <div className="font-medium">{e.label}</div>
              <div className="text-xs text-white/60">key: {e.key} {e.rarity ? `· ${e.rarity}` : ""}</div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}