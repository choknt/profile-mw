// app/admin/reports/page.tsx
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards"; 

export default async function ReportsPage() {
  await requireAdmin();

  const reports = await prisma.report.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
    include: {
      reporter: { select: { handle: true, displayName: true } },
      target:   { select: { handle: true, displayName: true } },
    },
  });

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Reports</h1>
      <ul className="space-y-3">
        {reports.map((r) => (
          <li key={r.id} className="rounded-xl bg-white/5 p-4">
            <div className="text-sm text-white/60">
              Status: {r.status} · {new Date(r.createdAt).toLocaleString()}
            </div>

            <div className="mt-1 text-white/80 text-sm">
              Reporter: <span className="font-medium">
                {r.reporter?.displayName || r.reporter?.handle || "-"}
              </span>
            </div>

            <div className="text-white/80 text-sm">
              Target: <span className="font-medium">
                {r.target?.displayName || r.target?.handle || r.targetHandle || "-"}
              </span>
            </div>

            <div className="mt-2">
              Reason: {r.reason || "(no reason)"}
            </div>

            <div className="mt-3 flex gap-2">
              {/* ปุ่มตัวอย่าง จัดการสถานะ */}
              <form action={`/api/admin/reports/${r.id}/review`} method="post">
                <button className="rounded bg-emerald-500/20 px-3 py-1 text-sm hover:bg-emerald-500/30">
                  Mark Reviewed
                </button>
              </form>
              <form action={`/api/admin/reports/${r.id}/dismiss`} method="post">
                <button className="rounded bg-rose-500/20 px-3 py-1 text-sm hover:bg-rose-500/30">
                  Dismiss
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}