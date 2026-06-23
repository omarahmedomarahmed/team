import type { CollectionSectionData } from "@/lib/types";
import { SectionHeading } from "@/components/sections/SectionHeading";

type TestimonialItem = {
  id: string;
  author: string;
  role: string | null;
  company: string | null;
  quote: string;
  rating: number;
};

export function Testimonials({
  data,
  items,
}: {
  data: CollectionSectionData;
  items: TestimonialItem[];
}) {
  return (
    <section className="container-x section-pad">
      <SectionHeading
        eyebrow={data.eyebrow}
        title={data.title}
        highlight={data.highlight}
        subtitle={data.subtitle}
        center
      />
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((t) => (
          <figure key={t.id} className="card p-6 flex flex-col">
            <div className="text-brand text-sm tracking-widest">{"★".repeat(Math.max(1, Math.min(5, t.rating)))}</div>
            <blockquote className="mt-4 text-sm leading-relaxed flex-1">“{t.quote}”</blockquote>
            <figcaption className="mt-5">
              <div className="font-semibold text-sm">{t.author}</div>
              <div className="text-xs text-muted">
                {[t.role, t.company].filter(Boolean).join(", ")}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
