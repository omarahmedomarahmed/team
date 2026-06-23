import type { CollectionSectionData } from "@/lib/types";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/motion/Reveal";

type FaqItem = { id: string; question: string; answer: string };

export function Faq({ data, items }: { data: CollectionSectionData; items: FaqItem[] }) {
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

      <Reveal delay={0.08}>
        <div className="mt-10 max-w-3xl mx-auto divide-y divide-line card overflow-hidden">
          {items.map((f) => (
            <details key={f.id} className="group">
              <summary className="list-none cursor-pointer px-6 py-5 flex items-center justify-between gap-4 transition-colors hover:bg-[var(--card)] [&::-webkit-details-marker]:hidden">
                <span className="font-medium">{f.question}</span>
                <Icon
                  name="plus"
                  size={18}
                  className="text-brand shrink-0 transition-transform duration-300 group-open:rotate-45"
                />
              </summary>
              <div className="px-6 pb-5 -mt-1 text-sm text-muted leading-relaxed">{f.answer}</div>
            </details>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
