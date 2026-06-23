/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { CollectionSectionData } from "@/lib/types";
import { SectionHeading } from "@/components/sections/SectionHeading";

type ProjectItem = {
  id: string;
  slug: string;
  title: string;
  client: string | null;
  industry: string | null;
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
      <SectionHeading
        eyebrow={data.eyebrow}
        title={data.title}
        highlight={data.highlight}
        subtitle={data.subtitle}
      />
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {projects.map((p) => {
          const tags = Array.isArray(p.services) ? (p.services as string[]) : [];
          return (
            <Link key={p.id} href={`/work/${p.slug}`} className="card card-hover overflow-hidden group">
              <div className="relative aspect-[16/10] overflow-hidden border-b border-line">
                {p.coverUrl ? (
                  <img
                    src={p.coverUrl}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-brand/30 to-accent/20 flex items-center justify-center">
                    <span className="text-4xl font-bold opacity-40">{p.title.slice(0, 2)}</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs text-muted">
                  {p.industry ? <span>{p.industry}</span> : null}
                  {p.client ? <span className="opacity-50">· {p.client}</span> : null}
                </div>
                <h3 className="mt-2 text-lg font-semibold">{p.title}</h3>
                {p.summary ? <p className="mt-2 text-sm text-muted leading-relaxed">{p.summary}</p> : null}
                {tags.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tags.slice(0, 4).map((t) => (
                      <span key={t} className="chip">
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
