/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Experience } from "@prisma/client";
import type { LogosData } from "@/lib/types";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Companies / logos wall. Logos come from the Experience collection (each
 * company's uploaded logo), so there is a single place to manage them. Until a
 * logo is uploaded the company name renders as a clean text mark.
 */
export function Logos({ data, companies }: { data: LogosData; companies: Experience[] }) {
  const items = companies.filter((c) => c.company);
  if (!items.length && !data.title) return null;

  return (
    <section className="section-sage border-y border-line">
      <div className="container-x section-pad">
        {data.eyebrow || data.title || data.subtitle ? (
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              {data.eyebrow ? <span className="eyebrow">{data.eyebrow}</span> : null}
              {data.title ? <h2 className="title-lg mt-3">{data.title}</h2> : null}
              {data.subtitle ? <p className="lead mt-3">{data.subtitle}</p> : null}
            </div>
          </Reveal>
        ) : null}

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {items.map((c) => (
            <Link
              key={c.id}
              href={`/experience/${c.slug}`}
              className="media-frame card-hover flex h-24 items-center justify-center p-5"
              title={c.company}
            >
              {c.logoUrl ? (
                <img src={c.logoUrl} alt={c.company} className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-center text-sm font-semibold text-muted">{c.company}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
