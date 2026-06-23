import { prisma } from "@/lib/db";
import { saveModulesAction } from "@/lib/god/actions";

export const dynamic = "force-dynamic";

export default async function ModulesPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const sp = await searchParams;
  const modules = await prisma.module.findMany({ orderBy: { order: "asc" } });

  return (
    <form action={saveModulesAction} className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Modules</h1>
          <p className="text-muted text-sm mt-1">
            Turn features on or off. Disabled modules disappear from the site and this admin — this is how the
            platform is tailored per client.
          </p>
        </div>
        <button type="submit" className="btn btn-primary">Save</button>
      </div>
      {sp.saved ? <p className="text-sm text-emerald-400">Saved.</p> : null}

      <div className="card divide-y divide-line">
        {modules.map((m) => (
          <label key={m.id} className="flex items-center justify-between gap-4 p-4 cursor-pointer hover:bg-[var(--card)]">
            <div>
              <div className="text-sm font-medium">{m.label}</div>
              <div className="text-xs text-muted">{m.key}</div>
            </div>
            <input
              type="checkbox"
              name={`mod_${m.key}`}
              defaultChecked={m.enabled}
              className="h-5 w-5 accent-[var(--brand)]"
            />
          </label>
        ))}
      </div>
      <button type="submit" className="btn btn-primary">Save</button>
    </form>
  );
}
