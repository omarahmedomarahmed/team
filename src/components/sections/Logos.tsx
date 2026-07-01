/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Experience, Logo } from "@prisma/client";
import type { LogosData } from "@/lib/types";
import { Reveal } from "@/components/motion/Reveal";

type Item = { key: string; name: string; imageUrl: string | null; href: string | null; scale: number };

/**
 * Companies / logos wall. Uses the manually-managed Logos collection when it has
 * any entries (add logos, reorder, and size each one), and otherwise falls back
 * to the logos uploaded on your Experience entries. Each logo's `scale` lets you
 * make small and large logos look visually consistent.
 */
export function Logos({
  data,
  logos = [],
  companies = [],
}: {
  data: LogosData;
  logos?: Logo[];
  companies?: Experience[];
}) {
  const items: Item[] = logos.length
    ? logos.map((l) => ({ key: l.id, name: l.name, imageUrl: l.imageUrl, href: l.url || null, scale: l.scale || 100 }))
    : companies
        .filter((c) => c.company)
        .map((c) => ({ key: c.id, name: c.company, imageUrl: c.logoUrl, href: `/experience/${c.slug}`, scale: 100 }));

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
          {items.map((it) => {
            const inner = it.imageUrl ? (
              <img
                src={it.imageUrl}
                alt={it.name}
                className="max-h-full max-w-full object-contain"
                style={{ transform: `scale(${(it.scale || 100) / 100})` }}
              />
            ) : (
              <span className="text-center text-sm font-semibold text-muted">{it.name}</span>
            );
            const cls = "media-frame flex h-24 items-center justify-center overflow-hidden p-5";
            return it.href ? (
              <Link key={it.key} href={it.href} className={`${cls} card-hover`} title={it.name}>
                {inner}
              </Link>
            ) : (
              <div key={it.key} className={cls} title={it.name}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
