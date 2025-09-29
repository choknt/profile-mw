import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export default async function GrantsPage() {
  await requireAdmin();

  const [statuses, frames, effects] = await Promise.all([
    prisma.refStatus.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.refFrame.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.refEffect.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Grant Catalog</h1>

      <section className="grid gap-6 md:grid-cols-3">
        <div>
          <h2 className="mb-2 font-semibold">Statuses</h2>
          <ul className="space-y-1 text-sm text-white/80">
            {statuses.map((s) => (
              <li key={s.key}>
                <span className="font-medium">{s.key}</span> — {s.label}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-2 font-semibold">Frames</h2>
          <ul className="space-y-1 text-sm text-white/80">
            {frames.map((f) => (
              <li key={f.key}>
                <span className="font-medium">{f.key}</span> — {f.label}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-2 font-semibold">Effects</h2>
          <ul className="space-y-1 text-sm text-white/80">
            {effects.map((e) => (
              <li key={e.key}>
                <span className="font-medium">{e.key}</span> — {e.label}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}