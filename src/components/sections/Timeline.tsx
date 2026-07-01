import type { TimelineYear, Experience, Project } from "@prisma/client";
import type { TimelineData } from "@/lib/types";
import { Reveal } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";
import { YearBlock } from "@/components/portfolio/YearBlock";
import { TimelineMotif } from "@/components/portfolio/TimelineMotif";
import { strArr } from "@/lib/portfolio";

export function Timeline({
  data,
  years,
  experiences = [],
  projects = [],
}: {
  data: TimelineData;
  years: TimelineYear[];
  experiences?: Experience[];
  projects?: Project[];
}) {
  const byId = new Map(experiences.map((e) => [e.id, e]));
  const bySlug = new Map(experiences.map((e) => [e.slug, e]));

  // Portfolio items grouped by the experience they belong to (id, then legacy slug).
  const projectsByExp = new Map<string, Project[]>();
  for (const p of projects) {
    const expId = p.experienceId || (p.experienceSlug ? bySlug.get(p.experienceSlug)?.id : undefined);
    if (!expId) continue;
    const arr = projectsByExp.get(expId) ?? [];
    arr.push(p);
    projectsByExp.set(expId, arr);
  }

  // Each year links to its case study/studies by stable id (falling back to the
  // legacy slug), so renaming a case study never breaks the connection.
  const linkedFor = (y: TimelineYear): Experience[] => {
    const byIds = strArr(y.experienceIds).flatMap((id) => {
      const e = byId.get(id);
      return e ? [e] : [];
    });
    if (byIds.length) return byIds;
    const legacy = y.experienceSlug ? bySlug.get(y.experienceSlug) : undefined;
    return legacy ? [legacy] : [];
  };

  const projectsFor = (exps: Experience[]): Project[] => {
    const seen = new Set<string>();
    const out: Project[] = [];
    for (const e of exps) {
      for (const p of projectsByExp.get(e.id) ?? []) {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          out.push(p);
        }
      }
    }
    return out;
  };
  return (
    <section id="timeline" className="container-x section-pad">
      <Reveal>
        <div className="max-w-2xl">
          {data.eyebrow ? <span className="eyebrow">{data.eyebrow}</span> : null}
          {data.title ? <h2 className="title-lg mt-4">{data.title}</h2> : null}
          {data.intro ? <p className="lead mt-4">{data.intro}</p> : null}
        </div>
      </Reveal>

      <div className="relative mt-12 md:mt-16">
        {years.length ? <TimelineMotif /> : null}

        {years.map((y) => {
          const linked = linkedFor(y);
          return <YearBlock key={y.id} data={y} linked={linked} projects={projectsFor(linked)} />;
        })}

        {/* the rail ends in an open arrow — the journey is ongoing (spec 4.9) */}
        {years.length ? (
          <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 md:gap-6">
            <div className="flex justify-center">
              <span className="relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-bg text-brand">
                <Icon name="arrow-down" size={20} />
              </span>
            </div>
            <p className="self-center text-sm text-muted">The journey continues.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
