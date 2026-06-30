"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

export type NavItem = { href: string; label: string; icon: string };

export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {items.map((it) => {
        const active = it.href === "/admin" ? pathname === "/admin" : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              active ? "bg-[var(--card)] text-fg font-medium" : "text-muted hover:text-fg hover:bg-[var(--card)]"
            }`}
          >
            <Icon name={it.icon} size={17} />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
