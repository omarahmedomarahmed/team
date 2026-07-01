"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

// Client nav so the current page is highlighted. Items come from the DB (getNav),
// so the menu stays fully editable in the admin — this only changes presentation.
type Child = { id: string; label: string; url: string; openInNew?: boolean };
type Item = Child & { children?: Child[] };

function isActive(pathname: string, url: string) {
  if (!url.startsWith("/")) return false; // external links are never "current"
  if (url === "/") return pathname === "/";
  return pathname === url || pathname.startsWith(`${url}/`);
}

export function HeaderNav({ items }: { items: Item[] }) {
  const pathname = usePathname() || "/";

  return (
    <nav className="hidden md:flex items-center gap-1 text-sm">
      {items.map((item) => {
        const active =
          isActive(pathname, item.url) || (item.children?.some((c) => isActive(pathname, c.url)) ?? false);
        const base =
          "inline-flex items-center gap-1 rounded-full px-3.5 py-2 transition-colors";
        const cls = active
          ? `${base} bg-bg-2 text-fg font-medium`
          : `${base} text-muted hover:text-fg hover:bg-bg-2`;

        if (item.children && item.children.length) {
          return (
            <div key={item.id} className="group relative">
              <Link href={item.url} className={cls}>
                {item.label}
                <Icon name="arrow-down" size={14} className="transition-transform group-hover:rotate-180" />
              </Link>
              <div className="invisible absolute left-0 top-full z-50 w-64 pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
                <div className="card p-2">
                  {item.children.map((c) => (
                    <Link
                      key={c.id}
                      href={c.url}
                      target={c.openInNew ? "_blank" : undefined}
                      className={`block rounded-[var(--radius)] px-3 py-2 text-sm transition-colors ${
                        isActive(pathname, c.url) ? "bg-bg-2 text-fg" : "text-muted hover:bg-bg-2 hover:text-fg"
                      }`}
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        }

        return (
          <Link key={item.id} href={item.url} target={item.openInNew ? "_blank" : undefined} className={cls}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
