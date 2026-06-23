import Link from "next/link";
import { getNav, getSettings } from "@/lib/site";
import { Logo } from "@/components/site/Logo";
import type { Social } from "@/lib/types";

export async function SiteFooter() {
  const [settings, nav] = await Promise.all([getSettings(), getNav("FOOTER")]);
  const socials = (settings.socials as Social[]) ?? [];
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line mt-10">
      <div className="container-x py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo settings={settings} />
          {settings.tagline ? (
            <p className="mt-4 text-sm text-muted leading-relaxed">{settings.tagline}</p>
          ) : null}
          {socials.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {socials.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="chip hover:text-fg">
                  {s.platform}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-4">Explore</h4>
          <ul className="space-y-2.5 text-sm text-muted">
            {nav.map((item) => (
              <li key={item.id}>
                <Link href={item.url} className="hover:text-fg transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-4">Contact</h4>
          <ul className="space-y-2.5 text-sm text-muted">
            {settings.email ? (
              <li>
                <a href={`mailto:${settings.email}`} className="hover:text-fg">
                  {settings.email}
                </a>
              </li>
            ) : null}
            {settings.phone ? (
              <li>
                <a href={`tel:${settings.phone}`} className="hover:text-fg">
                  {settings.phone}
                </a>
              </li>
            ) : null}
            {settings.address ? <li>{settings.address}</li> : null}
          </ul>
        </div>
      </div>

      <div className="hairline" />
      <div className="container-x py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
        <p>
          © {year} {settings.legalName || settings.siteName}. All rights reserved.
        </p>
        <p className="opacity-70">Built on the God Mode platform.</p>
      </div>
    </footer>
  );
}
