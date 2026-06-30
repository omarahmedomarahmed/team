import Link from "next/link";
import { getNav, getSettings } from "@/lib/site";
import { Logo } from "@/components/site/Logo";
import { Icon } from "@/components/ui/Icon";

export async function SiteHeader() {
  const [settings, nav] = await Promise.all([getSettings(), getNav("HEADER")]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg">
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
          <Link href="/#contact" className="btn btn-primary">
            Get in touch
          </Link>
        </div>

        {/* Mobile menu — pure CSS disclosure, no client JS needed */}
        <details className="md:hidden relative">
          <summary className="list-none cursor-pointer p-2 -mr-2 [&::-webkit-details-marker]:hidden">
            <Icon name="menu" size={22} />
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
            <Link href="/#contact" className="btn btn-primary mt-2">
              Get in touch
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}
