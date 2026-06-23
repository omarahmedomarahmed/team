/* eslint-disable @next/next/no-img-element */
import type { CollectionSectionData } from "@/lib/types";
import { SectionHeading } from "@/components/sections/SectionHeading";

type TeamItem = {
  id: string;
  name: string;
  role: string;
  department: string | null;
  bio: string | null;
  photoUrl: string | null;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}

export function Team({ data, team }: { data: CollectionSectionData; team: TeamItem[] }) {
  return (
    <section className="container-x section-pad">
      <SectionHeading
        eyebrow={data.eyebrow}
        title={data.title}
        highlight={data.highlight}
        subtitle={data.subtitle}
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((m) => (
          <div key={m.id} className="card p-6 flex flex-col">
            <div className="flex items-center gap-4">
              {m.photoUrl ? (
                <img src={m.photoUrl} alt={m.name} className="h-14 w-14 rounded-full object-cover" />
              ) : (
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-brand/40 to-accent/30 flex items-center justify-center font-semibold">
                  {initials(m.name)}
                </div>
              )}
              <div>
                <h3 className="font-semibold leading-tight">{m.name}</h3>
                <p className="text-sm text-brand">{m.role}</p>
              </div>
            </div>
            {m.department ? (
              <p className="mt-4 text-xs uppercase tracking-wider text-muted">{m.department}</p>
            ) : null}
            {m.bio ? <p className="mt-2 text-sm text-muted leading-relaxed">{m.bio}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
