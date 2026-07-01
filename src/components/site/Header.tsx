import Link from "next/link";
import { getNav, getSettings } from "@/lib/site";
import { Logo } from "@/components/site/Logo";
import { HeaderNav } from "@/components/site/HeaderNav";
import { Icon } from "@/components/ui/Icon";

export async function SiteHeader() {
  const [settings, nav] = await Promise.all([getSettings(), getNav("HEADER")]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg">
      <div className="container-x flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Logo settings={settings} />
        </Link>

        <HeaderNav items={nav} />

        <div className="hidden md:flex items-center gap-3">
          <Link href="/contact" className="btn btn-primary group">
            Get in touch
            <Icon name="arrow-right" size={16} className="btn-arrow" />
          </Link>
        </div>

        {/* Mobile menu — pure CSS disclosure, no client JS needed */}
        <details className="md:hidden relative">
          <summary className="list-none cursor-pointer p-2 -mr-2 [&::-webkit-details-marker]:hidden">
            <Icon name="menu" size={22} />
          </summary>
          <div className="absolute right-0 mt-3 flex w-64 flex-col gap-1 card p-3">
            {nav.map((item) => (
              <div key={item.id}>
                <Link
                  href={item.url}
                  target={item.openInNew ? "_blank" : undefined}
                  className="block rounded-[var(--radius)] px-3 py-2 text-sm text-fg hover:bg-bg-2"
                >
                  {item.label}
                </Link>
                {item.children && item.children.length ? (
                  <div className="ml-3 border-l border-line pl-2">
                    {item.children.map((c) => (
                      <Link
                        key={c.id}
                        href={c.url}
                        target={c.openInNew ? "_blank" : undefined}
                        className="block rounded-[var(--radius)] px-3 py-1.5 text-sm text-muted hover:text-fg"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            <Link href="/contact" className="btn btn-primary mt-2">
              Get in touch
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}
