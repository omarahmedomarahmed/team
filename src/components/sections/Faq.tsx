import type { CollectionSectionData } from "@/lib/types";
import { SectionHeading } from "@/components/sections/SectionHeading";

type FaqItem = { id: string; question: string; answer: string };

export function Faq({ data, items }: { data: CollectionSectionData; items: FaqItem[] }) {
  return (
    <section className="container-x section-pad">
      <SectionHeading
        eyebrow={data.eyebrow}
        title={data.title}
        highlight={data.highlight}
        subtitle={data.subtitle}
      />
      <div className="mt-10 max-w-3xl divide-y divide-line card overflow-hidden">
        {items.map((f) => (
          <details key={f.id} className="group">
            <summary className="list-none cursor-pointer px-6 py-5 flex items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
              <span className="font-medium">{f.question}</span>
              <span className="text-brand transition-transform group-open:rotate-45 text-xl leading-none">+</span>
            </summary>
            <div className="px-6 pb-5 -mt-1 text-sm text-muted leading-relaxed">{f.answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
