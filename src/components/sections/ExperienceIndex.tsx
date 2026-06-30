/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Experience } from "@prisma/client";
import type { ExperienceIndexData } from "@/lib/types";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";
import { initials } from "@/lib/portfolio";

function Card({ exp }: { exp: Experience }) {
  return (
    <Link href={`/experience/${exp.slug}`} className="card card-hover group flex h-full flex-col p-5">
      <div className="flex items-center gap-3">
        <span className="media-frame flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden">
          {exp.logoUrl ? (
            <img src={exp.logoUrl} alt={exp.company} className="h-full w-full object-contain p-1.5" />
          ) : (
            <span className="text-sm font-bold text-brand">{initials(exp.company)}</span>
          )}
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-semibold leading-tight">{exp.company}</h3>
          <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
            {exp.period ? <span>{exp.period}</span> : null}
            {exp.period && exp.category ? <span>·</span> : null}
            {exp.category ? <span className="truncate">{exp.category}</span> : null}
          </div>
        </div>
      </div>
      {exp.role ? <p className="mt-3 line-clamp-2 text-sm text-muted">{exp.role}</p> : null}
      <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-medium text-brand">
        View case study <Icon name="arrow-right" size={15} className="btn-arrow" />
      </span>
    </Link>
  );
}

export function ExperienceIndex({ data, items }: { data: ExperienceIndexData; items: Experience[] }) {
  const groups = data.groupByCategory
    ? Array.from(
        items.reduce((map, e) => {
          const k = e.category || "Other";
          if (!map.has(k)) map.set(k, [] as Experience[]);
          map.get(k)!.push(e);
          return map;
        }, new Map<string, Experience[]>()),
      ).map(([name, its]) => ({ name, items: its }))
    : null;
  const maxCount = groups ? Math.max(1, ...groups.map((g) => g.items.length)) : 1;

  return (
    <section className="container-x section-pad">
      <Reveal>
        <div className="max-w-2xl">
          {data.eyebrow ? <span className="eyebrow">{data.eyebrow}</span> : null}
          {data.title ? (
            <h2 className="title-lg mt-3">
              {data.title} {data.highlight ? <span className="gradient-text">{data.highlight}</span> : null}
            </h2>
          ) : null}
          {data.subtitle ? <p className="lead mt-3">{data.subtitle}</p> : null}
        </div>
      </Reveal>

      {groups ? (
        <div className="mt-10">
          {/* category distribution — a quick visual of roles per area */}
          <Reveal>
            <div className="card space-y-3 p-6">
              {groups.map((g) => (
                <div key={g.name} className="flex items-center gap-3 sm:gap-4">
                  <div className="w-36 shrink-0 truncate text-sm font-medium sm:w-52">{g.name}</div>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-bg-2">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${(g.items.length / maxCount) * 100}%` }} />
                  </div>
                  <div className="w-6 text-right text-sm tabular-nums text-muted">{g.items.length}</div>
                </div>
              ))}
            </div>
          </Reveal>

          <div className="mt-12 space-y-12">
            {groups.map((g) => (
              <div key={g.name}>
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <h3 className="title-md">{g.name}</h3>
                  <span className="chip">
                    {g.items.length} {g.items.length === 1 ? "role" : "roles"}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {g.items.map((exp) => (
                    <Card key={exp.id} exp={exp} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Stagger className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((exp) => (
            <StaggerItem key={exp.id} className="h-full">
              <Card exp={exp} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </section>
  );
}
