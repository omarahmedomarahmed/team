import Link from "next/link";
import type { HeroData } from "@/lib/types";
import { Reveal } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";

export function Hero({ data, hasBg = false }: { data: HeroData; hasBg?: boolean }) {
  return (
    <section className="relative overflow-hidden">
      <div className={`container-x ${hasBg ? "pt-32 pb-28 md:pt-44 md:pb-36" : "pt-24 pb-20 md:pt-32 md:pb-28"}`}>
        <div className="max-w-3xl">
          {data.eyebrow ? (
            <Reveal>
              <span className="eyebrow">{data.eyebrow}</span>
            </Reveal>
          ) : null}

          <Reveal delay={0.05}>
            <h1 className="title-xl mt-5">
              {data.title}{" "}
              {data.highlight ? (
                <span className="gradient-text gradient-animate">{data.highlight}</span>
              ) : null}
            </h1>
          </Reveal>

          {data.subtitle ? (
            <Reveal delay={0.12}>
              <p className="lead mt-6 max-w-2xl">{data.subtitle}</p>
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
                <Link href={data.secondaryCta.href} className="btn btn-ghost group">
                  {data.secondaryCta.label}
                  <Icon name="arrow-up-right" size={18} className="btn-arrow" />
                </Link>
              ) : null}
            </div>
          </Reveal>

          {data.badges && data.badges.length > 0 ? (
            <Reveal delay={0.28}>
              <div className="mt-10 flex flex-wrap gap-2">
                {data.badges.map((b) => (
                  <span key={b} className="chip">
                    {b}
                  </span>
                ))}
              </div>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
