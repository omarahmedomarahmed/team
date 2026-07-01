/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { TimelineYear, Experience } from "@prisma/client";
import { Reveal } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";
import { Placeholder } from "@/components/portfolio/Placeholder";
import { strArr, pairArr, initials } from "@/lib/portfolio";

/**
 * One career "year block" — a single reusable component (spec 4.12). Every year
 * uses the identical layout; only the content changes. Sits on the brand rail.
 */
export function YearBlock({ data, linked = [] }: { data: TimelineYear; linked?: Experience[] }) {
  const primary = linked[0];
  const tags = strArr(data.tags);
  const learningPoints = strArr(data.learningPoints).slice(0, 4);
  const stats = pairArr(data.stats, "label", "value");
  // Timeline image is editable here (Admin → Career timeline). Falls back to the
  // linked case study's cover so the image can be shared automatically.
  const cover = data.imageUrl || primary?.heroImageUrl;
  const coverSeed = primary?.slug || data.experienceSlug || data.stageTitle || String(data.year);

  return (
    <div className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 pb-12 md:gap-6 md:pb-16">
      {/* node on the rail */}
      <div className="flex justify-center pt-1.5">
        <span className="relative z-10 inline-flex h-4 w-4 items-center justify-center rounded-full border-2 border-brand bg-bg">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
        </span>
      </div>

      <Reveal>
        <div>
          <div className="flex items-center gap-4">
            {primary ? (
              <span className="media-frame flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden">
                {primary.logoUrl ? (
                  <img src={primary.logoUrl} alt={primary.company} className="h-full w-full object-contain p-1.5" />
                ) : (
                  <span className="text-sm font-bold text-brand">{initials(primary.company)}</span>
                )}
              </span>
            ) : null}
            <div className="min-w-0">
              <div className="text-xl font-bold text-brand md:text-2xl">{data.year}</div>
              <h3 className="title-lg leading-tight">{data.stageTitle}</h3>
            </div>
          </div>

          {tags.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>
          ) : null}

          {data.story ? <p className="mt-4 max-w-2xl leading-relaxed text-muted">{data.story}</p> : null}

          <div className="mt-5 grid gap-6 md:grid-cols-[1.3fr_minmax(0,1fr)] md:items-start">
            <div>
              {learningPoints.length ? (
                <ul className="space-y-2.5">
                  {learningPoints.map((p, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <Icon name="check" size={16} className="mt-0.5 shrink-0 text-brand" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {stats.length ? (
                <div className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
                  {stats.map((s, i) => (
                    <div key={i}>
                      <div className="text-xl font-semibold">{s.b}</div>
                      <div className="text-xs uppercase tracking-wide text-muted">{s.a}</div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="media-frame aspect-[4/3]">
              {cover ? (
                <img src={cover} alt={data.stageTitle} className="h-full w-full object-cover" />
              ) : (
                <Placeholder seed={coverSeed} />
              )}
            </div>
          </div>

          {data.takeaway ? (
            <p className="mt-6 border-l-2 border-brand pl-4 font-medium italic">{data.takeaway}</p>
          ) : null}
          {data.footerQuote ? <p className="mt-3 text-xs italic text-muted">{data.footerQuote}</p> : null}

          {linked.length ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {linked.map((e) => (
                <Link key={e.id} href={`/experience/${e.slug}`} className="btn btn-primary group">
                  {linked.length > 1 ? `View ${e.company}` : "View case study"}
                  <Icon name="arrow-right" size={16} className="btn-arrow" />
                </Link>
              ))}
            </div>
          ) : data.experienceSlug ? (
            <Link href={`/experience/${data.experienceSlug}`} className="btn btn-primary group mt-6">
              View case study
              <Icon name="arrow-right" size={16} className="btn-arrow" />
            </Link>
          ) : null}
        </div>
      </Reveal>
    </div>
  );
}
