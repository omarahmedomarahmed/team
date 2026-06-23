import type { CollectionSectionData } from "@/lib/types";
import { SectionHeading } from "@/components/sections/SectionHeading";

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
      <SectionHeading
        eyebrow={data.eyebrow}
        title={data.title}
        highlight={data.highlight}
        subtitle={data.subtitle}
      />
      <div className="mt-10 flex flex-wrap gap-3">
        {items.map((i) => (
          <span key={i.id} className="chip text-sm py-2 px-4 text-fg">
            {i.icon ? <span className="mr-1">{i.icon}</span> : null}
            {i.name}
          </span>
        ))}
      </div>
    </section>
  );
}
