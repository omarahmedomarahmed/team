import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PagesList() {
  const pages = await prisma.page.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { sections: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pages</h1>
          <p className="text-muted text-sm mt-1">{pages.length} pages — each is a stack of sections you control.</p>
        </div>
        <Link href="/god/pages/new" className="btn btn-primary">New page</Link>
      </div>

      <div className="card divide-y divide-line">
        {pages.map((p) => (
          <Link key={p.id} href={`/god/pages/${p.id}`} className="flex items-center gap-4 p-4 hover:bg-[var(--card)] transition-colors">
            <div className="min-w-0">
              <div className="text-sm font-medium flex items-center gap-2">
                {p.title}
                {p.isHome ? <span className="chip text-[0.65rem] py-0 px-2">Home</span> : null}
              </div>
              <div className="text-xs text-muted">
                /{p.slug === "home" ? "" : p.slug} · {p._count.sections} sections
              </div>
            </div>
            <span
              className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${
                p.status === "PUBLISHED" ? "text-emerald-400 border-emerald-400/30" : "text-amber-400 border-amber-400/30"
              }`}
            >
              {p.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
