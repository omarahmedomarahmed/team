import type { CollectionSectionData } from "@/lib/types";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";

type IndustryItem = { id: string; name: string; icon: string | null };

export function Industries({
  data,
  items,
}: {
  data: CollectionSectionData;
  items: IndustryItem[];
}) {
  return (
    <section className="container-x section-pad">
      <Reveal>
        <SectionHeading
          eyebrow={data.eyebrow}
          title={data.title}
          highlight={data.highlight}
          subtitle={data.subtitle}
          center
        />
      </Reveal>

      <Stagger className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((i) => (
          <StaggerItem key={i.id}>
            <div className="industry-card group">
              <span className="icon-badge industry-icon">
                <Icon
                  name={i.icon}
                  size={24}
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110"
                />
              </span>
              <span className="mt-4 text-sm font-medium text-center">{i.name}</span>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
