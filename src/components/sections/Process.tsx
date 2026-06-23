import type { ProcessData } from "@/lib/types";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";

export function Process({ data }: { data: ProcessData }) {
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

      <Stagger className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {data.steps.map((step, i) => (
          <StaggerItem key={step.title} className="h-full">
            <div className="card card-hover p-6 h-full group">
              <div className="text-sm font-mono text-brand transition-transform duration-300 group-hover:-translate-y-0.5">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-3 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">{step.description}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
