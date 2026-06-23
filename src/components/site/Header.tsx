import Link from "next/link";
import { getNav, getSettings } from "@/lib/site";
import { Logo } from "@/components/site/Logo";

export async function SiteHeader() {
  const [settings, nav] = await Promise.all([getSettings(), getNav("HEADER")]);

  return (
    <header className="sticky top-0 z-50 border-b border-line backdrop-blur-xl bg-[color-mix(in_oklab,var(--bg)_80%,transparent)]">
      <div className="container-x flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Logo settings={settings} />
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm text-muted">
          {nav.map((item) => (
            <Link
              key={item.id}
              href={item.url}
              target={item.openInNew ? "_blank" : undefined}
              className="hover:text-fg transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/contact" className="btn btn-primary">
            Start a project
          </Link>
        </div>

        {/* Mobile menu — pure CSS disclosure, no client JS needed */}
        <details className="md:hidden relative">
          <summary className="list-none cursor-pointer p-2 -mr-2 [&::-webkit-details-marker]:hidden">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </summary>
          <div className="absolute right-0 mt-3 w-60 card p-3 flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                target={item.openInNew ? "_blank" : undefined}
                className="px-3 py-2 rounded-lg text-sm text-muted hover:text-fg hover:bg-[var(--card)]"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/contact" className="btn btn-primary mt-2">
              Start a project
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}
