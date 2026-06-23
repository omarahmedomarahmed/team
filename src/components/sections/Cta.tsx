import Link from "next/link";
import type { CTAData } from "@/lib/types";

export function Cta({ data }: { data: CTAData }) {
  return (
    <section className="container-x py-16">
      <div className="card relative overflow-hidden p-10 md:p-16 text-center">
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{
            background:
              "radial-gradient(40rem 20rem at 50% 0%, color-mix(in oklab, var(--brand) 28%, transparent), transparent 70%)",
          }}
        />
        <h2 className="title-lg max-w-2xl mx-auto">
          {data.title} {data.highlight ? <span className="gradient-text">{data.highlight}</span> : null}
        </h2>
        {data.subtitle ? <p className="lead mt-4 max-w-xl mx-auto">{data.subtitle}</p> : null}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
      </div>
    </section>
  );
}
