/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { PortraitHeroData } from "@/lib/types";
import { Reveal } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";
import { Placeholder } from "@/components/portfolio/Placeholder";
import { HeroBackdrop } from "@/components/portfolio/HeroBackdrop";
import { initials } from "@/lib/portfolio";

export function PortraitHero({ data }: { data: PortraitHeroData }) {
  const roles = (data.roles || "")
    .split("•")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <section className="relative overflow-hidden border-b border-line">
      {data.bgImage ? (
        <>
          <img src={data.bgImage} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(180deg, color-mix(in oklab, var(--bg) 84%, transparent), color-mix(in oklab, var(--bg) 94%, transparent))",
            }}
          />
        </>
      ) : (
        <HeroBackdrop />
      )}

      <div className="container-x relative pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="grid items-center gap-12 md:grid-cols-[1.5fr_minmax(0,1fr)]">
          <div>
            {data.eyebrow ? (
              <Reveal>
                <span className="eyebrow">{data.eyebrow}</span>
              </Reveal>
            ) : null}

            <Reveal delay={0.05}>
              <h1 className="title-xl mt-5">{data.name}</h1>
            </Reveal>

            {roles.length ? (
              <Reveal delay={0.1}>
                <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 font-medium">
                  {roles.map((r, i) => (
                    <span key={r} className="inline-flex items-center gap-3">
                      {i > 0 ? <span className="h-1 w-1 rounded-full bg-brand" /> : null}
                      {r}
                    </span>
                  ))}
                </p>
              </Reveal>
            ) : null}

            {data.statement ? (
              <Reveal delay={0.15}>
                <p className="lead mt-6 max-w-xl">{data.statement}</p>
              </Reveal>
            ) : null}

            <Reveal delay={0.2}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                {data.primaryCta ? (
                  <Link href={data.primaryCta.href} className="btn btn-primary group">
                    {data.primaryCta.label}
                    <Icon name="arrow-right" size={18} className="btn-arrow" />
                  </Link>
                ) : null}
                {data.secondaryCta ? (
                  <Link href={data.secondaryCta.href} className="btn btn-ghost">
                    {data.secondaryCta.label}
                  </Link>
                ) : null}
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div className="relative mx-auto w-full max-w-xs">
              <div className="media-frame aspect-[4/5]">
                {data.portrait ? (
                  <img src={data.portrait} alt={data.name} className="h-full w-full object-cover" />
                ) : (
                  <Placeholder initials={initials(data.name || "")} seed={data.name} />
                )}
              </div>
              {data.periodLabel ? (
                <span className="chip absolute -bottom-3 left-1/2 -translate-x-1/2 bg-card">
                  {data.periodLabel}
                </span>
              ) : null}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.3}>
          <div className="mt-14 flex items-center gap-3 text-muted">
            <span className="h-8 w-0.5 bg-brand" />
            <Icon name="arrow-down" size={16} className="text-brand" />
            <span className="text-xs uppercase tracking-wider">Scroll the timeline</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
