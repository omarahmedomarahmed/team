import Link from "next/link";
import type { CollectionSectionData } from "@/lib/types";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";

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
      <Reveal>
        <SectionHeading
          eyebrow={data.eyebrow}
          title={data.title}
          highlight={data.highlight}
          subtitle={data.subtitle}
        />
      </Reveal>

      <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <StaggerItem key={s.id}>
            <Link href={`/services/${s.slug}`} className="card card-hover group p-6 flex flex-col h-full">
              <span className="icon-badge">
                <Icon name={s.icon} size={22} className="transition-transform duration-300 group-hover:scale-110" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
              {s.summary ? (
                <p className="mt-2 text-sm text-muted leading-relaxed flex-1">{s.summary}</p>
              ) : null}
              <span className="mt-5 text-sm font-medium text-brand inline-flex items-center gap-1.5">
                Learn more
                <Icon name="arrow-right" size={16} className="btn-arrow" />
              </span>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
