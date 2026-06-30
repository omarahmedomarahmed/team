import Link from "next/link";
import type { Experience } from "@prisma/client";
import type { ExperienceIndexData } from "@/lib/types";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";

function Card({ exp }: { exp: Experience }) {
  return (
    <Link href={`/experience/${exp.slug}`} className="card card-hover group flex h-full flex-col p-5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
        {exp.period ? <span>{exp.period}</span> : null}
        {exp.period && exp.category ? <span>·</span> : null}
        {exp.category ? <span>{exp.category}</span> : null}
      </div>
      <h3 className="mt-2 font-semibold leading-tight">{exp.company}</h3>
      {exp.role ? <p className="mt-1 line-clamp-2 text-sm text-muted">{exp.role}</p> : null}
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
        <div className="mt-12 space-y-12">
          {groups.map((g) => (
            <div key={g.name}>
              <h3 className="title-md mb-5">{g.name}</h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((exp) => (
                  <Card key={exp.id} exp={exp} />
                ))}
              </div>
            </div>
          ))}
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
