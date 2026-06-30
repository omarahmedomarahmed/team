import Link from "next/link";
import { prisma } from "@/lib/db";
import { Icon } from "@/components/ui/Icon";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [services, projects, team, testimonials, leadsTotal, newLeads, posts] = await Promise.all([
    prisma.service.count(),
    prisma.project.count(),
    prisma.teamMember.count(),
    prisma.testimonial.count(),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.post.count(),
  ]);
  const recentLeads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 });

  const stats = [
    { label: "Services", value: services, href: "/admin/services", icon: "settings" },
    { label: "Portfolio", value: projects, href: "/admin/projects", icon: "presentation" },
    { label: "Team", value: team, href: "/admin/team", icon: "briefcase" },
    { label: "Testimonials", value: testimonials, href: "/admin/testimonials", icon: "star" },
    { label: "Blog posts", value: posts, href: "/admin/posts", icon: "pen-tool" },
    { label: "Leads", value: leadsTotal, href: "/admin/leads", icon: "mail" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted text-sm mt-1">Everything on your site is editable here — no developer required.</p>
      </div>

      {newLeads > 0 ? (
        <Link href="/admin/leads" className="card card-hover p-4 flex items-center gap-3">
          <span className="icon-badge"><Icon name="mail" size={18} /></span>
          <span className="text-sm">
            You have <strong>{newLeads}</strong> new lead{newLeads > 1 ? "s" : ""} to review.
          </span>
          <span className="ml-auto text-brand text-sm">View →</span>
        </Link>
      ) : null}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card card-hover p-5 group">
            <span className="icon-badge"><Icon name={s.icon} size={18} /></span>
            <div className="mt-4 text-3xl font-bold">{s.value}</div>
            <div className="text-sm text-muted">{s.label}</div>
          </Link>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Recent leads</h2>
          <Link href="/admin/leads" className="text-sm text-brand">View all</Link>
        </div>
        <div className="card divide-y divide-line">
          {recentLeads.length === 0 ? (
            <p className="p-5 text-sm text-muted">No leads yet.</p>
          ) : (
            recentLeads.map((l) => (
              <Link key={l.id} href={`/admin/leads/${l.id}`} className="flex items-center gap-4 p-4 hover:bg-[var(--card)] transition-colors">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{l.name || l.email || "Unknown"}</div>
                  <div className="text-xs text-muted truncate">{l.message}</div>
                </div>
                <span className="ml-auto text-xs text-muted whitespace-nowrap">
                  {new Date(l.createdAt).toLocaleDateString()}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
