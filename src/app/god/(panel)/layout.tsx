import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/lib/god/actions";
import { NavLinks, type NavItem } from "@/components/god/NavLinks";
import { RESOURCE_LIST } from "@/lib/god/resources";
import { Icon } from "@/components/ui/Icon";

const TOP: NavItem[] = [
  { href: "/god", label: "Dashboard", icon: "bar-chart" },
  { href: "/god/pages", label: "Pages", icon: "monitor" },
];
const BOTTOM: NavItem[] = [
  { href: "/god/modules", label: "Modules", icon: "zap" },
  { href: "/god/settings", label: "Settings", icon: "settings" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/god/login");

  const resourceNav: NavItem[] = RESOURCE_LIST.map((r) => ({
    href: `/god/${r.key}`,
    label: r.label,
    icon: r.icon,
  }));

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[260px_1fr]">
      <aside className="hidden md:flex flex-col border-r border-line p-4 gap-6 sticky top-0 h-screen overflow-y-auto">
        <Link href="/god" className="flex items-center gap-2.5 px-2">
          <span className="inline-block h-7 w-7 rounded-lg bg-gradient-to-br from-brand to-accent" />
          <span className="font-semibold tracking-tight">God Mode</span>
        </Link>

        <div className="flex-1 space-y-6">
          <NavLinks items={TOP} />
          <div>
            <p className="px-3 text-[0.7rem] uppercase tracking-wider text-muted mb-2">Content</p>
            <NavLinks items={resourceNav} />
          </div>
          <div>
            <p className="px-3 text-[0.7rem] uppercase tracking-wider text-muted mb-2">Configure</p>
            <NavLinks items={BOTTOM} />
          </div>
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
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between border-b border-line p-4">
          <Link href="/god" className="font-semibold">God Mode</Link>
          <form action={logoutAction}>
            <button className="text-sm text-muted">Sign out</button>
          </form>
        </div>
        <div className="p-5 md:p-8 max-w-6xl">{children}</div>
      </div>
    </div>
  );
}
