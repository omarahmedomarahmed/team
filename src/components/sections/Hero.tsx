import Link from "next/link";
import type { HeroData } from "@/lib/types";

export function Hero({ data }: { data: HeroData }) {
  return (
    <section className="relative overflow-hidden">
      <div className="container-x pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="max-w-3xl">
          {data.eyebrow ? <span className="eyebrow">{data.eyebrow}</span> : null}
          <h1 className="title-xl mt-5">
            {data.title}{" "}
            {data.highlight ? <span className="gradient-text">{data.highlight}</span> : null}
          </h1>
          {data.subtitle ? <p className="lead mt-6 max-w-2xl">{data.subtitle}</p> : null}

          <div className="mt-9 flex flex-wrap items-center gap-3">
            {data.primaryCta ? (
              <Link href={data.primaryCta.href} className="btn btn-primary">
                {data.primaryCta.label}
              </Link>
            ) : null}
            {data.secondaryCta ? (
              <Link href={data.secondaryCta.href} className="btn btn-ghost">
                {data.secondaryCta.label}
              </Link>
            ) : null}
          </div>

          {data.badges && data.badges.length > 0 ? (
            <div className="mt-10 flex flex-wrap gap-2">
              {data.badges.map((b) => (
                <span key={b} className="chip">
                  {b}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
