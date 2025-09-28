import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export default async function ReportsPage() {
  await requireAdmin();
  const reports = await prisma.report.findMany({ where: { status: "pending" }, orderBy: { createdAt: "desc" } });

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Admin · Reports</h1>
      {reports.length === 0 && <div className="text-white/70">No pending reports.</div>}
      <ul className="space-y-3">
        {reports.map(r => (
          <li key={r.id} className="rounded-xl bg-white/5 p-4">
            <div className="text-sm text-white/60">Type: {r.type} · {new Date(r.createdAt).toLocaleString()}</div>
            <div className="mt-1">Reason: {r.reason}</div>
            {r.imageUrl && (
              <div className="mt-2">
                <img src={r.imageUrl} className="w-40 h-40 object-cover rounded"/>
                <div className="text-xs text-white/60 break-all mt-1">{r.imagePublicId || "(no publicId)"}</div>
              </div>
            )}
            <form action={`/api/admin/reports/${r.id}/approve`} method="POST" className="mt-3 inline-block">
              <button className="rounded bg-rose-600 px-3 py-1">Remove content</button>
            </form>
            <form action={`/api/admin/reports/${r.id}/reject`} method="POST" className="mt-3 inline-block ml-2">
              <button className="rounded bg-white/15 px-3 py-1 hover:bg-white/25">Dismiss</button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
