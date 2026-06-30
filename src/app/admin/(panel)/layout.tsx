import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/lib/admin/actions";
import { NavLinks, type NavItem } from "@/components/admin/NavLinks";
import { RESOURCES } from "@/lib/admin/resources";
import { Icon } from "@/components/ui/Icon";

const DASHBOARD: NavItem[] = [{ href: "/admin", label: "Dashboard", icon: "bar-chart" }];

const WEBSITE: NavItem[] = [
  { href: "/admin/pages", label: "Pages & sections", icon: "monitor" },
  { href: "/admin/navigation", label: "Menu links", icon: "workflow" },
  { href: "/admin/settings", label: "Brand & settings", icon: "settings" },
];

const CONTENT_KEYS = ["experience", "projects", "timeline", "posts"];

const BUSINESS: NavItem[] = [
  { href: "/admin/leads", label: "Leads", icon: "mail" },
  { href: "/admin/modules", label: "Features on/off", icon: "zap" },
];

function Group({ title, items }: { title?: string; items: NavItem[] }) {
  return (
    <div>
      {title ? <p className="px-3 text-[0.7rem] uppercase tracking-wider text-muted mb-2">{title}</p> : null}
      <NavLinks items={items} />
    </div>
  );
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const content: NavItem[] = CONTENT_KEYS.map((k) => RESOURCES[k]).filter(Boolean).map((r) => ({
    href: `/admin/${r.key}`,
    label: r.label,
    icon: r.icon,
  }));

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[260px_1fr]">
      <aside className="hidden md:flex flex-col border-r border-line p-4 gap-6 sticky top-0 h-screen overflow-y-auto">
        <Link href="/admin" className="flex items-center gap-2.5 px-2">
          <span className="inline-block h-7 w-7 rounded-[var(--radius)] bg-brand" />
          <span className="font-semibold tracking-tight">Admin</span>
        </Link>

        <div className="flex-1 space-y-6">
          <Group items={DASHBOARD} />
          <Group title="Your website" items={WEBSITE} />
          <Group title="Content" items={content} />
          <Group title="Business" items={BUSINESS} />
        </div>

        <div className="border-t border-line pt-4">
          <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted hover:text-fg hover:bg-[var(--card)]">
            <Icon name="arrow-up-right" size={16} /> View site
          </Link>
          <form action={logoutAction}>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted hover:text-fg hover:bg-[var(--card)]">
              <Icon name="x" size={16} /> Sign out
            </button>
          </form>
          <p className="px-3 mt-2 text-xs text-muted truncate">{user.email}</p>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="md:hidden flex items-center justify-between border-b border-line p-4">
          <Link href="/admin" className="font-semibold">Admin</Link>
          <form action={logoutAction}>
            <button className="text-sm text-muted">Sign out</button>
          </form>
        </div>
        <div className="p-5 md:p-8 max-w-6xl">{children}</div>
      </div>
    </div>
  );
}
