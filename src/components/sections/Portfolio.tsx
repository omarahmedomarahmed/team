/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { CollectionSectionData } from "@/lib/types";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Placeholder } from "@/components/portfolio/Placeholder";

type ProjectItem = {
  id: string;
  slug: string;
  title: string;
  client: string | null;
  industry: string | null;
  category: string | null;
  summary: string | null;
  coverUrl: string | null;
  services: unknown;
};

export function Portfolio({
  data,
  projects,
}: {
  data: CollectionSectionData;
  projects: ProjectItem[];
}) {
  return (
    <section className="container-x section-pad">
      <Reveal>
        <SectionHeading
          eyebrow={data.eyebrow}
          title={data.title}
          highlight={data.highlight}
          subtitle={data.subtitle}
        />
      </Reveal>

      {/* 2 columns on mobile, 3 on web */}
      <Stagger className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-5">
        {projects.map((p) => {
          const tags = Array.isArray(p.services) ? (p.services as string[]) : [];
          return (
            <StaggerItem key={p.id}>
              <Link href={`/portfolio/${p.slug}`} className="card card-hover group overflow-hidden flex flex-col h-full">
                <div className="relative aspect-[4/3] overflow-hidden border-b border-line">
                  {p.coverUrl ? (
                    <img
                      src={p.coverUrl}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <Placeholder label={p.category || "Showcase"} />
                  )}
                  <span className="reveal-badge">
                    <Icon name="arrow-up-right" size={18} />
                  </span>
                </div>
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-[0.7rem] text-muted">
                    {p.category || p.industry ? <span>{p.category || p.industry}</span> : null}
                  </div>
                  <h3 className="mt-1 font-semibold leading-tight">{p.title}</h3>
                  {p.summary ? (
                    <p className="mt-1.5 text-xs text-muted leading-relaxed line-clamp-2 flex-1">{p.summary}</p>
                  ) : null}
                  {tags.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {tags.slice(0, 2).map((t) => (
                        <span key={t} className="chip text-[0.68rem] py-0.5 px-2">
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Link>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}
