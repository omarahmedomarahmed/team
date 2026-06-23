import type { CollectionSectionData } from "@/lib/types";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";

type TestimonialItem = {
  id: string;
  author: string;
  role: string | null;
  company: string | null;
  quote: string;
  rating: number;
};

function Stars({ rating }: { rating: number }) {
  const n = Math.max(1, Math.min(5, rating));
  return (
    <div className="flex gap-0.5 text-brand">
      {Array.from({ length: n }).map((_, i) => (
        <Icon key={i} name="star" size={15} fill="currentColor" strokeWidth={0} />
      ))}
    </div>
  );
}

export function Testimonials({
  data,
  items,
}: {
  data: CollectionSectionData;
  items: TestimonialItem[];
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

      <Stagger className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((t) => (
          <StaggerItem key={t.id} className="h-full">
            <figure className="card card-hover p-6 flex flex-col h-full">
              <Stars rating={t.rating} />
              <blockquote className="mt-4 text-sm leading-relaxed flex-1">“{t.quote}”</blockquote>
              <figcaption className="mt-5">
                <div className="font-semibold text-sm">{t.author}</div>
                <div className="text-xs text-muted">{[t.role, t.company].filter(Boolean).join(", ")}</div>
              </figcaption>
            </figure>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
