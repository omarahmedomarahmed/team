import Link from "next/link";
import type { CollectionSectionData } from "@/lib/types";
import { SectionHeading } from "@/components/sections/SectionHeading";

type ServiceItem = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  icon: string | null;
};

export function Services({
  data,
  services,
}: {
  data: CollectionSectionData;
  services: ServiceItem[];
}) {
  return (
    <section className="container-x section-pad">
      <SectionHeading
        eyebrow={data.eyebrow}
        title={data.title}
        highlight={data.highlight}
        subtitle={data.subtitle}
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <Link
            key={s.id}
            href={`/services/${s.slug}`}
            className="card card-hover p-6 flex flex-col"
          >
            <div className="text-2xl">{s.icon || "✦"}</div>
            <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
            {s.summary ? (
              <p className="mt-2 text-sm text-muted leading-relaxed flex-1">{s.summary}</p>
            ) : null}
            <span className="mt-5 text-sm font-medium text-brand inline-flex items-center gap-1">
              Learn more →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
