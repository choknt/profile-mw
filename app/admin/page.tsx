import { requireAdmin } from "@/lib/guards";

export default async function AdminPage(){
  await requireAdmin();
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Admin</h1>
      <div className="flex flex-wrap gap-2">
        <a className="rounded bg-white/10 px-3 py-2 hover:bg-white/20" href="/admin/grants">Grants</a>
        <a className="rounded bg-white/10 px-3 py-2 hover:bg-white/20" href="/admin/refs">References</a>
        <a className="rounded bg-white/10 px-3 py-2 hover:bg-white/20" href="/admin/reports">Reports</a>
      </div>
    </main>
  );
}
