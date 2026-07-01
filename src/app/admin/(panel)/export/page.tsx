import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Read-only snapshot of everything currently in the database. Lives behind the
// admin login, so it is private. Image fields show their /api/media/… URLs (the
// actual image bytes are never included). Handy as a backup and to share the
// exact current state.
export default async function ExportPage() {
  const [settings, experiences, timeline, projects, pages, nav, media] = await Promise.all([
    prisma.siteSettings.findFirst(),
    prisma.experience.findMany({ orderBy: { order: "asc" } }),
    prisma.timelineYear.findMany({ orderBy: { order: "asc" } }),
    prisma.project.findMany({ orderBy: { order: "asc" } }),
    prisma.page.findMany({ include: { sections: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } }),
    prisma.navItem.findMany({ orderBy: { order: "asc" } }),
    prisma.mediaAsset.findMany({
      select: { id: true, filename: true, mimeType: true, size: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const dump = {
    settings,
    experiences,
    timeline,
    projects,
    pages: pages.map((p) => ({
      slug: p.slug,
      title: p.title,
      isHome: p.isHome,
      status: p.status,
      sections: p.sections.map((s) => ({
        type: s.type,
        enabled: s.enabled,
        order: s.order,
        bgImageUrl: s.bgImageUrl,
        data: s.data,
      })),
    })),
    nav,
    media: { count: media.length, items: media },
  };

  const json = JSON.stringify(dump, null, 2);

  return (
    <div className="max-w-4xl space-y-4">
      <h1 className="text-2xl font-bold">Export / snapshot</h1>
      <p className="text-sm text-muted">
        A read-only snapshot of everything currently in your database. Click inside the box, select all
        (Ctrl/Cmd+A), copy, and paste it wherever you need — including to share your exact current content.
        Uploaded images appear as <span className="font-mono">/api/media/…</span> URLs; the image files
        themselves are never included here.
      </p>
      <div className="text-xs text-muted">
        {experiences.length} experiences · {timeline.length} timeline years · {projects.length} portfolio items ·{" "}
        {media.length} uploaded images
      </div>
      <textarea
        readOnly
        value={json}
        rows={28}
        className="w-full rounded-lg border border-line bg-[var(--card)] p-4 font-mono text-xs"
      />
    </div>
  );
}
